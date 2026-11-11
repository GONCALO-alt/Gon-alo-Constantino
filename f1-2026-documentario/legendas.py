# -*- coding: utf-8 -*-
"""Gera legendas .srt e o guião em texto corrido a partir da linha temporal."""
import os, textwrap
import timeline, guiao

OUT = os.environ.get("OUT", "build")


def ts(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return "%02d:%02d:%06.3f" % (h, m, s)


def main(dest="."):
    scenes, T = timeline.build(OUT)
    n = 1
    with open(os.path.join(dest, "F1_2026_ate_ao_Brasil.srt"), "w", encoding="utf-8") as f:
        for sc in scenes:
            for ln in sc["lines"]:
                if not ln["text"]:
                    continue
                f.write("%d\n%s --> %s\n%s\n\n" % (n, ts(ln["t0"]).replace(".", ","), ts(ln["t1"] + 0.2).replace(".", ","),
                                                   "\n".join(textwrap.wrap(ln["text"], 60))))
                n += 1
    with open(os.path.join(dest, "GUIAO.md"), "w", encoding="utf-8") as f:
        f.write("# F1 2026 — Tudo o que aconteceu até o Brasil\n\nGuião completo da narração (português do Brasil).\n\n")
        for sc, data in zip(scenes, guiao.SCENES):
            m, s = divmod(int(sc["start"]), 60)
            head = {"race": lambda d: "R%02d · GP %s (%s)" % (d["rnd"], d["gp"].title(), d["date"].lower()),
                    "chapter": lambda d: "Capítulo %s — %s" % (d["num"], d["title"].title())}.get(sc["type"], lambda d: sc["type"].upper())(data)
            f.write("## [%02d:%02d] %s\n\n" % (m, s, head))
            for ln in sc["lines"]:
                if ln["text"]:
                    cap = ln["cap"].lstrip("!@").replace("|", " / ")
                    f.write("%s%s\n\n" % (ln["text"], ("  _[ecrã: %s]_" % cap) if cap and not ln["cap"].startswith("@") else ""))
    print("legendas e guião ok, duração %.0f s" % T)


if __name__ == "__main__":
    main()
