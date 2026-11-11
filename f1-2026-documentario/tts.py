# -*- coding: utf-8 -*-
"""Narração em português do Brasil com voz masculina grave.

Motor: Kokoro-82M (ONNX, Apache-2.0), voz pm_alex, fonética espeak-ng pt-br.
Depois da síntese, a voz é baixada ~3 semitons (formantes preservados) e
recebe reforço de graves, para soar mais "grossa".
Modelo: pacote npm kokoro-q8-shards (6 partes concatenadas); vozes: pacote npm kokoro-js.
"""
import json, os, re, subprocess, sys
from multiprocessing import Pool
import numpy as np
import guiao

OUT = os.environ.get("OUT", "build")
KDIR = os.environ.get("KOKORO_DIR", "kokoro")
VOICE = os.environ.get("VOICE", "pm_alex")
SPEED = float(os.environ.get("SPEED", "1.0"))
PITCH = float(os.environ.get("PITCH", "0.82"))   # 0.82 ≈ -3,5 semitons
SR = 44100

# Grafias só para a pronúncia (o texto no ecrã/legendas não muda)
PRON = [
    ("Hamilton", "Rámilton"), ("Verstappen", "Verstápen"), ("Norris", "Nóris"), ("Russell", "Rássel"),
    ("Antonelli", "Antonéli"), ("Piastri", "Piástri"), ("Leclerc", "Leclérc"), ("Hadjar", "Adjár"),
    ("Lindblad", "Líndblad"), ("Bearman", "Bírman"), ("Hulkenberg", "Rúlkenberg"), ("Gasly", "Gaslí"),
    ("Sainz", "Sáinz"), ("Bottas", "Bótas"), ("Wolff", "Vólf"), ("Vasseur", "Vassêr"), ("Stroll", "Stról"),
    ("Kimi", "Kími"), ("George", "Djórdj"), ("Charles", "Xárl"), ("Lewis", "Lúis"), ("Oliver", "Óliver"),
    ("Isack", "Ízak"), ("Arvid", "Árvid"), ("Valtteri", "Váltéri"), ("Lance", "Lânce"), ("Fred", "Fréd"),
    ("Sebastian Vettel", "Sebástian Fétel"), ("John Watson", "Djón Uótson"), ("Long Beach", "Lóng Bítch"),
    ("McLaren", "Mequiláren"), ("Red Bull", "Réd Búl"), ("Racing Bulls", "Rêicing Búls"), ("Haas", "Rás"),
    ("Williams", "Uílians"), ("Aston Martin", "Ásston Mártin"), ("Cadillac", "Cadilác"), ("Honda", "Rônda"),
    ("Silverstone", "Sílverston"), ("Zandvoort", "Zândfort"), ("Austin", "Óstin"), ("Spoon", "Spún"),
    ("Abu Dhabi", "Abu Dábi"), ("Las Vegas", "Las Végas"), ("Melbourne", "Mélburn"), ("Suzuka", "Suzúka"),
    ("safety car", "sêifti car"), ("sprint", "sprínt"), ("pole position", "pôul posíxon"), ("pole", "pôul"),
    ("software", "sóftuer"), ("MGU-H", "eme gê u agá"), ("MGU-K", "eme gê u cá"), ("DRS", "dê érre ésse"),
    ("Q2", "quê dois"), ("FIA", "Fía"), ("Toto", "Tôto"), ("Audi", "Áudi"), ("Spa", "Spá"),
    ("Montreal", "Montreál"), ("Interlagos", "Interlágos"), ("Bortoleto", "Bortolêto"),
]


def pron(text):
    for a, b in PRON:
        text = re.sub(r"\b%s\b" % re.escape(a), b, text)
    return text


_k = None


def kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(os.path.join(KDIR, "kokoro-q8.onnx"), os.path.join(KDIR, "voices.npz"))
    return _k


def synth(job):
    si, li, text = job
    path = os.path.join(OUT, f"vo_{si:02d}_{li:02d}.f32")
    raw = os.path.join(OUT, "kokoro_cache", f"{si:02d}_{li:02d}.f32")
    if not os.path.exists(raw):
        a, sr = kokoro().create(pron(text), voice=VOICE, speed=SPEED, lang="pt-br")
        np.asarray(a, np.float32).tofile(raw)
    # graves: tom mais baixo (formantes preservados), resample para 44.1k, EQ e corte de silêncios
    af = (f"rubberband=pitch={PITCH}:formant=preserved:pitchq=quality,"
          "aresample=44100,highpass=f=55,equalizer=f=110:t=q:w=1.0:g=5,equalizer=f=220:t=q:w=1.2:g=2,"
          "equalizer=f=3500:t=q:w=1.5:g=1.5,"
          "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "silenceremove=start_periods=1:start_threshold=-45dB,areverse")
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", "24000", "-ac", "1", "-i", raw,
                          "-af", af, "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(out, np.float32)
    a = a / (np.max(np.abs(a)) + 1e-9) * 0.9
    a.tofile(path)
    return si, li, path, len(a) / SR, text


def main():
    os.makedirs(os.path.join(OUT, "kokoro_cache"), exist_ok=True)
    jobs = [(si, li, t) for si, sc in enumerate(guiao.SCENES) for li, (t, _) in enumerate(sc["lines"]) if t.strip()]
    jobs.sort(key=lambda j: -len(j[2]))
    with Pool(int(os.environ.get("PROCS", "4"))) as pool:
        res = {}
        for si, li, path, dur, text in pool.imap_unordered(synth, jobs):
            res[(si, li)] = (path, dur)
            print(f"{si:02d}.{li:02d} {dur:5.2f}s  {text[:60]}", flush=True)
    timing = []
    for si, sc in enumerate(guiao.SCENES):
        timing.append([{"wav": res[(si, li)][0], "dur": res[(si, li)][1]} if (si, li) in res
                       else {"wav": None, "dur": 0.0} for li in range(len(sc["lines"]))])
    json.dump(timing, open(os.path.join(OUT, "timing.json"), "w"), indent=1)
    tot = sum(l["dur"] for s in timing for l in s)
    print("TOTAL voz: %.1f s (%.1f min)" % (tot, tot / 60))


if __name__ == "__main__":
    main()
