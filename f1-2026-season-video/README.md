# F1 2026: The Season So Far (20-minute YouTube video)

A fully generated, 20:00 English season review of the 2026 Formula One season, covering results up to the
São Paulo GP (round 20 of 23). It has an AI narrator with jokes, meme-style captions, original synthesised
music and SFX, animated race scenes, crash re-creations (nothing graphic), rivalries, driver ratings and standings.

| Time | Section |
|------|---------|
| 0:00 | Intro: the best moments |
| 1:00 | Part 1: The big stories |
| 5:00 | Part 2: Title fight & rivalries |
| 10:00 | Part 3: Surprises, drama & crashes |
| 15:00 | Part 4: Teams & drivers in focus |
| 18:00 | Part 5: Standings & what's next |

## Files
- `script.py`: every scene, its narration lines and its meme captions (edit this to change the video)
- `tts.py`: narration with Kokoro TTS (voice `bm_george`)
- `render.py`: all animations (pycairo, 1920x1080 @ 30 fps)
- `audio.py`: original music, sound effects, narration mix with ducking
- `build.py`: the pipeline
- `thumbnail.py`, `youtube/`: thumbnail, subtitles (.srt) and the upload text

## Rebuild
```bash
pip install kokoro-onnx soundfile scipy pycairo numpy
# models: kokoro-v1.0.onnx + voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases
python3 tts.py MODELS_DIR WORK/voice
python3 build.py WORK video      # scene clips (4 processes)
python3 build.py WORK audio      # WORK/mix.wav
python3 build.py WORK final OUT.mp4
python3 build.py WORK meta youtube
```
