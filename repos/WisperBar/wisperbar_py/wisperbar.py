#!/usr/bin/env python3
"""
WisperBar – lokale Spracheingabe als macOS Menüleisten-App
Shortcut: mantener ⌥ derecho  (braucht Eingabeüberwachung in Systemeinstellungen)
"""

import fcntl
import sys
import threading
import time
import subprocess
from collections import deque
import numpy as np
import sounddevice as sd
import pyperclip
import rumps
import mlx_whisper
from pynput import keyboard as kb

SAMPLE_RATE = 16_000
MODEL_REPO  = "mlx-community/whisper-large-v3-mlx"
LOCK_PATH   = "/tmp/wisperbar.lock"
BARS        = " ▁▂▃▄▅▆▇█"
LANGUAGES   = [
    ("🌐", "Auto-detect", "auto"),
    ("🇩🇪", "Deutsch", "de"),
    ("🇺🇸", "English", "en"),
    ("🇪🇸", "Español", "es"),
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


class WisperBar(rumps.App):

    def __init__(self):
        super().__init__("🎤", quit_button=None)

        self.recording  = False
        self.frames     = []
        self.transcript = ""
        self.lang_code  = "auto"
        self._held      = set()
        self.model      = None
        self._levels    = deque([0.0] * 5, maxlen=5)
        self._fn_held   = False

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

    # ── Menü ─────────────────────────────────────────────────────────────────

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

        self.menu = [
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

    # ── Modell laden ──────────────────────────────────────────────────────────

    def _load_model(self):
        try:
            dummy = np.zeros(SAMPLE_RATE, dtype=np.float32)
            mlx_whisper.transcribe(dummy, path_or_hf_repo=MODEL_REPO, language="de")
            self.model = True
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ derecho"
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
        self._levels          = deque([0.0] * 5, maxlen=5)
        pyperclip.copy("")
        self.btn_record.title = "⏹  Stopp"
        self.lbl_status.title = "●  Aufnahme läuft…"
        self._refresh_actions()
        threading.Thread(target=self._record_loop, daemon=True).start()

    def _record_loop(self):
        def callback(data, *_):
            self.frames.append(data.copy())
            rms = float(np.sqrt(np.mean(data ** 2)))
            self._levels.append(rms)
            self.title = self._waveform()

        with sd.InputStream(
            samplerate=SAMPLE_RATE, channels=1, dtype="float32",
            blocksize=2048, callback=callback,
        ):
            while self.recording:
                time.sleep(0.05)

    def _waveform(self):
        peak = max(self._levels) or 1e-6
        bars = "".join(
            BARS[min(int(v / peak * 8 + 0.5), 8)] for v in self._levels
        )
        return bars

    def _stop(self):
        self.recording        = False
        self.title            = "⏳"
        self.btn_record.title = "⏺  Aufnehmen"
        self.lbl_status.title = "⏳  Transkription läuft…"
        threading.Thread(target=self._transcribe, daemon=True).start()

    # ── Transkription ─────────────────────────────────────────────────────────

    def _transcribe(self):
        if not self.frames:
            self.title = "🎤"
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ derecho"
            return

        audio = np.concatenate(self.frames).flatten()
        lang     = None if self.lang_code == "auto" else self.lang_code
        result   = mlx_whisper.transcribe(
            audio,
            path_or_hf_repo=MODEL_REPO,
            language=lang,
            task="transcribe",
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
            self.lbl_status.title = "✅  Bereit  –  mantener ⌥ derecho"

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
        self.lbl_status.title = "✅  Bereit  –  mantener ⌥ derecho"
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

    # ── mantener ⌥ derecho Erkennung ──────────────────────────────────────────────────

    def _key_press(self, key):
        if key == kb.Key.alt_r and not self._fn_held:
            self._fn_held = True
            if self.model and not self.recording:
                threading.Thread(
                    target=lambda: (time.sleep(0.02), self._start()), daemon=True
                ).start()

    def _key_release(self, key):
        if key == kb.Key.alt_r:
            self._fn_held = False
            if self.recording:
                threading.Thread(
                    target=lambda: (time.sleep(0.02), self._stop()), daemon=True
                ).start()

    # ── UI-Hilfe ──────────────────────────────────────────────────────────────

    def _refresh_actions(self):
        has = bool(self.transcript)
        self.btn_copy.title  = "  Kopieren" if has else "  Kopieren   (kein Text)"
        self.btn_paste.title = "  Einfügen" if has else "  Einfügen   (kein Text)"
        self.btn_clear.title = "  Löschen"  if has else "  Löschen    (kein Text)"


if __name__ == "__main__":
    _acquire_lock()
    WisperBar().run()
