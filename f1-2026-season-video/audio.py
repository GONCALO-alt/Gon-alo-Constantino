"""Original synthesised soundtrack + SFX + narration mix with ducking."""
import math
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 122
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(1)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(buf, t, w, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(w) <= 0:
        return
    if i < 0:
        w = w[-i:]
        i = 0
    n = min(len(w), len(buf) - i)
    buf[i:i + n] += w[:n] * g


def saw(f, n, harm=14, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, harm + 1):
        if k * f > 14000:
            break
        out += np.sin(2 * np.pi * k * f * (1 + detune) * t) / k
    return out


def sqr(f, n, harm=9):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, harm * 2, 2):
        if k * f > 14000:
            break
        out += np.sin(2 * np.pi * k * f * t) / k
    return out


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


_cache = {}


def cached(key, fn):
    if key not in _cache:
        _cache[key] = fn()
    return _cache[key]


# ------------------------------------------------------------- instruments
def kick():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 48 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = np.sin(ph) * np.exp(-t * 7.5)
    w[:200] += rng.standard_normal(200) * 0.3 * np.linspace(1, 0, 200)
    return w * 0.95


def snare():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t * 16)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22)
    return (noise * 0.7 + tone * 0.5) * 0.7


def hat(open_=False):
    n = int((0.35 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t * (9 if open_ else 70)) * 0.22


def crash():
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000) * np.exp(-t * 2.0) * 0.28


def pad_chord(notes, bright):
    n = int((BAR + 0.6) * SR)
    w = np.zeros(n)
    for m in notes:
        f = mtof(m)
        for d in (-0.004, 0.004):
            w += saw(f, n, 10, d)
    w = lp(w, 2600 if bright else 1500)
    return w * env(n, 0.35, 0.6) * 0.05


def bass_note(m, dur):
    n = int(dur * SR)
    w = lp(saw(mtof(m), n, 16), 700)
    t = np.arange(n) / SR
    return w * np.exp(-t * 3.5) * env(n, 0.005, 0.03) * 0.35


def pluck(m, dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return lp(sqr(mtof(m), n, 6), 3500) * np.exp(-t * 16) * 0.11


def lead(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 3, 0, 1)
    ph = 2 * np.pi * np.cumsum(mtof(m) * vib) / SR
    w = sum(np.sin(k * ph) / k ** 1.4 for k in range(1, 7))
    return lp(w, 4000) * env(n, 0.02, 0.15) * 0.1


TRI = {"m": [0, 3, 7], "M": [0, 4, 7]}
PROGS = {
    "drive": [(45, "m"), (41, "M"), (48, "M"), (43, "M")],
    "drive2": [(38, "m"), (45, "m"), (41, "M"), (43, "M")],
    "tech": [(45, "m"), (40, "m"), (41, "M"), (43, "M")],
    "triumph": [(48, "M"), (43, "M"), (45, "m"), (41, "M")],
    "outro": [(48, "M"), (43, "M"), (45, "m"), (41, "M")],
}


def music_bar(buf, tb, mood, bar_idx, hit=False):
    root, q = PROGS[mood][bar_idx % 4]
    tones = [root + 24 + x for x in TRI[q]]
    bright = mood in ("triumph", "drive")
    add(buf, tb, cached(("pad", tuple(tones), bright), lambda: pad_chord(tones, bright)))
    if mood == "outro":
        return
    k, s, hc, ho = cached("k", kick), cached("s", snare), cached("hc", lambda: hat()), cached("ho", lambda: hat(True))
    full = mood in ("drive", "drive2", "triumph")
    if bar_idx % 4 == 0 and full or hit:
        add(buf, tb, cached("cr", crash))
    for b in range(4):
        t = tb + b * BEAT
        if full or b in (0, 2):
            add(buf, t, k)
        if b in (1, 3):
            add(buf, t, s, 1.0 if full else 0.55)
        add(buf, t + BEAT / 2, ho if full else hc)
        if not full:
            add(buf, t, hc, 0.6)
            add(buf, t + BEAT / 4, hc, 0.4)
            add(buf, t + 3 * BEAT / 4, hc, 0.4)
    # bass
    if full:
        for e in range(8):
            m = root + (12 if e % 2 else 0)
            add(buf, tb + e * BEAT / 2, cached(("b", m, 0.24), lambda: bass_note(m, 0.24)))
    else:
        for e in range(4):
            add(buf, tb + e * BEAT, cached(("b", root, 0.45), lambda: bass_note(root, 0.45)))
    # arp
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    steps = 16 if full else 8
    for e in range(steps):
        m = tones[pat[e % 8]] + (12 if (e // 8) % 2 and full else 0)
        add(buf, tb + e * BAR / steps, cached(("p", m), lambda: pluck(m)), 0.8 if full else 0.7)
    if mood == "triumph":
        mel = [tones[2] + 12, tones[1] + 12, tones[0] + 12, tones[1] + 12]
        for e, m in enumerate(mel):
            add(buf, tb + e * BEAT, cached(("l", m), lambda: lead(m, BEAT * 0.95)))


# -------------------------------------------------------------------- sfx
def beep(f=600, d=0.18):
    n = int(d * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, 0.005, 0.04) * 0.35


def boom():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 6)
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    w += lp(rng.standard_normal(n), 400) * np.exp(-t * 8) * 0.6
    return np.tanh(w * 1.6) * 0.75


def whoosh(d=0.7):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    w = bp(x, 400, 5000) * np.sin(np.pi * t / d) ** 2
    return w * 0.22


def riser(d=2.0):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 200 * 8 ** (t / d)
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12 + hp(rng.standard_normal(n), 2000) * 0.12
    return w * (t / d) ** 2


def engine(d, f0=520, f1=760, shifts=3, pan_env=None, level=0.3):
    n = int(d * SR)
    t = np.arange(n) / SR
    seg = d / (shifts + 1)
    frac = (t % seg) / seg
    f = f0 + (f1 - f0) * (0.55 + 0.45 * frac)
    f = f * (1 + 0.004 * np.sin(2 * np.pi * 31 * t))
    ph = 2 * np.pi * np.cumsum(f / 2) / SR
    w = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 12))
    w += bp(rng.standard_normal(n), 800, 6000) * 0.25
    w = np.tanh(w * 0.8)
    e = pan_env if pan_env is not None else env(n, 0.3, 0.6)
    return lp(w, 5000) * e * level


def passby(d=3.0, level=0.45):
    n = int(d * SR)
    t = np.arange(n) / SR
    c = d * 0.45
    amp = 1 / (1 + ((t - c) * 3.0) ** 2)
    dop = np.where(t < c, 1.08, 0.9)
    dop = np.convolve(dop, np.ones(4000) / 4000, mode="same")
    ph = 2 * np.pi * np.cumsum(330 * dop * (1 + 0.15 * t / d)) / SR
    w = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 12))
    w = np.tanh(w * 0.8) + bp(rng.standard_normal(n), 900, 6000) * 0.3
    return lp(w, 6000) * amp * level


def crowd(d=7.0):
    n = int(d * SR)
    t = np.arange(n) / SR
    w = bp(rng.standard_normal(n), 300, 2500)
    am = 1 + 0.3 * np.sin(2 * np.pi * 3.1 * t) * np.sin(2 * np.pi * 0.7 * t)
    return w * am * env(n, 1.0, 3.0) * 0.3


def skid(d=1.0):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 900 - 300 * t / d
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bp(rng.standard_normal(n), 1500, 5000) * 0.4
    return w * env(n, 0.02, 0.4) * 0.35


# -------------------------------------------------------------------- build
SECTION_MOOD = {"intro": "drive", "s1": "tech", "s2": "drive", "s3": "drive2", "s4": "tech", "s5": "tech"}


def mood_for(sc):
    ty = sc["type"]
    if ty in ("champion",):
        return "triumph"
    if ty == "outro":
        return "triumph"
    if ty == "credits":
        return "outro"
    if ty in ("race", "duel", "strip", "rivalry", "hype", "chapter", "title", "incident"):
        return "drive2" if sc["sec"] == "s3" else "drive"
    return SECTION_MOOD.get(sc["sec"], "tech")


def build(tl, total, out):
    N = int((total + 1) * SR)
    music = np.zeros(N, np.float32)
    voice = np.zeros(N, np.float32)
    sfx = np.zeros(N, np.float32)
    # narration
    for i, sc, t0, d in tl:
        for st, dd, txt, cap, fx, path in sc["_wav"]:
            w, sr = sf.read(path)
            add(voice, t0 + st, w.astype(np.float32))
    # music grid starts at lights out (6.0s in the lights scene)
    m0 = 5.2
    starts = [(t0, sc) for i, sc, t0, d in tl]
    nb = int((total - m0) / BAR) + 1
    for b in range(nb):
        tb = m0 + b * BAR
        cur = starts[0][1]
        for t0, sc in starts:
            if t0 <= tb + 0.05:
                cur = sc
        hit = cur["type"] == "chapter"
        music_bar(music, tb, mood_for(cur), b, hit)
    # music fade in at lights out and out at the end
    music[: int(m0 * SR)] = 0
    fo = int(6 * SR)
    music[N - fo:] *= np.linspace(1, 0, fo)
    # sfx
    for i, sc, t0, d in tl:
        ty = sc["type"]
        if i > 0 and ty not in ("credits",):
            add(sfx, t0 - 0.35, cached("wh", whoosh), 1.0)
        if ty == "lights":
            for k in range(5):
                add(sfx, t0 + 0.8 + k * 0.85, cached("bp", beep))
            add(sfx, t0 + 5.2, engine(3.2, 540, 820, 2), 1.4)
            add(sfx, t0 + 5.3, cached("bm", boom), 0.8)
        if ty == "chapter":
            add(sfx, t0 - 2.0, cached("rs", riser), 1.0)
            add(sfx, t0, cached("bm", boom), 0.9)
        if ty == "duel":
            add(sfx, t0, engine(d, 560, 780, int(d / 1.6), level=0.32))
            add(sfx, t0 + d * 0.4, engine(d * 0.45, 640, 900, 1, level=0.25))
        if ty == "title":
            add(sfx, t0 + 1.8, passby(3.0))
        if ty == "incident":
            tc = max(3.0, d * 0.33)
            add(sfx, t0 + tc - 1.0, passby(2.5, 0.25))
            add(sfx, t0 + tc - 0.1, cached("sk", skid), 1.0)
        if ty == "champion":
            add(music, t0 + 0.2, crowd(9.0), 1.0)
            add(sfx, t0, cached("bm", boom), 0.9)
        if ty == "hype":
            for st, dd, *_ in sc["_lines"]:
                add(sfx, t0 + st - 0.25, cached("bm", boom), 0.75)
            for st, dd, txt, cap, fx in sc["_lines"]:
                pass
        else:
            for st, dd, txt, cap, fx in sc["_lines"]:
                if cap:
                    add(sfx, t0 + st, cached("bm", boom), 0.8)
    # ducking: music follows the inverse of the voice envelope
    hop = SR // 100
    nfr = N // hop
    ve = np.abs(voice[: nfr * hop]).reshape(nfr, hop).max(axis=1)
    target = np.where(ve > 0.02, 0.28, 1.0)
    g = np.empty(nfr)
    cur = 1.0
    for k in range(nfr):
        c = 0.35 if target[k] < cur else 0.04  # fast attack, slow release
        cur += (target[k] - cur) * c
        g[k] = cur
    gain = np.interp(np.arange(N), np.arange(nfr) * hop, g).astype(np.float32)
    music *= 0.55 / (np.abs(music).max() + 1e-9)
    mix = voice * 1.0 + music * gain + sfx * 0.9
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix *= 0.97 / (np.abs(mix).max() + 1e-9)
    mix = mix[: int(total * SR)]
    sf.write(out, np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype="PCM_16")
    print("audio written", out, len(mix) / SR)
