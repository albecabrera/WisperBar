#!/usr/bin/env bash
set -euo pipefail

# ── Colores ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[WisperBar]${RESET} $*"; }
success() { echo -e "${GREEN}[WisperBar]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[WisperBar]${RESET} $*"; }
error()   { echo -e "${RED}[WisperBar]${RESET} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_DIR="$SCRIPT_DIR/wisperbar_py"
VENV_DIR="$PY_DIR/.venv"
REQUIREMENTS="$PY_DIR/requirements.txt"
ENTRY_POINT="$PY_DIR/wisperbar.py"
VERSION_FILE="$SCRIPT_DIR/version.json"

# ── Verificar arquitectura ─────────────────────────────────────────────────────
ARCH="$(uname -m)"
if [[ "$ARCH" != "arm64" ]]; then
  error "WisperBar (Python/MLX) requiere Apple Silicon (arm64). Arquitectura detectada: $ARCH"
fi

# ── Verificar macOS ────────────────────────────────────────────────────────────
OS="$(uname -s)"
if [[ "$OS" != "Darwin" ]]; then
  error "Este script es solo para macOS."
fi

# ── Buscar Python 3.10+ ────────────────────────────────────────────────────────
find_python() {
  local candidates=(
    "python3.13" "python3.12" "python3.11" "python3.10"
    "/opt/homebrew/bin/python3.13"
    "/opt/homebrew/bin/python3.12"
    "/opt/homebrew/bin/python3.11"
    "/opt/homebrew/bin/python3.10"
  )
  for py in "${candidates[@]}"; do
    if command -v "$py" &>/dev/null; then
      local ver
      ver=$("$py" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null)
      local major minor
      major=$(echo "$ver" | cut -d. -f1)
      minor=$(echo "$ver" | cut -d. -f2)
      if [[ "$major" -ge 3 && "$minor" -ge 10 ]]; then
        echo "$py"
        return 0
      fi
    fi
  done
  return 1
}

PYTHON=""
if ! PYTHON="$(find_python)"; then
  warn "Python 3.10+ no encontrado."
  if command -v brew &>/dev/null; then
    info "Instalando Python 3.11 vía Homebrew..."
    brew install python@3.11
    PYTHON="$(find_python)" || error "No se pudo encontrar Python 3.10+ luego de instalarlo."
  else
    error "Instalá Python 3.10+ manualmente: https://www.python.org/downloads/ o instala Homebrew primero."
  fi
fi

PY_VER="$("$PYTHON" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')")"
info "Python encontrado: $PYTHON ($PY_VER)"

# ── Crear/actualizar entorno virtual ──────────────────────────────────────────
if [[ ! -d "$VENV_DIR" ]]; then
  info "Creando entorno virtual en $VENV_DIR ..."
  "$PYTHON" -m venv "$VENV_DIR"
  success "Entorno virtual creado."
else
  info "Entorno virtual ya existe en $VENV_DIR"
fi

VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"

# ── Actualizar pip ─────────────────────────────────────────────────────────────
info "Actualizando pip..."
"$VENV_PYTHON" -m pip install --upgrade pip --quiet

# ── Instalar dependencias ──────────────────────────────────────────────────────
if [[ ! -f "$REQUIREMENTS" ]]; then
  error "No se encontró $REQUIREMENTS"
fi

info "Instalando dependencias desde requirements.txt..."
"$VENV_PIP" install -r "$REQUIREMENTS" --quiet
success "Dependencias instaladas."

# ── Verificar que el entry point exista ───────────────────────────────────────
if [[ ! -f "$ENTRY_POINT" ]]; then
  error "No se encontró $ENTRY_POINT"
fi

# ── Verificar permisos de accesibilidad (advertencia, no bloquea) ─────────────
TRUSTED=$("$VENV_PYTHON" -c "
import sys
try:
    from AppKit import NSWorkspace  # noqa
    import ctypes
    ax = ctypes.cdll.LoadLibrary('/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices')
    ax.AXIsProcessTrusted.restype = ctypes.c_bool
    print('ok' if ax.AXIsProcessTrusted() else 'warn')
except Exception:
    print('skip')
" 2>/dev/null || echo "skip")

if [[ "$TRUSTED" == "warn" ]]; then
  warn "Accesibilidad no habilitada para este proceso."
  warn "Andá a: Configuración del Sistema → Privacidad y seguridad → Accesibilidad"
  warn "y agregá Terminal (o la app desde donde corrés esto)."
  echo ""
fi

# ── Matar instancia anterior ──────────────────────────────────────────────────
if pgrep -f "wisperbar.py" &>/dev/null; then
  info "Deteniendo instancia anterior..."
  pkill -f "wisperbar.py" || true
  sleep 1
  rm -f /tmp/wisperbar.lock
  success "Instancia anterior detenida."
fi

# ── Versión incremental ───────────────────────────────────────────────────────
if [[ ! -f "$VERSION_FILE" ]]; then
  echo '{"version":"1.0.0","build":0}' > "$VERSION_FILE"
fi

read -r APP_VERSION APP_BUILD <<< "$("$VENV_PYTHON" - "$VERSION_FILE" <<'PYEOF'
import json, sys
path = sys.argv[1]
with open(path) as f:
    d = json.load(f)
d["build"] += 1
with open(path, "w") as f:
    json.dump(d, f, indent=2)
    f.write("\n")
print(d["version"], d["build"])
PYEOF
)"

export WISPERBAR_VERSION="$APP_VERSION"
export WISPERBAR_BUILD="$APP_BUILD"
success "Versión: v${APP_VERSION} (build ${APP_BUILD})"

# ── Lanzar WisperBar ──────────────────────────────────────────────────────────
success "Lanzando WisperBar (Python/MLX Whisper)..."
echo ""

exec "$VENV_PYTHON" "$ENTRY_POINT"
