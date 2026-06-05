#!/usr/bin/env python3
"""
WisperBar – lokale Spracheingabe als macOS Menüleisten-App
PTT-Shortcut: Right Option (⌥) halten → aufnehmen, loslassen → transkribieren
"""

import fcntl
import sys
import threading
import time
import subprocess
import queue
from collections import deque
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
    NSFloatingWindowLevel,
)

import os

SAMPLE_RATE = 16_000
MODEL_REPO  = "mlx-community/whisper-large-v3-mlx"
LOCK_PATH   = "/tmp/wisperbar.lock"
APP_VERSION = os.environ.get("WISPERBAR_VERSION", "dev")
APP_BUILD   = os.environ.get("WISPERBAR_BUILD", "0")
BARS        = " ▁▂▃▄▅▆▇█"
BAR_COUNT   = 28
BLOCK_SIZE  = 512   # 32 ms per callback — rápido para la animación
LANGUAGES   = [
    ("🌐", "Auto-detect", "auto"),
    ("🇩🇪", "Deutsch",    "de"),
    ("🇺🇸", "English",    "en"),
    ("🇪🇸", "Español",    "es"),
]

_lock_fd = None


def _acquire_lock():
    global _lock_fd
    _lock_fd = open(LOCK_PATH, "w")
    try:
        fcntl.flock(_lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("WisperBar läuft bereits.")
        sys.exit(0)


# ── Overlay ───────────────────────────────────────────────────────────────────

class WaveformView(NSView):

    def initWithFrame_(self, frame):
        self = objc.super(WaveformView, self).initWithFrame_(frame)
        if self is not None:
            self._current = [0.0] * BAR_COUNT
            self._targets  = [0.0] * BAR_COUNT
            self._idle_t   = 0.0
        return self

    @objc.python_method
    def tick(self, levels_deque):
        src = list(levels_deque) if levels_deque else [0.0] * BAR_COUNT
        # Padding / trim para garantizar BAR_COUNT elementos
        while len(src) < BAR_COUNT:
            src.append(0.0)
        self._targets = src[:BAR_COUNT]
        self._idle_t += 0.032
        # Lerp rápido hacia arriba (0.6), lento hacia abajo (0.15) — responde a picos
        for i in range(BAR_COUNT):
            diff = self._targets[i] - self._current[i]
            alpha = 0.6 if diff > 0 else 0.15
            self._current[i] += diff * alpha
        self.setNeedsDisplay_(True)

    def drawRect_(self, dirty):
        w = self.bounds().size.width
        h = self.bounds().size.height

        NSColor.clearColor().setFill()
        NSBezierPath.fillRect_(self.bounds())

        # Pill background with subtle border glow
        NSColor.colorWithRed_green_blue_alpha_(0.12, 0.75, 0.60, 0.18).setFill()
        NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
            ((-1.0, -1.0), (w + 2, h + 2)), (h + 2) / 2, (h + 2) / 2
        ).fill()

        NSColor.colorWithRed_green_blue_alpha_(0.07, 0.08, 0.10, 0.95).setFill()
        NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
            ((0.0, 0.0), (w, h)), h / 2, h / 2
        ).fill()

        # Bars
        pad_x  = 40.0
        bar_w  = 4.0
        area_w = w - pad_x * 2
        gap    = (area_w - BAR_COUNT * bar_w) / max(BAR_COUNT - 1, 1)

        for i, lvl in enumerate(self._current):
            idle   = 0.12 + 0.08 * np.sin(self._idle_t * 4.0 + i * 0.5)
            height = max(idle * h, lvl * h)
            x      = pad_x + i * (bar_w + gap)
            y      = (h - height) / 2.0

            t      = i / BAR_COUNT
            bright = 0.55 + lvl * 0.45
            rc     = 0.04 * bright
            gc     = (0.82 + t * 0.15) * bright
            bc     = (0.90 - t * 0.30) * bright
            alpha  = 0.75 + lvl * 0.25

            NSColor.colorWithRed_green_blue_alpha_(rc, gc, bc, alpha).setFill()
            NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
                ((x, y), (bar_w, height)), bar_w / 2.0, bar_w / 2.0
            ).fill()

    def isOpaque(self):
        return False


class WaveformOverlay:

    def __init__(self):
        # visibleFrame excluye Dock y barra de menú
        visible = NSScreen.mainScreen().visibleFrame()
        sw  = visible.size.width
        sox = visible.origin.x
        soy = visible.origin.y   # borde inferior justo encima del Dock
        ow, oh = 480, 72
        ox  = sox + (sw - ow) / 2.0
        oy  = soy + 16            # 16 px sobre el Dock

        self._win = NSPanel.alloc().initWithContentRect_styleMask_backing_defer_(
            ((ox, oy), (ow, oh)),
            NSWindowStyleMaskBorderless,
            NSBackingStoreBuffered,
            False,
        )
        self._win.setLevel_(NSFloatingWindowLevel + 2)
        self._win.setOpaque_(False)
        self._win.setBackgroundColor_(NSColor.clearColor())
        self._win.setCollectionBehavior_(NSWindowCollectionBehaviorCanJoinAllSpaces)
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


# ── App ───────────────────────────────────────────────────────────────────────

class WisperBar(rumps.App):

    def __init__(self):
        super().__init__("🎤", quit_button=None)

        self.recording  = False
        self.frames     = []
        self.transcript = ""
        self.lang_code  = "auto"
        self.model      = None
        self._levels    = deque([0.0] * BAR_COUNT, maxlen=BAR_COUNT)
        self._fn_held   = False
        self._overlay   = None
        self._main_q    = queue.Queue()

        self._build_menu()
        threading.Thread(target=self._load_model, daemon=True).start()

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
        self.btn_record = rumps.MenuItem("⏺  Aufnehmen", callback=self.toggle)
        self.lbl_status = rumps.MenuItem("⏳  Modell wird geladen…")
        self.btn_copy   = rumps.MenuItem("  Kopieren",  callback=self.copy)
        self.btn_paste  = rumps.MenuItem("  Einfügen",  callback=self.paste)
        self.btn_clear  = rumps.MenuItem("  Löschen",   callback=self.clear)

        self.lang_items = []
        for flag, name, code in LANGUAGES:
            item = rumps.MenuItem(f"{flag}  {name}", callback=self._set_lang)
            item._lang_code = code
            item.state = (code == self.lang_code)
            self.lang_items.append(item)

        self.lbl_version = rumps.MenuItem(f"WisperBar v{APP_VERSION}  •  build {APP_BUILD}")

        self.menu = [
            self.lbl_version,
            None,
            self.btn_record,
            None,
            self.lbl_status,
            None,
            self.btn_copy,
            self.btn_paste,
            self.btn_clear,
            None,
            *self.lang_items,
            None,
            rumps.MenuItem("Beenden", callback=lambda _: rumps.quit_application()),
        ]
        self._refresh_actions()

    # ── Overlay-Timer ─────────────────────────────────────────────────────────

    @rumps.timer(0.05)
    def _overlay_tick(self, _):
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

    # ── Modell laden ──────────────────────────────────────────────────────────

    def _load_model(self):
        try:
            from huggingface_hub import snapshot_download
            self.lbl_status.title = "⬇️  Descargando modelo…"
            snapshot_download(repo_id=MODEL_REPO)
            self.model = True
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ izquierdo"
        except Exception as e:
            self.lbl_status.title = f"❌  {e}"

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
        self.btn_record.title = "⏹  Stopp"
        self.lbl_status.title = "●  Aufnahme läuft…"
        self._refresh_actions()
        if self._overlay is None:
            self._overlay = WaveformOverlay()
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
        self.title            = "⏳"
        self.btn_record.title = "⏺  Aufnehmen"
        self.lbl_status.title = "⏳  Transkription läuft…"
        self._overlay.hide()
        threading.Thread(target=self._transcribe, daemon=True).start()

    # ── Transkription ─────────────────────────────────────────────────────────

    def _transcribe(self):
        if not self.frames:
            self.title = "🎤"
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ izquierdo"
            return

        silence  = np.zeros(SAMPLE_RATE * 3, dtype=np.float32)
        audio    = np.concatenate([np.concatenate(self.frames).flatten(), silence])
        lang     = None if self.lang_code == "auto" else self.lang_code
        result   = mlx_whisper.transcribe(
            audio, path_or_hf_repo=MODEL_REPO,
            language=lang, task="transcribe",
        )
        detected = result.get("language", "")
        text     = result["text"].strip()

        self.transcript = text
        self.title = "🎤"

        if text:
            pyperclip.copy(text)
            preview  = (text[:45] + "…") if len(text) > 45 else text
            lang_tag = f" [{detected}]" if detected and self.lang_code == "auto" else ""
            self.lbl_status.title = f'📝{lang_tag}  "{preview}"'
            self._paste_to_active_app()
        else:
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ izquierdo"

        self._refresh_actions()

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
        self.lbl_status.title = "✅  Bereit  –  mantener ⌥ izquierdo"
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
        self.lang_code = sender._lang_code
        for item in self.lang_items:
            item.state = (item._lang_code == self.lang_code)

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
