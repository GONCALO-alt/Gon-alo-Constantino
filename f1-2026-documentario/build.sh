#!/usr/bin/env bash
# Gera o documentário completo: voz -> música/mistura -> imagem -> montagem final.
# Requisitos: python3 (numpy, scipy, pillow, opencv-python-headless), ffmpeg,
# fontes Anton / Barlow Condensed / Inter (OFL) em $FONTS em formato .ttf.
set -euo pipefail
cd "$(dirname "$0")"
export OUT=${OUT:-build} FONTS=${FONTS:-fonts} KOKORO_DIR=${KOKORO_DIR:-kokoro}
mkdir -p "$OUT"
python3 tts.py          # narração (pt-BR, voz grave) + durações
python3 musica.py       # banda sonora original, efeitos, ducking e mistura
python3 render.py       # grafismo 1920x1080 25 fps, por cenas em paralelo
python3 legendas.py     # .srt + GUIAO.md
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/segs.txt" -c copy "$OUT/video.mp4"
ffmpeg -v error -y -i "$OUT/video.mp4" -f f32le -ar 44100 -ac 2 -i "$OUT/mix.f32" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$OUT/F1_2026_ate_ao_Brasil.mp4"
echo "Pronto: $OUT/F1_2026_ate_ao_Brasil.mp4"
