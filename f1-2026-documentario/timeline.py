# -*- coding: utf-8 -*-
"""Constrói a linha temporal (segundos) de cenas e frases a partir de timing.json."""
import json, os
import guiao

GAP = 0.34          # pausa entre frases
PRE = {"race": 3.2, "chapter": 1.4, "title": 0.0, "cold": 0.8, "champion": 1.5,
       "controversy": 1.6, "news": 1.2, "standings": 1.2, "teams": 0.8, "outro": 0.6}
POST = {"race": 4.6, "chapter": 1.6, "title": 6.5, "cold": 0.6, "champion": 3.5,
        "standings": 2.5, "outro": 5.0}


def build(out):
    timing = json.load(open(os.path.join(out, "timing.json")))
    t = 0.0
    scenes = []
    for sc, tl in zip(guiao.SCENES, timing):
        typ = sc["type"]
        start = t
        t += PRE.get(typ, 0.7)
        lines = []
        for (text, cap), info in zip(sc["lines"], tl):
            lines.append({"t0": t, "t1": t + info["dur"], "text": text, "cap": cap, "wav": info["wav"]})
            t += info["dur"] + (GAP if info["dur"] > 0 else 0)
        t += POST.get(typ, 0.5)
        scenes.append({"i": len(scenes), "type": typ, "start": start, "end": t, "lines": lines})
    return scenes, t


if __name__ == "__main__":
    s, T = build(os.environ.get("OUT", "build"))
    print("duração total: %.1f s = %d:%02d" % (T, T // 60, T % 60))
