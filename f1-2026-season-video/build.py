"""Build the video.  python3 build.py WORK {preview [ids]|video|audio|final OUT.mp4|meta OUTDIR}"""
import json, os, sys, subprocess
from multiprocessing import Pool
import script

LEAD, GAP, CAPGAP = 0.7, 0.35, 0.55
LABELS = {k: lab for k, lab, _ in script.SECTIONS}


def line_items(sc):
    out = []
    for ln in sc.get("lines", []) + sc.get("beats", []):
        if isinstance(ln, str):
            out.append((ln, None, None))
        else:
            out.append((ln["t"], ln.get("cap"), ln.get("fx", "punch") if ln.get("cap") else None))
    return out


def timeline(work):
    vd = json.load(open(os.path.join(work, "voice", "durations.json")))
    scenes = []
    for i, sc in enumerate(script.SCENES):
        sc = dict(sc)
        sc["_label"] = None if sc["type"] == "chapter" else LABELS[sc["sec"]]
        items = line_items(sc)
        if items:
            rel, t, lines = LEAD, LEAD, []
            for j, (txt, cap, fx) in enumerate(items):
                d = vd[f"{i:03d}_{j:02d}"]
                if sc["type"] == "hype":
                    d_show = d + 1.6
                else:
                    d_show = d
                lines.append([t, d, txt, cap, fx, os.path.join(work, "voice", f"{i:03d}_{j:02d}.wav")])
                t += d_show + (CAPGAP if cap and sc["type"] != "hype" else GAP)
            sc["_base"] = t
        else:
            sc["_base"] = sc["dur"]
            lines = []
        sc["_wav"] = lines
        scenes.append(sc)
    # stretch each section to its target end by adding tail padding to spoken scenes
    out, t0, prev_end = [], 0.0, 0.0
    for key, _, end in script.SECTIONS:
        secs = [s for s in scenes if s["sec"] == key]
        base = sum(s["_base"] for s in secs)
        spoken = [s for s in secs if s["_wav"]]
        pad = (end - prev_end - base) / max(1, len(spoken))
        for s in secs:
            d = s["_base"] + (pad if s["_wav"] else 0)
            d = round(d * 30) / 30
            s["_lines"] = [(a, b, c, d_, e) for a, b, c, d_, e, _ in s["_wav"]]
            out.append((len(out), s, t0, d))
            t0 += d
        print(f"{key}: base {base:.1f}s, pad/scene {pad:.2f}s, ends {t0:.1f}")
        prev_end = end
    return out, t0


def _render(args):
    import render
    i, sc, t0, d, total, path = args
    if not os.path.exists(path):
        render.render_scene(sc, d, path + ".tmp.mp4", t0, total)
        os.rename(path + ".tmp.mp4", path)
    return i


def fmt(t, srt=True):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}" if srt else f"{m}:{int(s):02d}"


def main():
    work, mode = sys.argv[1], sys.argv[2]
    tl, total = timeline(work)
    print(f"total {total:.1f}s = {total / 60:.2f} min, {len(tl)} scenes")
    if mode == "preview":
        import render
        os.makedirs(os.path.join(work, "preview"), exist_ok=True)
        only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        comp = render.Composer()
        for i, sc, t0, d in tl:
            if only and str(i) not in only:
                continue
            ts = [4.6] if sc["type"] == "lights" else [d * 0.5]
            caps = [l for l in sc["_lines"] if l[3]]
            if caps:
                ts.append(caps[0][0] + 0.9)
            for k, t in enumerate(ts):
                comp.frame(sc, t, d, t0, total).write_to_png(os.path.join(work, "preview", f"{i:02d}_{sc['type']}_{k}.png"))
    elif mode == "video":
        os.makedirs(os.path.join(work, "clips"), exist_ok=True)
        jobs = [(i, sc, t0, d, total, os.path.join(work, "clips", f"{i:03d}.mp4")) for i, sc, t0, d in tl]
        jobs.sort(key=lambda j: -j[3])
        with Pool(4) as p:
            for i in p.imap_unordered(_render, jobs):
                print("done", i, flush=True)
    elif mode == "audio":
        import audio
        audio.build(tl, total, os.path.join(work, "mix.wav"))
    elif mode == "final":
        outp = sys.argv[3]
        lst = os.path.join(work, "clips.txt")
        with open(lst, "w") as f:
            for i, *_ in tl:
                f.write(f"file '{os.path.join(work, 'clips', f'{i:03d}.mp4')}'\n")
        subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                               "-i", os.path.join(work, "mix.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                               "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", outp])
        print("wrote", outp)
    elif mode == "meta":
        outd = sys.argv[3]
        n = 1
        with open(os.path.join(outd, "subtitles_en.srt"), "w") as f:
            for i, sc, t0, d in tl:
                for st, dd, txt, cap, fx in sc["_lines"]:
                    f.write(f"{n}\n{fmt(t0 + st)} --> {fmt(t0 + st + dd + 0.2)}\n{txt}\n\n")
                    n += 1
        chapters = []
        for i, sc, t0, d in tl:
            if sc["type"] in ("chapter",) or i == 0:
                chapters.append((t0, "Intro: the best moments" if i == 0 else "Part " + sc["num"] + ": " + sc["title"].title()))
        json.dump(chapters, open(os.path.join(outd, "chapters.json"), "w"))
        print("\n".join(f"{fmt(a, False)} {b}" for a, b in chapters))


if __name__ == "__main__":
    main()
