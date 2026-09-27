#!/bin/zsh
# One-time setup: node modules + a Python venv with edge-tts. Pass --whisper to add voice checking (~3 GB model on first use).
set -e
cd "$(dirname $0)/.."
for tool in node npm ffmpeg; do command -v $tool >/dev/null || { echo "missing: $tool (macOS: brew install node ffmpeg python)"; exit 1; }; done
# a copied template must own its dependencies (never write into someone else's via a symlink)
[[ -L node_modules ]] && rm -f node_modules
[[ -L .venv ]] && rm -f .venv
PY=""
for p in python3.13 python3.12 python3.11 python3.10 python3.9 python3; do
  if command -v $p >/dev/null && $p -c 'import sys; sys.exit(sys.version_info < (3, 9))'; then PY=$p; break; fi
done
[[ -n "$PY" ]] || { echo "need Python 3.9+"; exit 1; }
echo "npm install (1-3 min)..."
npm install --no-audit --no-fund
$PY -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q edge-tts numpy scipy pillow
[[ "$1" == "--whisper" ]] && .venv/bin/pip install -q faster-whisper
mkdir -p src/data audio/voice out
[[ -f src/data/glyphs.json ]] || echo '{}' > src/data/glyphs.json
[[ -f src/data/mosaic.json ]] || echo '{}' > src/data/mosaic.json
echo "ready"
