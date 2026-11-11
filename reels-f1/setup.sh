#!/usr/bin/env bash
# Instala o que o gerador de Reels precisa: Piper (voz) e a voz pt_PT "tugão".
set -euo pipefail
VOICE_DIR="${REEL_VOICE_DIR:-$HOME/.cache/reels-f1/voice}"
mkdir -p "$VOICE_DIR"
python3 -c "import piper" 2>/dev/null || pip3 install -q piper-tts
BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_PT/tug%C3%A3o/medium"
for ext in onnx onnx.json; do
  out="$VOICE_DIR/pt_PT-tugao-medium.$ext"
  [ -s "$out" ] || curl -sSfL -o "$out" "$BASE/pt_PT-tug%C3%A3o-medium.$ext"
done
command -v ffmpeg >/dev/null || { echo "ffmpeg em falta" >&2; exit 1; }
echo "Pronto: voz em $VOICE_DIR"
