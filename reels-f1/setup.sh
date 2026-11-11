#!/usr/bin/env bash
# Instala o que o gerador de Reels precisa: Piper (voz) e a voz inglesa.
set -euo pipefail
VOICE_DIR="${REEL_VOICE_DIR:-$HOME/.cache/reels-f1/voice}"
mkdir -p "$VOICE_DIR"
python3 -c "import piper" 2>/dev/null || pip3 install -q piper-tts
# Voz padrão: jovem britânico. Outras vozes: ver https://huggingface.co/rhasspy/piper-voices
VOICE="en_GB-northern_english_male-medium"
BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/northern_english_male/medium"
for ext in onnx onnx.json; do
  out="$VOICE_DIR/$VOICE.$ext"
  [ -s "$out" ] || curl -sSfL -o "$out" "$BASE/$VOICE.$ext"
done
command -v ffmpeg >/dev/null || { echo "ffmpeg em falta" >&2; exit 1; }
echo "Pronto: voz em $VOICE_DIR"
