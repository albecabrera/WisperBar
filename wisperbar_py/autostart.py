"""
Registra WisperBar como LaunchAgent del usuario.
Se autoinvoca la primera vez que la app arranca; no requiere instalacion.

Plist: ~/Library/LaunchAgents/com.wisperbar.app.plist
"""
import subprocess
import sys
from pathlib import Path

LABEL     = "com.wisperbar.app"
PLIST     = Path.home() / "Library" / "LaunchAgents" / f"{LABEL}.plist"
_SCRIPT   = Path(__file__).parent.resolve() / "wisperbar.py"

_TEMPLATE = """\
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{label}</string>
    <key>ProgramArguments</key>
    <array>
        <string>{python}</string>
        <string>{script}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>Crashed</key>
        <true/>
    </dict>
    <key>ProcessType</key>
    <string>Interactive</string>
    <key>StandardOutPath</key>
    <string>/tmp/wisperbar.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/wisperbar.err</string>
</dict>
</plist>
"""


def _uid() -> str:
    return subprocess.check_output(["id", "-u"], text=True).strip()


def is_registered() -> bool:
    """True si el plist ya existe con el python/script actuales."""
    if not PLIST.exists():
        return False
    content = PLIST.read_text()
    return (
        sys.executable in content
        and str(_SCRIPT) in content
        and "<key>Crashed</key>" in content  # plist con KeepAlive nuevo
    )


def register() -> bool:
    """Crea el plist y lo carga en la sesion actual. Idempotente."""
    try:
        PLIST.parent.mkdir(parents=True, exist_ok=True)
        PLIST.write_text(
            _TEMPLATE.format(
                label=LABEL,
                python=sys.executable,
                script=str(_SCRIPT),
            ),
            encoding="utf-8",
        )
        # Intentar cargar en sesion actual (falla silenciosamente si ya esta)
        subprocess.run(
            ["launchctl", "bootstrap", f"gui/{_uid()}", str(PLIST)],
            capture_output=True,
        )
        print(f"[autostart] registrado: {PLIST}", flush=True)
        return True
    except Exception as exc:
        print(f"[autostart] error al registrar: {exc}", flush=True)
        return False


def unregister() -> bool:
    """Elimina el LaunchAgent. La app no arrancara mas al inicio."""
    try:
        subprocess.run(
            ["launchctl", "bootout", f"gui/{_uid()}", str(PLIST)],
            capture_output=True,
        )
        if PLIST.exists():
            PLIST.unlink()
        print("[autostart] eliminado", flush=True)
        return True
    except Exception as exc:
        print(f"[autostart] error al eliminar: {exc}", flush=True)
        return False
