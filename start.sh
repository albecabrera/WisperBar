#!/bin/bash
# Reinicia WisperBar (LaunchAgent) rápido, sin re-registrar el plist.
set -e
launchctl kickstart -k gui/$(id -u)/com.wisperbar.app
sleep 1
echo "PID: $(pgrep -f wisperbar_py/wisperbar.py || echo 'no arrancó')"
echo "--- últimas líneas de stderr ---"
tail -n 15 /tmp/wisperbar.err
