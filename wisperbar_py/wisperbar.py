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
from scipy.signal import resample_poly
from math import gcd
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
    NSWindowCollectionBehaviorFullScreenAuxiliary,
    NSFloatingWindowLevel, NSStatusWindowLevel,
    NSScreenSaverWindowLevel, NSEvent,
    NSFont, NSFontAttributeName, NSForegroundColorAttributeName,
)
from Foundation import NSString

from llm_service import LLMService, LLMError, keychain_load, PROVIDER_LABELS
from vocab import build_initial_prompt
from workflows import (
    WORKFLOWS, WORKFLOW_BY_ID,
    get_system_prompt, get_processing_label, workflow_menu_label,
)
from config_panel import ConfigPanel
from i18n import t
from punctuation import process_punctuation
from sentence_parser import auto_punctuate_questions

# ── Constantes ────────────────────────────────────────────────────────────────

SAMPLE_RATE = 16_000
MODEL_REPO  = "mlx-community/whisper-large-v3-turbo"
# Motor faster-whisper (CTranslate2): base int8 es casi instantáneo en Apple
# Silicon. Se activa cuando whisper_model apunta a un repo faster-whisper.
_FW_MODEL      = None   # WhisperModel cacheado (carga única en warmup)
_FW_MODEL_REPO = None   # repo con el que se cargó, para recargar si cambia
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
    "workflow":               "transcribir",
    "language":               "auto",
    # LLM provider selection
    "llm_provider":           "ollama",
    # Per-provider model + base URL (API keys go to Keychain, not here)
    "ollama_url":             "http://localhost:11434",
    "ollama_model":           "",
    "ollama_timeout":         60,
    "anthropic_model":        "claude-sonnet-4-6",
    "anthropic_base_url":     "",
    "openai_model":           "gpt-4o",
    "openai_base_url":        "",
    "generic_model":          "",
    "generic_base_url":       "",
    # Other
    "user_terms":             [],
    "emoji_density":          "media",
    "whisper_model":          "mlx-community/whisper-large-v3-turbo",
    "hotkey_mode":            "hold",
    "tone_mejorar":           "neutral",
    "tone_profesional":       "neutral",
    "custom_prompt_mejorar":  "",
    "custom_prompt_profesional": "",
    "custom_prompt_desahogo": "",
    "context_mejorar":        "",
}

_lock_fd = None


# ── ASR-Engine ────────────────────────────────────────────────────────────────

def _is_faster_whisper(repo: str) -> bool:
    r = repo.lower()
    return "faster-whisper" in r or r.startswith("systran/")


def _get_fw_model(repo: str):
    """Carga (una vez) el WhisperModel de faster-whisper. int8/CPU = más rápido
    en Apple Silicon. Se recarga solo si el repo configurado cambió."""
    global _FW_MODEL, _FW_MODEL_REPO
    if _FW_MODEL is None or _FW_MODEL_REPO != repo:
        from faster_whisper import WhisperModel
        _FW_MODEL      = WhisperModel(repo, device="cpu", compute_type="int8")
        _FW_MODEL_REPO = repo
    return _FW_MODEL


def run_asr(audio, model_repo: str, lang, prompt) -> tuple[str, str]:
    """Transcribe audio → (texto, idioma_detectado). Selecciona motor por repo:
    faster-whisper (CTranslate2, casi instantáneo) o mlx_whisper. El contrato de
    retorno es idéntico para ambos, así el resto del pipeline no cambia."""
    if _is_faster_whisper(model_repo):
        model          = _get_fw_model(model_repo)
        segments, info = model.transcribe(
            audio, language=lang, initial_prompt=prompt,
            beam_size=1, condition_on_previous_text=False,
        )
        text = "".join(seg.text for seg in segments)
        return text, (info.language or "")
    result = mlx_whisper.transcribe(
        audio, path_or_hf_repo=model_repo,
        language=lang, task="transcribe",
        initial_prompt=prompt, condition_on_previous_text=False,
    )
    return result["text"], result.get("language", "")


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

_LANG_FLAGS = {"es": "🇪🇸", "en": "🇺🇸", "de": "🇩🇪"}


def lang_badge(code: str) -> str:
    """Badge de idioma para el overlay: bandera + código. En auto (idioma aún
    no detectado) muestra el globo; idiomas detectados sin bandera propia
    muestran globo + código (ej: '🌐 FR')."""
    if not code or code == "auto":
        return "🌐"
    return f"{_LANG_FLAGS.get(code, '🌐')} {code.upper()}"


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
            self._badge_attrs = {
                NSFontAttributeName: NSFont.boldSystemFontOfSize_(13.0),
                NSForegroundColorAttributeName:
                    NSColor.colorWithRed_green_blue_alpha_(1.0, 1.0, 1.0, 0.92),
            }
            self._set_badge("auto")
        return self

    @objc.python_method
    def _set_badge(self, code: str):
        # Cachear NSString + tamaño: drawRect corre a 60fps, no recalcular ahí
        self._badge_str  = NSString.stringWithString_(lang_badge(code))
        self._badge_size = self._badge_str.sizeWithAttributes_(self._badge_attrs)

    @objc.python_method
    def set_lang(self, code: str):
        self._set_badge(code)
        self.setNeedsDisplay_(True)

    @objc.python_method
    def set_mode(self, mode: str):
        self._mode    = mode
        self._flash_t = 1.5 if mode in ("done", "error") else 0.0
        self.setNeedsDisplay_(True)

    @objc.python_method
    def tick(self, levels_deque):
        try:
            src = list(levels_deque) if levels_deque else [0.0]
        except RuntimeError:
            # El callback de PortAudio muta el deque en otro thread: saltear frame
            return
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

    @objc.python_method
    def _draw_badge(self, h):
        # Badge de idioma a la izquierda del pill, centrado verticalmente
        self._badge_str.drawAtPoint_withAttributes_(
            (18.0, (h - self._badge_size.height) / 2.0), self._badge_attrs
        )

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
            # Flash verde muestra el idioma detectado (útil en modo auto)
            self._draw_badge(h)
            return

        if mode == "error":
            alpha = min(self._flash_t / 1.5, 1.0)
            NSColor.colorWithRed_green_blue_alpha_(0.85, 0.15, 0.15, 0.92 * alpha).setFill()
            pill.fill()
            return

        # Fondo oscuro sólido — visible en modo claro y oscuro
        NSColor.colorWithRed_green_blue_alpha_(0.08, 0.08, 0.12, 0.94).setFill()
        pill.fill()
        # Borde claro marcado — separa el pill de fondos oscuros
        NSColor.colorWithRed_green_blue_alpha_(1.0, 1.0, 1.0, 0.38).setStroke()
        pill.setLineWidth_(1.5)
        pill.stroke()

        self._draw_badge(h)

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

        # Modo waveform (barras) — pad izquierdo mayor: deja lugar al badge
        pad_l  = 72.0
        pad_r  = 36.0
        bar_w  = 4.0
        area_w = w - pad_l - pad_r
        gap    = (area_w - BAR_COUNT * bar_w) / max(BAR_COUNT - 1, 1)

        for i, lvl in enumerate(self._current):
            idle   = 0.14 + 0.08 * np.sin(self._idle_t * 3.8 + i * 0.45)
            height = max(idle * h * 0.9, lvl * h * 0.82)
            x      = pad_l + i * (bar_w + gap)
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

    SIZE = (460.0, 68.0)

    def __init__(self):
        ow, oh = self.SIZE

        # NSWindowStyleMaskNonactivatingPanel = 128 — necesario para apps background
        style  = NSWindowStyleMaskBorderless | 128

        self._win = NSPanel.alloc().initWithContentRect_styleMask_backing_defer_(
            ((0.0, 0.0), (ow, oh)),
            style,
            NSBackingStoreBuffered,
            False,
        )
        # NSScreenSaverWindowLevel (1000) — por encima de toda app, incluso fullscreen
        self._win.setLevel_(NSScreenSaverWindowLevel)
        self._win.setOpaque_(False)
        self._win.setBackgroundColor_(NSColor.clearColor())
        # FullScreenAuxiliary: sin esto el overlay no aparece sobre Spaces fullscreen
        self._win.setCollectionBehavior_(
            NSWindowCollectionBehaviorCanJoinAllSpaces |
            NSWindowCollectionBehaviorStationary |
            NSWindowCollectionBehaviorIgnoresCycle |
            NSWindowCollectionBehaviorFullScreenAuxiliary
        )
        self._win.setHasShadow_(True)
        self._win.setIgnoresMouseEvents_(True)
        self._win.setReleasedWhenClosed_(False)
        self._win.setAlphaValue_(1.0)

        self._view = WaveformView.alloc().initWithFrame_(((0.0, 0.0), (ow, oh)))
        self._win.setContentView_(self._view)
        self._reposition()

    def _reposition(self):
        # Pantalla donde está el cursor — ahí dicta el usuario
        loc    = NSEvent.mouseLocation()
        screen = NSScreen.mainScreen()
        for s in NSScreen.screens():
            f = s.frame()
            if (f.origin.x <= loc.x <= f.origin.x + f.size.width and
                    f.origin.y <= loc.y <= f.origin.y + f.size.height):
                screen = s
                break
        f      = screen.frame()
        ow, oh = self.SIZE
        ox     = f.origin.x + (f.size.width - ow) / 2.0
        oy     = f.origin.y + 90.0
        self._win.setFrame_display_(((ox, oy), (ow, oh)), True)

    def show(self):
        self._reposition()
        self._win.orderFrontRegardless()

    def hide(self):
        self._win.orderOut_(None)

    def update(self, levels):
        self._view.tick(levels)

    def set_mode(self, mode: str):
        self._view.set_mode(mode)

    def set_lang(self, code: str):
        self._view.set_lang(code)

    def tick_processing(self):
        self._view.tick_processing()

    def visible(self) -> bool:
        return bool(self._win.isVisible())


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
        self._toggle_active = False
        self._overlay       = None
        self._main_q        = queue.Queue()
        self._llm           = LLMService(timeout=int(self._cfg.get("ollama_timeout", 60)))
        self._llm_ok        = False
        self._llm_model     = self._cfg.get("ollama_model", "")
        self._llm_models: list[str] = []
        self._spinner_frames = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        self._spinner_idx    = 0
        self._spinner_active = False
        self._spinner_ticks  = 0
        self._config_panel  = None
        self._session_gen   = 0
        self._hide_timer    = None

        self._build_menu()
        threading.Thread(target=self._load_model, daemon=True).start()
        threading.Thread(target=self._check_llm, daemon=True).start()

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
        lg = self._ui_lang()
        self.btn_record  = rumps.MenuItem(t("menu_record", lg), callback=self.toggle)
        self.lbl_status  = rumps.MenuItem(t("status_loading", lg))
        self.lbl_ollama  = rumps.MenuItem(t("ollama_checking", lg))

        self.lang_items = []
        for flag, name, code in LANGUAGES:
            item = rumps.MenuItem(f"{flag}  {name}", callback=self._set_lang)
            item._lang_code = code
            item.state = (code == self.lang_code)
            self.lang_items.append(item)

        self.workflow_items = []
        for wf in WORKFLOWS:
            item = rumps.MenuItem(
                workflow_menu_label(wf, lg),
                callback=self._set_workflow,
            )
            item._workflow_id = wf.id
            item.state = (wf.id == self._workflow_id)
            self.workflow_items.append(item)

        self.lbl_version = rumps.MenuItem(f"WisperBar v{APP_VERSION}  •  build {APP_BUILD}")

        self.btn_config = rumps.MenuItem(t("menu_config", lg), callback=self._open_config)

        self.menu = [
            self.lbl_version,
            self.btn_config,
            None,
            self.btn_record,
            None,
            self.lbl_status,
            self.lbl_ollama,
            None,
            *self.workflow_items,
            None,
            *self.lang_items,
            None,
            rumps.MenuItem(t("menu_quit", lg), callback=lambda _: rumps.quit_application()),
        ]
        self._refresh_actions()

    def _ui_lang(self) -> str:
        return self.lang_code if self.lang_code != "auto" else "es"

    # ── Overlay-Timer ─────────────────────────────────────────────────────────

    @rumps.timer(0.016)
    def _overlay_tick(self, _):
        # Drenar la cola completa: un item por tick reordena start/stop
        # respecto del estado leído en otros threads
        while True:
            try:
                fn = self._main_q.get_nowait()
            except queue.Empty:
                break
            try:
                fn()
            except Exception as exc:
                print(f"[WisperBar] error: {exc}", flush=True)

        if self.recording and self._overlay:
            self._overlay.update(self._levels)
            self.title = self._waveform()

        if self._overlay and not self.recording and self._overlay.visible():
            self._overlay.tick_processing()

        # Spinner en icono — cada 5 ticks ≈ 80ms
        if self._spinner_active:
            self._spinner_ticks += 1
            if self._spinner_ticks >= 5:
                self._spinner_ticks = 0
                self._spinner_idx   = (self._spinner_idx + 1) % len(self._spinner_frames)
                self.title = self._spinner_frames[self._spinner_idx]

    # ── Modell + Ollama laden ─────────────────────────────────────────────────

    def _ready_status(self) -> str:
        lg   = self._ui_lang()
        mode = self._cfg.get("hotkey_mode", "hold")
        return t("status_ready_hold" if mode == "hold" else "status_ready_toggle", lg)

    def _load_model(self):
        # Precalentar Whisper en background → primer dictado sin stall de carga
        model_repo = self._cfg.get("whisper_model", MODEL_REPO)
        try:
            warm = np.zeros(SAMPLE_RATE, dtype=np.float32)
            run_asr(warm, model_repo, None, None)
        except Exception as exc:
            print(f"[WisperBar] warmup error: {exc}", flush=True)
        self.model = True
        self._main_q.put(lambda: setattr(self.lbl_status, "title", self._ready_status()))

    def _get_llm_base_url(self, provider: str) -> str:
        if provider == "ollama":
            return self._cfg.get("ollama_url", "http://localhost:11434")
        return self._cfg.get(f"{provider}_base_url", "")

    def _get_llm_api_key(self, provider: str) -> str:
        if provider == "ollama":
            return ""
        return keychain_load(f"{provider}_api_key")

    def _get_llm_model(self, provider: str) -> str:
        if provider == "ollama":
            return self._cfg.get("ollama_model", "")
        return self._cfg.get(f"{provider}_model", "")

    def _check_llm(self):
        provider = self._cfg.get("llm_provider", "ollama")
        base_url = self._get_llm_base_url(provider)
        api_key  = self._get_llm_api_key(provider)
        is_up    = self._llm.is_available(provider, base_url, api_key)
        models: list[str] = []
        try:
            models = self._llm.list_models(provider, base_url, api_key)
        except Exception:
            pass
        if not self._llm_model:
            saved = self._get_llm_model(provider)
            self._llm_model = saved or self._llm.default_model(provider, models)
            key = "ollama_model" if provider == "ollama" else f"{provider}_model"
            self._cfg[key] = self._llm_model
            save_config(self._cfg)
        self._llm_ok     = is_up
        self._llm_models = models
        self._main_q.put(lambda p=provider, u=is_up: self._update_llm_label(p, u))

    def _update_llm_label(self, provider: str, ok: bool):
        lg    = self._ui_lang()
        plbl  = PROVIDER_LABELS.get(provider, provider)
        if ok and self._llm_model:
            self.lbl_ollama.title = f"🟢  {plbl}  •  {self._llm_model}"
        elif ok:
            self.lbl_ollama.title = t("ollama_active_no_model", lg)
        else:
            self.lbl_ollama.title = t("ollama_inactive", lg)

    # ── Aufnahme ──────────────────────────────────────────────────────────────

    def toggle(self, _=None):
        if self.model is None:
            lg = self._ui_lang()
            rumps.alert(t("alert_wait_title", lg), t("alert_wait_msg", lg))
            return
        if self.recording:
            self._stop()
        else:
            self._start()

    def _start(self):
        lg                    = self._ui_lang()
        # Invalidar el hide diferido de la sesión anterior: si no, el timer
        # de 1.6s del dictado previo oculta el overlay de ESTA grabación
        self._session_gen    += 1
        if self._hide_timer is not None:
            self._hide_timer.cancel()
            self._hide_timer = None
        self.recording        = True
        self.frames           = []
        self.transcript       = ""
        self._levels          = deque([0.0] * BAR_COUNT, maxlen=BAR_COUNT)
        pyperclip.copy("")
        self.btn_record.title = t("menu_stop", lg)
        self.lbl_status.title = t("status_recording", lg)
        self._refresh_actions()
        if self._overlay is None:
            self._overlay = WaveformOverlay()
        self._overlay.set_mode("waveform")
        self._overlay.set_lang(self.lang_code)
        self._overlay.show()
        threading.Thread(target=self._record_loop, daemon=True).start()

    def _record_loop(self):
        def callback(data, *_):
            # Thread de PortAudio: solo datos, nada de AppKit (self.title
            # off-main-thread causa glitches intermitentes en macOS 26)
            self.frames.append(data.copy())
            rms = float(np.sqrt(np.mean(data ** 2)))
            # Escala agresiva para que tonos normales llenen las barras
            scaled = min(rms * 40.0, 1.0)
            self._levels.append(scaled)

        def _queue_reset(err_msg: str):
            def _reset():
                lg = self._ui_lang()
                self.recording        = False
                self._toggle_active   = False
                self.btn_record.title = t("menu_record", lg)
                self._stop_spinner()
                if self._overlay:
                    self._overlay.hide()
                self.title            = self.name
                self.lbl_status.title = f"⚠️ {err_msg}"
            self._main_q.put(_reset)

        try:
            dev_info = sd.query_devices(kind="input")
            native_rate = int(dev_info["default_samplerate"])
            self._record_rate = native_rate
            # Retry once — PortAudio sometimes fails on first attempt after
            # another app held the mic, or when the audio unit is settling.
            try:
                stream_ctx = sd.InputStream(
                    samplerate=native_rate, channels=1, dtype="float32",
                    blocksize=BLOCK_SIZE, callback=callback,
                )
            except Exception:
                time.sleep(0.4)
                stream_ctx = sd.InputStream(
                    samplerate=native_rate, channels=1, dtype="float32",
                    blocksize=BLOCK_SIZE, callback=callback,
                )
            with stream_ctx:
                while self.recording:
                    time.sleep(0.02)
        except Exception as exc:
            # Python 3.13 deletes the 'exc' variable when the except block
            # exits, so closures cannot reference it. Capture as plain string.
            _queue_reset(str(exc))

    def _waveform(self):
        # Snapshot: el callback de PortAudio hace append en otro thread; iterar
        # el deque en vivo lanza "deque mutated during iteration"
        try:
            src = list(self._levels)
        except RuntimeError:
            return self.title
        peak = max(src) or 1e-6
        return "".join(
            BARS[min(int(v / peak * 8 + 0.5), 8)] for v in src
        )

    def _stop(self):
        lg                    = self._ui_lang()
        self.recording        = False
        self._toggle_active   = False
        self.btn_record.title = t("menu_record", lg)
        self.lbl_status.title = t("status_transcribing", lg)
        if self._overlay:
            self._overlay.set_mode("processing")
        self._start_spinner()
        threading.Thread(target=self._transcribe, daemon=True).start()

    # ── Transkription ─────────────────────────────────────────────────────────

    def _transcribe(self):
        # Cualquier excepción no capturada mataba el thread en silencio:
        # spinner infinito y overlay clavado en "processing". Acá se recupera
        # con flash rojo + mensaje en el menú.
        try:
            self._transcribe_impl()
        except Exception as exc:
            print(f"[WisperBar] transcribe error: {exc}", flush=True)
            err = str(exc)

            def _ui():
                self._stop_spinner()
                if self._overlay:
                    self._overlay.set_mode("error")
                    gen = self._session_gen

                    def _guarded_hide():
                        self._main_q.put(
                            lambda: self._overlay.hide()
                            if self._session_gen == gen and not self.recording else None
                        )
                    self._hide_timer = threading.Timer(1.6, _guarded_hide)
                    self._hide_timer.start()
                self.lbl_status.title = f"⚠️ {err[:80]}"
            self._main_q.put(_ui)

    def _transcribe_impl(self):
        def _done(text: str, wf_icon: str, detected: str, success: bool = True):
            self._stop_spinner()
            if self._overlay:
                # En auto el idioma se conoce recién ahora: el flash verde
                # muestra la bandera del idioma detectado
                if detected:
                    self._overlay.set_lang(detected)
                self._overlay.set_mode("done" if success else "error")
                # Ocultar overlay después del flash — solo si no arrancó
                # otra grabación mientras tanto (guardia por generación)
                gen = self._session_gen
                def _guarded_hide():
                    self._main_q.put(
                        lambda: self._overlay.hide()
                        if self._session_gen == gen and not self.recording else None
                    )
                self._hide_timer = threading.Timer(1.6, _guarded_hide)
                self._hide_timer.start()
            preview  = (text[:45] + "…") if len(text) > 45 else text
            lang_tag = f" [{detected}]" if detected and self.lang_code == "auto" else ""
            self.lbl_status.title = f'{wf_icon}{lang_tag}  "{preview}"'
            self._refresh_actions()

        def _abort(status: str):
            # Corre en thread de transcripción: toda la UI via main queue
            def _ui():
                self._stop_spinner()
                if self._overlay:
                    self._overlay.hide()
                self.lbl_status.title = status
            self._main_q.put(_ui)

        if not self.frames:
            _abort(self._ready_status())
            return

        audio_raw  = np.concatenate(self.frames).flatten()
        rec_rate   = getattr(self, "_record_rate", SAMPLE_RATE)
        if rec_rate != SAMPLE_RATE:
            g          = gcd(rec_rate, SAMPLE_RATE)
            audio_raw  = resample_poly(audio_raw, SAMPLE_RATE // g, rec_rate // g)
        silence    = np.zeros(SAMPLE_RATE, dtype=np.float32)

        # Si el audio es casi silencioso el mic no capturó nada → abortar
        if float(np.sqrt(np.mean(audio_raw ** 2))) < 0.002:
            _abort("🎙 Sin audio — verificá el micrófono")
            return

        audio      = np.concatenate([audio_raw, silence])
        lang       = None if self.lang_code == "auto" else self.lang_code
        user_terms = self._cfg.get("user_terms", [])
        prompt     = build_initial_prompt(self.lang_code, user_terms) or None

        # Fase 1: Whisper
        model_repo     = self._cfg.get("whisper_model", MODEL_REPO)
        text, detected = run_asr(audio, model_repo, lang, prompt)
        raw_text = auto_punctuate_questions(process_punctuation(text.strip()))

        # Filtrar alucinaciones conocidas de Whisper
        _HALLUCINATIONS = {
            "thank you", "thanks for watching", "thank you for watching",
            "thanks for watching!", "thank you.", "thanks.",
            "subtitles by the amara.org community",
        }
        if raw_text.lower().strip(".!? ") in _HALLUCINATIONS:
            raw_text = ""

        if not raw_text:
            _abort(self._ready_status())
            return

        # Fase 2: Ollama (si workflow lo requiere)
        wf_def     = WORKFLOW_BY_ID.get(self._workflow_id)
        final_text = raw_text
        wf_icon    = wf_def.icon if wf_def else "📝"

        if wf_def and wf_def.needs_ollama and self._llm_ok and self._llm_model:
            provider        = self._cfg.get("llm_provider", "ollama")
            base_url        = self._get_llm_base_url(provider)
            api_key         = self._get_llm_api_key(provider)
            effective_lang  = self.lang_code if self.lang_code != "auto" else (detected or "es")
            emoji_density   = self._cfg.get("emoji_density", "media")
            tone_key        = f"tone_{self._workflow_id}" if self._workflow_id in ("mejorar", "profesional") else "tone_mejorar"
            tone            = self._cfg.get(tone_key, "neutral")
            custom_prompt   = self._cfg.get(f"custom_prompt_{self._workflow_id}", "")
            context         = self._cfg.get("context_mejorar", "") if self._workflow_id == "mejorar" else ""
            system_prompt   = get_system_prompt(
                self._workflow_id, effective_lang, emoji_density,
                tone=tone, custom_prompt=custom_prompt, context=context,
            )
            proc_label      = get_processing_label(self._workflow_id, effective_lang)
            self._main_q.put(lambda lbl=proc_label: setattr(self.lbl_status, 'title', lbl))
            try:
                final_text = self._llm.chat(
                    provider=provider, model=self._llm_model,
                    base_url=base_url, api_key=api_key,
                    system=system_prompt, user=raw_text,
                )
            except LLMError as exc:
                print(f"[WisperBar] LLM error: {exc}", flush=True)
                plbl = PROVIDER_LABELS.get(provider, provider)
                self._main_q.put(lambda p=plbl: setattr(
                    self.lbl_ollama, 'title', f"⚠️  {p} no responde"
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
        self.lbl_status.title = self._ready_status()
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
                llm_service=self._llm,
                on_save=self._on_config_save,
                lang_fn=self._ui_lang,
            )
        self._config_panel.show(self._llm_models)

    def _on_config_save(self, new_cfg: dict):
        self._cfg          = new_cfg
        self._config_panel = None   # force rebuild next open (cfg ref changed)
        save_config(new_cfg)
        self._workflow_id = new_cfg.get("workflow", "transcribir")
        self._llm         = LLMService(timeout=int(new_cfg.get("ollama_timeout", 60)))
        provider          = new_cfg.get("llm_provider", "ollama")
        self._llm_model   = self._get_llm_model(provider)
        for item in self.workflow_items:
            item.state = (item._workflow_id == self._workflow_id)
        threading.Thread(target=self._check_llm, daemon=True).start()

    # ── Spinner ───────────────────────────────────────────────────────────────

    def _start_spinner(self):
        self._spinner_active = True
        self._spinner_idx    = 0
        self._spinner_ticks  = 0

    def _stop_spinner(self):
        self._spinner_active = False
        self.title = "🎤"

    # ── Left Option PTT / Toggle ──────────────────────────────────────────────

    # Los chequeos de estado (recording/model) corren DENTRO de los closures,
    # en el main thread. Leer self.recording desde el thread del listener
    # pierde el stop cuando la pulsación es más corta que un tick (16ms):
    # el release veía recording=False porque _start aún no había corrido.

    def _hold_start(self):
        if self.model and not self.recording:
            self._start()

    def _hold_stop(self):
        if self.recording:
            self._stop()

    def _toggle_flip(self):
        if self.recording:
            self._stop()
        elif self.model:
            self._toggle_active = True
            self._start()

    def _key_press(self, key):
        mode = self._cfg.get("hotkey_mode", "hold")
        if key == kb.Key.alt_r:
            if mode == "hold":
                if not self._fn_held:
                    self._fn_held = True
                    self._main_q.put(self._hold_start)
            else:  # toggle
                self._main_q.put(self._toggle_flip)
        elif key == kb.Key.esc and mode == "toggle":
            self._main_q.put(self._hold_stop)

    def _key_release(self, key):
        mode = self._cfg.get("hotkey_mode", "hold")
        if key == kb.Key.alt_r and mode == "hold":
            self._fn_held = False
            # Encolar siempre: FIFO garantiza que corre después del start
            self._main_q.put(self._hold_stop)

    # ── UI-Hilfe ──────────────────────────────────────────────────────────────

    def _refresh_actions(self):
        pass


if __name__ == "__main__":
    _acquire_lock()
    # Registro LaunchAgent en primer arranque (idempotente)
    from autostart import is_registered, register
    if not is_registered():
        register()
    WisperBar().run()
