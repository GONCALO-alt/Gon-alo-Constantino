# -*- coding: utf-8 -*-
"""Gera a narração (pt-PT) frase a frase e regista as durações em timing.json."""
import hashlib, json, os, re, subprocess, sys, time, urllib.parse, urllib.request
import numpy as np
import guiao

OUT = os.environ.get("OUT", "build")
CACHE = os.path.join(OUT, "tts_cache")
os.makedirs(CACHE, exist_ok=True)
SR = 44100


def chunks(text, limit=180):
    parts = re.split(r'(?<=[\.\!\?\:;,])\s+', text)
    out, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= limit:
            cur = (cur + " " + p).strip()
        else:
            if cur:
                out.append(cur)
            cur = p
    if cur:
        out.append(cur)
    return out


def fetch(text):
    h = hashlib.md5(text.encode()).hexdigest()
    mp3 = os.path.join(CACHE, h + ".mp3")
    if not os.path.exists(mp3) or os.path.getsize(mp3) < 1000:
        q = urllib.parse.urlencode({"ie": "UTF-8", "client": "gtx", "tl": "pt-PT", "q": text})
        for attempt in range(6):
            try:
                req = urllib.request.Request("https://translate.googleapis.com/translate_tts?" + q,
                                             headers={"User-Agent": "Mozilla/5.0"})
                data = urllib.request.urlopen(req, timeout=30).read()
                if len(data) > 1000:
                    open(mp3, "wb").write(data)
                    break
            except Exception as e:
                print("retry", attempt, e, file=sys.stderr)
            time.sleep(2 ** attempt)
        time.sleep(0.4)
    return mp3


def decode(mp3, tempo):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-af",
                          f"atempo={tempo},silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                          "silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)


def main():
    tempo = float(os.environ.get("TEMPO", "0.97"))
    timing = []
    for si, sc in enumerate(guiao.SCENES):
        lines = []
        for li, (text, cap) in enumerate(sc["lines"]):
            if not text.strip():
                lines.append({"wav": None, "dur": 0.0})
                continue
            pieces = [decode(fetch(c), tempo) for c in chunks(text)]
            gap = np.zeros(int(0.12 * SR), np.float32)
            audio = np.concatenate([x for p in pieces for x in (p, gap)][:-1])
            path = os.path.join(OUT, f"vo_{si:02d}_{li:02d}.f32")
            audio.astype(np.float32).tofile(path)
            lines.append({"wav": path, "dur": len(audio) / SR})
            print(f"{si:02d}.{li:02d} {len(audio)/SR:5.2f}s  {text[:60]}")
        timing.append(lines)
    json.dump(timing, open(os.path.join(OUT, "timing.json"), "w"), indent=1)
    tot = sum(l["dur"] for s in timing for l in s)
    print("TOTAL voz: %.1f s (%.1f min)" % (tot, tot / 60))


if __name__ == "__main__":
    main()
