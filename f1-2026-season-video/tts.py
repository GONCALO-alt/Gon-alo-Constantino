"""Narration WAVs (44.1 kHz) per line with Kokoro TTS -> WORK/voice/SSS_LL.wav + durations.json"""
import os, sys, json
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
import script

MODELS, OUT = sys.argv[1], sys.argv[2]
SPEED = 1.06
os.makedirs(OUT, exist_ok=True)
k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
meta = {}
for i, sc in enumerate(script.SCENES):
    for j, ln in enumerate(sc.get("lines", []) + sc.get("beats", [])):
        txt = ln if isinstance(ln, str) else ln["t"]
        path = os.path.join(OUT, f"{i:03d}_{j:02d}.wav")
        key = f"{i:03d}_{j:02d}"
        tf = path + ".txt"
        if not (os.path.exists(path) and os.path.exists(tf) and open(tf).read() == txt):
            s, sr = k.create(txt, voice="bm_george", speed=SPEED, lang="en-gb")
            s = resample_poly(s, 147, 80)
            # trim leading/trailing silence
            nz = np.where(np.abs(s) > 0.01)[0]
            if len(nz):
                s = s[max(0, nz[0] - 800): nz[-1] + 2000]
            s = s / (np.abs(s).max() + 1e-9) * 0.89
            sf.write(path, s.astype(np.float32), 44100)
            open(tf, "w").write(txt)
        meta[key] = sf.info(path).duration
json.dump(meta, open(os.path.join(OUT, "durations.json"), "w"), indent=1)
print("lines", len(meta), "total narration", round(sum(meta.values()) / 60, 2), "min")
