#!/usr/bin/env python3
"""
WisperBar – lokale Spracheingabe als macOS Menüleisten-App
PTT-Shortcut: Right Option (⌥) halten → aufnehmen, loslassen → transkribieren
"""

import fcntl
import json
import os
import sys
import threading
import time
import subprocess
import queue
from collections import deque
from pathlib import Path

import numpy as np
import sounddevice as sd
import pyperclip
import rumps
import mlx_whisper
from pynput import keyboard as kb

import objc
from AppKit import (
    NSPanel, NSView, NSWindowStyleMaskBorderless,
    NSBackingStoreBuffered, NSScreen, NSColor, NSBezierPath,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
    NSWindowCollectionBehaviorStationary,
    NSWindowCollectionBehaviorIgnoresCycle,
    NSFloatingWindowLevel, NSStatusWindowLevel,
)

from ollama_service import OllamaService, OllamaError
from vocab import build_initial_prompt
from workflows import (
    WORKFLOWS, WORKFLOW_BY_ID,
    get_system_prompt, get_processing_label, workflow_menu_label,
)
from config_panel import ConfigPanel

# ── Constantes ────────────────────────────────────────────────────────────────

SAMPLE_RATE = 16_000
MODEL_REPO  = "mlx-community/whisper-large-v3-mlx"
LOCK_PATH   = "/tmp/wisperbar.lock"
APP_VERSION = os.environ.get("WISPERBAR_VERSION", "dev")
APP_BUILD   = os.environ.get("WISPERBAR_BUILD", "0")
BARS        = " ▁▂▃▄▅▆▇█"
BAR_COUNT   = 28
BLOCK_SIZE  = 512
LANGUAGES   = [
    ("🌐", "Auto-detect", "auto"),
    ("🇩🇪", "Deutsch",    "de"),
    ("🇺🇸", "English",    "en"),
    ("🇪🇸", "Español",    "es"),
]

CONFIG_PATH = Path(__file__).parent / "config.json"
CONFIG_DEFAULTS = {
    "workflow":       "transcribir",
    "language":       "auto",
    "ollama_url":     "http://localhost:11434",
    "ollama_model":   "",
    "ollama_timeout": 60,
    "user_terms":     [],
    "emoji_density":  "media",
}

_lock_fd = None


# ── Config ────────────────────────────────────────────────────────────────────

def load_config() -> dict:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH) as f:
                data = json.load(f)
            merged = {**CONFIG_DEFAULTS, **data}
            return merged
        except Exception:
            pass
    return dict(CONFIG_DEFAULTS)


def save_config(cfg: dict) -> None:
    try:
        with open(CONFIG_PATH, "w") as f:
            json.dump(cfg, f, indent=2, ensure_ascii=False)
            f.write("\n")
    except Exception as exc:
        print(f"[WisperBar] config save error: {exc}", flush=True)


def _acquire_lock():
    global _lock_fd
    _lock_fd = open(LOCK_PATH, "w")
    try:
        fcntl.flock(_lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("WisperBar läuft bereits.")
        sys.exit(0)


# ── Overlay ───────────────────────────────────────────────────────────────────

_OVERLAY_MODES = ("waveform", "processing", "done", "error")


class WaveformView(NSView):

    def initWithFrame_(self, frame):
        self = objc.super(WaveformView, self).initWithFrame_(frame)
        if self is not None:
            self._current  = [0.0] * BAR_COUNT
            self._targets  = [0.0] * BAR_COUNT
            self._idle_t   = 0.0
            self._proc_t   = 0.0
            self._flash_t  = 0.0
            self._mode     = "waveform"
        return self

    @objc.python_method
    def set_mode(self, mode: str):
        self._mode    = mode
        self._flash_t = 1.5 if mode in ("done", "error") else 0.0
        self.setNeedsDisplay_(True)

    @objc.python_method
    def tick(self, levels_deque):
        src   = list(levels_deque) if levels_deque else [0.0]
        peak  = max(src) or 1e-6
        norm  = [v / peak * 0.95 for v in src]
        ratio = len(norm) / BAR_COUNT
        self._targets = [
            norm[min(int(i * ratio), len(norm) - 1)]
            for i in range(BAR_COUNT)
        ]
        self._idle_t += 0.016
        for i in range(BAR_COUNT):
            self._current[i] += (self._targets[i] - self._current[i]) * 0.35
        self.setNeedsDisplay_(True)

    @objc.python_method
    def tick_processing(self):
        self._proc_t += 0.016
        if self._flash_t > 0:
            self._flash_t -= 0.016
        self.setNeedsDisplay_(True)

    def drawRect_(self, dirty):
        w = self.bounds().size.width
        h = self.bounds().size.height
        r = h / 2.0

        NSColor.clearColor().setFill()
        NSBezierPath.fillRect_(self.bounds())

        pill = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
            ((0.0, 0.0), (w, h)), r, r
        )

        mode = self._mode

        if mode == "done":
            alpha = min(self._flash_t / 1.5, 1.0)
            NSColor.colorWithRed_green_blue_alpha_(0.0, 0.72, 0.32, 0.92 * alpha).setFill()
            pill.fill()
            return

        if mode == "error":
            alpha = min(self._flash_t / 1.5, 1.0)
            NSColor.colorWithRed_green_blue_alpha_(0.85, 0.15, 0.15, 0.92 * alpha).setFill()
            pill.fill()
            return

        # Fondo oscuro sólido — visible en modo claro y oscuro
        NSColor.colorWithRed_green_blue_alpha_(0.08, 0.08, 0.12, 0.94).setFill()
        pill.fill()
        NSColor.colorWithRed_green_blue_alpha_(1.0, 1.0, 1.0, 0.18).setStroke()
        pill.setLineWidth_(1.0)
        pill.stroke()

        if mode == "processing":
            # 3 puntos pulsantes con desfase de 120° (2.09 rad)
            cx = w / 2.0
            dot_gap = 22.0
            for i in range(3):
                phase  = self._proc_t * 4.5 + i * 2.094
                scale  = 0.45 + 0.55 * (np.sin(phase) * 0.5 + 0.5)
                radius = 7.0 * scale
                dx     = cx + (i - 1) * dot_gap
                dy     = h / 2.0
                t      = i / 3.0
                rc     = 0.10 + t * 0.15
                gc     = 0.80 + t * 0.15
                bc     = 0.95 - t * 0.40
                NSColor.colorWithRed_green_blue_alpha_(rc, gc, bc, 0.90).setFill()
                NSBezierPath.bezierPathWithOvalInRect_(
                    ((dx - radius, dy - radius), (radius * 2, radius * 2))
                ).fill()
            return

        # Modo waveform (barras)
        pad_x  = 36.0
        bar_w  = 4.0
        area_w = w - pad_x * 2
        gap    = (area_w - BAR_COUNT * bar_w) / max(BAR_COUNT - 1, 1)

        for i, lvl in enumerate(self._current):
            idle   = 0.14 + 0.08 * np.sin(self._idle_t * 3.8 + i * 0.45)
            height = max(idle * h * 0.9, lvl * h * 0.82)
            x      = pad_x + i * (bar_w + gap)
            y      = (h - height) / 2.0
            t      = i / BAR_COUNT
            rc     = 0.10 + lvl * 0.20
            gc     = 0.85 + t * 0.12
            bc     = 0.95 - t * 0.40
            alpha  = 0.85 + lvl * 0.15
            NSColor.colorWithRed_green_blue_alpha_(rc, gc, bc, alpha).setFill()
            NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
                ((x, y), (bar_w, height)), bar_w / 2.0, bar_w / 2.0
            ).fill()

    def isOpaque(self):
        return False


class WaveformOverlay:

    def __init__(self):
        screen = NSScreen.mainScreen().frame()
        sw     = screen.size.width
        ow, oh = 460, 68
        ox     = (sw - ow) / 2.0
        oy     = 90.0

        # NSWindowStyleMaskNonactivatingPanel = 128 — necesario para apps background
        style  = NSWindowStyleMaskBorderless | 128

        self._win = NSPanel.alloc().initWithContentRect_styleMask_backing_defer_(
            ((ox, oy), (ow, oh)),
            style,
            NSBackingStoreBuffered,
            False,
        )
        # NSStatusWindowLevel (25) — por encima de ventanas normales y Dock
        self._win.setLevel_(NSStatusWindowLevel + 1)
        self._win.setOpaque_(False)
        self._win.setBackgroundColor_(NSColor.clearColor())
        self._win.setCollectionBehavior_(
            NSWindowCollectionBehaviorCanJoinAllSpaces |
            NSWindowCollectionBehaviorStationary |
            NSWindowCollectionBehaviorIgnoresCycle
        )
        self._win.setHasShadow_(True)
        self._win.setIgnoresMouseEvents_(True)
        self._win.setReleasedWhenClosed_(False)
        self._win.setAlphaValue_(1.0)

        self._view = WaveformView.alloc().initWithFrame_(((0.0, 0.0), (ow, oh)))
        self._win.setContentView_(self._view)

    def show(self):
        self._win.orderFrontRegardless()

    def hide(self):
        self._win.orderOut_(None)

    def update(self, levels):
        self._view.tick(levels)

    def set_mode(self, mode: str):
        self._view.set_mode(mode)

    def tick_processing(self):
        self._view.tick_processing()


# ── App ───────────────────────────────────────────────────────────────────────

class WisperBar(rumps.App):

    def __init__(self):
        super().__init__("🎤", quit_button=None)

        self._cfg           = load_config()
        self.recording      = False
        self.frames         = []
        self.transcript     = ""
        self.lang_code      = self._cfg.get("language", "auto")
        self._workflow_id   = self._cfg.get("workflow", "transcribir")
        self.model          = None
        self._levels        = deque([0.0] * BAR_COUNT, maxlen=BAR_COUNT)
        self._fn_held       = False
        self._overlay       = None
        self._main_q        = queue.Queue()
        self._ollama        = OllamaService(
            base_url=self._cfg.get("ollama_url", "http://localhost:11434"),
            timeout=int(self._cfg.get("ollama_timeout", 60)),
        )
        self._ollama_ok     = False
        self._ollama_model  = self._cfg.get("ollama_model", "")
        self._spinner_frames = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        self._spinner_idx    = 0
        self._spinner_active = False
        self._spinner_ticks  = 0
        self._config_panel  = None
        self._ollama_models  = []

        self._build_menu()
        threading.Thread(target=self._load_model, daemon=True).start()
        threading.Thread(target=self._check_ollama, daemon=True).start()

        try:
            self._listener = kb.Listener(
                on_press=self._key_press,
                on_release=self._key_release,
            )
            self._listener.daemon = True
            self._listener.start()
        except Exception:
            self._listener = None

    # ── Menü ──────────────────────────────────────────────────────────────────

    def _build_menu(self):
        self.btn_record  = rumps.MenuItem("⏺  Grabar", callback=self.toggle)
        self.lbl_status  = rumps.MenuItem("⏳  Cargando modelo…")
        self.lbl_ollama  = rumps.MenuItem("⏳  Ollama: comprobando…")
        self.btn_copy    = rumps.MenuItem("  Copiar",   callback=self.copy)
        self.btn_paste   = rumps.MenuItem("  Pegar",    callback=self.paste)
        self.btn_clear   = rumps.MenuItem("  Limpiar",  callback=self.clear)

        self.lang_items = []
        for flag, name, code in LANGUAGES:
            item = rumps.MenuItem(f"{flag}  {name}", callback=self._set_lang)
            item._lang_code = code
            item.state = (code == self.lang_code)
            self.lang_items.append(item)

        self.workflow_items = []
        for wf in WORKFLOWS:
            item = rumps.MenuItem(
                workflow_menu_label(wf, self._ui_lang()),
                callback=self._set_workflow,
            )
            item._workflow_id = wf.id
            item.state = (wf.id == self._workflow_id)
            self.workflow_items.append(item)

        self.lbl_version = rumps.MenuItem(f"WisperBar v{APP_VERSION}  •  build {APP_BUILD}")

        self.btn_config = rumps.MenuItem("⚙️  Configuración…", callback=self._open_config)

        self.menu = [
            self.lbl_version,
            None,
            self.btn_record,
            None,
            self.lbl_status,
            self.lbl_ollama,
            None,
            *self.workflow_items,
            None,
            self.btn_copy,
            self.btn_paste,
            self.btn_clear,
            None,
            *self.lang_items,
            None,
            self.btn_config,
            rumps.MenuItem("Salir", callback=lambda _: rumps.quit_application()),
        ]
        self._refresh_actions()

    def _ui_lang(self) -> str:
        return self.lang_code if self.lang_code != "auto" else "es"

    # ── Overlay-Timer ─────────────────────────────────────────────────────────

    @rumps.timer(0.016)
    def _overlay_tick(self, _):
        try:
            fn = self._main_q.get_nowait()
            try:
                fn()
            except Exception as exc:
                print(f"[WisperBar] error: {exc}", flush=True)
        except queue.Empty:
            pass

        if self.recording and self._overlay:
            self._overlay.update(self._levels)

        if self._overlay and not self.recording:
            self._overlay.tick_processing()

        # Spinner en icono — cada 5 ticks ≈ 80ms
        if self._spinner_active:
            self._spinner_ticks += 1
            if self._spinner_ticks >= 5:
                self._spinner_ticks = 0
                self._spinner_idx   = (self._spinner_idx + 1) % len(self._spinner_frames)
                self.title = self._spinner_frames[self._spinner_idx]

    # ── Modell + Ollama laden ─────────────────────────────────────────────────

    def _load_model(self):
        self.model = True
        self.lbl_status.title = "✅  Listo  —  mantener ⌥"

    def _check_ollama(self):
        models   = []
        is_up    = False
        try:
            is_up  = self._ollama.is_running()
            if is_up:
                models = self._ollama.list_models()
                if not self._ollama_model:
                    self._ollama_model = self._ollama.default_model(models)
                    self._cfg["ollama_model"] = self._ollama_model
                    save_config(self._cfg)
        except Exception:
            pass
        self._ollama_ok     = is_up
        self._ollama_models = models
        self._main_q.put(lambda: self._update_ollama_label(is_up, models))

    def _update_ollama_label(self, is_up: bool, models: list[str]):
        if is_up and self._ollama_model:
            self.lbl_ollama.title = f"🟢  Ollama  •  {self._ollama_model}"
        elif is_up:
            self.lbl_ollama.title = "🟢  Ollama activo (sin modelo)"
        else:
            self.lbl_ollama.title = "🔴  Ollama no detectado"

    # ── Aufnahme ──────────────────────────────────────────────────────────────

    def toggle(self, _=None):
        if self.model is None:
            rumps.alert("Bitte warten", "Das Sprachmodell wird noch geladen.")
            return
        if self.recording:
            self._stop()
        else:
            self._start()

    def _start(self):
        self.recording        = True
        self.frames           = []
        self.transcript       = ""
        self._levels          = deque([0.0] * BAR_COUNT, maxlen=BAR_COUNT)
        pyperclip.copy("")
        self.btn_record.title = "⏹  Parar"
        self.lbl_status.title = "●  Grabando…"
        self._refresh_actions()
        if self._overlay is None:
            self._overlay = WaveformOverlay()
        self._overlay.set_mode("waveform")
        self._overlay.show()
        threading.Thread(target=self._record_loop, daemon=True).start()

    def _record_loop(self):
        def callback(data, *_):
            self.frames.append(data.copy())
            rms = float(np.sqrt(np.mean(data ** 2)))
            # Escala agresiva para que tonos normales llenen las barras
            scaled = min(rms * 40.0, 1.0)
            self._levels.append(scaled)
            self.title = self._waveform()

        with sd.InputStream(
            samplerate=SAMPLE_RATE, channels=1, dtype="float32",
            blocksize=BLOCK_SIZE, callback=callback,
        ):
            while self.recording:
                time.sleep(0.02)

    def _waveform(self):
        peak = max(self._levels) or 1e-6
        return "".join(
            BARS[min(int(v / peak * 8 + 0.5), 8)] for v in self._levels
        )

    def _stop(self):
        self.recording        = False
        self.btn_record.title = "⏺  Grabar"
        self.lbl_status.title = "⏳  Transcribiendo…"
        if self._overlay:
            self._overlay.set_mode("processing")
        self._start_spinner()
        threading.Thread(target=self._transcribe, daemon=True).start()

    # ── Transkription ─────────────────────────────────────────────────────────

    def _transcribe(self):
        def _done(text: str, wf_icon: str, detected: str, success: bool = True):
            self._stop_spinner()
            if self._overlay:
                self._overlay.set_mode("done" if success else "error")
                # Ocultar overlay después del flash
                threading.Timer(1.6, lambda: self._main_q.put(self._overlay.hide)).start()
            preview  = (text[:45] + "…") if len(text) > 45 else text
            lang_tag = f" [{detected}]" if detected and self.lang_code == "auto" else ""
            self.lbl_status.title = f'{wf_icon}{lang_tag}  "{preview}"'
            self._refresh_actions()

        if not self.frames:
            self._stop_spinner()
            if self._overlay:
                self._main_q.put(self._overlay.hide)
            self.lbl_status.title = "✅  Listo  —  mantener ⌥"
            return

        silence    = np.zeros(SAMPLE_RATE * 3, dtype=np.float32)
        audio      = np.concatenate([np.concatenate(self.frames).flatten(), silence])
        lang       = None if self.lang_code == "auto" else self.lang_code
        user_terms = self._cfg.get("user_terms", [])
        prompt     = build_initial_prompt(self.lang_code, user_terms) or None

        # Fase 1: Whisper
        result   = mlx_whisper.transcribe(
            audio, path_or_hf_repo=MODEL_REPO,
            language=lang, task="transcribe",
            initial_prompt=prompt,
        )
        detected = result.get("language", "")
        raw_text = result["text"].strip()

        if not raw_text:
            self._stop_spinner()
            if self._overlay:
                self._main_q.put(self._overlay.hide)
            self.lbl_status.title = "✅  Listo  —  mantener ⌥"
            return

        # Fase 2: Ollama (si workflow lo requiere)
        wf_def     = WORKFLOW_BY_ID.get(self._workflow_id)
        final_text = raw_text
        wf_icon    = wf_def.icon if wf_def else "📝"
        ollama_ok  = False

        if wf_def and wf_def.needs_ollama and self._ollama_ok and self._ollama_model:
            effective_lang = self.lang_code if self.lang_code != "auto" else (detected or "es")
            emoji_density  = self._cfg.get("emoji_density", "media")
            system_prompt  = get_system_prompt(self._workflow_id, effective_lang, emoji_density)
            proc_label     = get_processing_label(self._workflow_id, effective_lang)
            self._main_q.put(lambda lbl=proc_label: setattr(self.lbl_status, 'title', lbl))
            try:
                final_text = self._ollama.chat(
                    model=self._ollama_model,
                    system=system_prompt,
                    user=raw_text,
                )
                ollama_ok = True
            except OllamaError as exc:
                print(f"[WisperBar] Ollama error: {exc}", flush=True)
                self._main_q.put(lambda: setattr(
                    self.lbl_ollama, 'title', "⚠️  Ollama no responde"
                ))

        self.transcript = final_text
        pyperclip.copy(final_text)
        self._paste_to_active_app()
        self._main_q.put(lambda: _done(final_text, wf_icon, detected))

    # ── Aktionen ──────────────────────────────────────────────────────────────

    def copy(self, _=None):
        if self.transcript:
            pyperclip.copy(self.transcript)

    def paste(self, _=None):
        if self.transcript:
            pyperclip.copy(self.transcript)
            threading.Thread(target=self._paste_to_active_app, daemon=True).start()

    def clear(self, _=None):
        self.transcript = ""
        self.lbl_status.title = "✅  Listo  —  mantener ⌥"
        self._refresh_actions()

    def _paste_to_active_app(self):
        time.sleep(0.35)
        try:
            ctrl = kb.Controller()
            with ctrl.pressed(kb.Key.cmd):
                ctrl.tap("v")
        except Exception:
            subprocess.run(
                ["osascript", "-e",
                 'tell application "System Events" to keystroke "v" using command down'],
                capture_output=True,
            )

    # ── Sprache ───────────────────────────────────────────────────────────────

    def _set_lang(self, sender):
        self.lang_code          = sender._lang_code
        self._cfg["language"]   = self.lang_code
        save_config(self._cfg)
        for item in self.lang_items:
            item.state = (item._lang_code == self.lang_code)

    def _set_workflow(self, sender):
        self._workflow_id       = sender._workflow_id
        self._cfg["workflow"]   = self._workflow_id
        save_config(self._cfg)
        for item in self.workflow_items:
            item.state = (item._workflow_id == self._workflow_id)

    # ── Config Panel ─────────────────────────────────────────────────────────

    def _open_config(self, _=None):
        if self._config_panel is None:
            self._config_panel = ConfigPanel(
                cfg=self._cfg,
                ollama_service=self._ollama,
                on_save=self._on_config_save,
            )
        self._config_panel.show(self._ollama_models)

    def _on_config_save(self, new_cfg: dict):
        self._cfg          = new_cfg
        save_config(new_cfg)
        self._workflow_id  = new_cfg.get("workflow", "transcribir")
        self._ollama_model = new_cfg.get("ollama_model", "")
        self._ollama = OllamaService(
            base_url=new_cfg.get("ollama_url", "http://localhost:11434"),
            timeout=int(new_cfg.get("ollama_timeout", 60)),
        )
        for item in self.workflow_items:
            item.state = (item._workflow_id == self._workflow_id)
        threading.Thread(target=self._check_ollama, daemon=True).start()

    # ── Spinner ───────────────────────────────────────────────────────────────

    def _start_spinner(self):
        self._spinner_active = True
        self._spinner_idx    = 0
        self._spinner_ticks  = 0

    def _stop_spinner(self):
        self._spinner_active = False
        self.title = "🎤"

    # ── Right Option PTT ──────────────────────────────────────────────────────

    def _key_press(self, key):
        if key == kb.Key.alt_r and not self._fn_held:
            self._fn_held = True
            if self.model and not self.recording:
                self._main_q.put(self._start)

    def _key_release(self, key):
        if key == kb.Key.alt_r:
            self._fn_held = False
            if self.recording:
                self._main_q.put(self._stop)

    # ── UI-Hilfe ──────────────────────────────────────────────────────────────

    def _refresh_actions(self):
        has = bool(self.transcript)
        self.btn_copy.title  = "  Kopieren" if has else "  Kopieren   (kein Text)"
        self.btn_paste.title = "  Einfügen" if has else "  Einfügen   (kein Text)"
        self.btn_clear.title = "  Löschen"  if has else "  Löschen    (kein Text)"


if __name__ == "__main__":
    _acquire_lock()
    WisperBar().run()
