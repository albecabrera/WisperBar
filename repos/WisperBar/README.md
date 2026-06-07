# WisperBar

macOS menu bar app for local voice dictation powered by [Whisper MLX](https://github.com/ml-explore/mlx-examples). Transcribes speech offline and pastes the result directly into the active app.

## Requirements

- macOS (Apple Silicon recommended)
- Python 3.10+
- Microphone access
- Accessibility access (for global shortcut and auto-paste)

## Installation

```bash
cd wisperbar_py
pip install -r requirements.txt
```

The first run downloads the Whisper large-v3 model (~3 GB). Subsequent starts load it from cache.

## Usage

```bash
cd wisperbar_py
python3 wisperbar.py
```

Or double-click `WisperBar starten.command`.

### Shortcut

| Action | Key |
|--------|-----|
| Start recording | Hold **Right Option (⌥)** |
| Stop & transcribe | Release **Right Option (⌥)** |

You can also click the 🎤 icon in the menu bar and choose **Aufnehmen**.

### Language detection

Default mode is **Auto-detect** — Whisper identifies the spoken language automatically. You can pin a specific language (German, English, Spanish) from the menu bar.

### Auto-paste

After transcription the text is copied to the clipboard and automatically pasted into the frontmost app. Use **Einfügen** from the menu to paste again manually.

## Menu bar actions

| Item | Description |
|------|-------------|
| ⏺ Aufnehmen | Toggle recording |
| 📋 Kopieren | Copy last transcript to clipboard |
| 📌 Einfügen | Paste last transcript into active app |
| 🗑 Löschen | Clear last transcript |
| 🌐 Auto-detect / 🇩🇪 / 🇺🇸 / 🇪🇸 | Set transcription language |
| Beenden | Quit |

## Permissions

On first launch macOS will request:

1. **Microphone** — required for recording
2. **Accessibility** — required for the global Right Option shortcut and auto-paste

Grant both in **System Settings → Privacy & Security**.

## Model

Uses `mlx-community/whisper-large-v3-mlx` via `mlx-whisper`. Runs entirely on-device — no audio is sent to any server.
