# -*- coding: utf-8 -*-
"""Banda sonora original sintetizada + efeitos + mistura com a narração (ducking).
Tudo gerado por código: sem direitos de terceiros."""
import os, json, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import timeline

SR = 44100
OUT = os.environ.get("OUT", "build")
rng = np.random.default_rng(7)
BPM = 120.0
BEAT = 60.0 / BPM


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    return 2 * np.mod(t * f * (1 + detune), 1.0) - 1


def env_adsr(n, a=0.01, r=0.3):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na)
    nr = min(nr, n - na)
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(chord, n, bright=900, vol=0.12):
    x = np.zeros(n)
    for note in chord:
        for d in (-0.004, 0.0, 0.005):
            x += saw(midi(note), n, d)
    x = lp(x, bright, 2) * vol / len(chord)
    return x


def kick(n_len=0.45):
    n = int(n_len * SR); t = np.arange(n) / SR
    f = 40 + 90 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * 0.9


def hat():
    n = int(0.05 * SR)
    return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 90) * 0.12


def pluck(note, dur=0.22, vol=0.18):
    n = int(dur * SR); t = np.arange(n) / SR
    x = saw(midi(note), n) * np.exp(-t * 14)
    return lp(x, 2400) * vol


def piano(note, dur=1.6, vol=0.16):
    n = int(dur * SR); t = np.arange(n) / SR
    f = midi(note)
    x = (np.sin(2*np.pi*f*t) + 0.4*np.sin(4*np.pi*f*t) + 0.15*np.sin(6*np.pi*f*t)) * np.exp(-t * 2.4)
    x[:200] *= np.linspace(0, 1, 200)
    return x * vol


def impact():
    n = int(2.8 * SR); t = np.arange(n) / SR
    f = 32 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    noise = lp(rng.standard_normal(n), 1800) * np.exp(-t * 6) * 0.5
    return (boom + noise) * 0.9


def whoosh(d=0.6):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = n // 8
    for k in range(8):
        lo = 300 + 3000 * (k / 8); hi = lo * 2.2
        s = slice(k * seg, (k + 1) * seg if k < 7 else n)
        out[s] = bp(x[s], lo, min(hi, 18000))
    return out * np.sin(np.pi * t) ** 2 * 0.35


def riser(d=2.5):
    n = int(d * SR); t = np.linspace(0, 1, n)
    f = 200 + 1800 * t ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    noise = hp(rng.standard_normal(n), 2000) * 0.25
    return (tone + noise) * t ** 2.5 * 0.6


def braam(root, d=3.5):
    n = int(d * SR)
    x = sum(saw(midi(root + iv), n, dt) for iv in (0, 12, 7) for dt in (-0.006, 0.006))
    e = np.exp(-np.arange(n) / SR * 0.9)
    sweep = lp(x, 600) * e
    return sweep * 0.14


# progressões (MIDI) — Ré menor épico / Dó maior emocional
DARK = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]]   # Dm Bb F C
TENSE = [[50, 57, 62, 65], [50, 56, 62, 65], [49, 56, 61, 64], [50, 57, 62, 65]]
HOPE = [[48, 55, 60, 64], [43, 55, 59, 62], [45, 52, 57, 60], [41, 53, 57, 60]]   # C G Am F

MOOD = {"cold": ("tense", 0.6), "title": ("dark", 0.9), "chapter": ("dark", 0.5),
        "rules": ("drive", 0.55), "grid": ("drive", 0.55), "controversy": ("tense", 0.7),
        "race": ("drive", 1.0), "news": ("tense", 0.6), "midseason": ("dark", 0.5),
        "champion": ("hope", 1.0), "teams": ("drive", 0.6), "standings": ("drive", 0.6),
        "outro": ("hope", 0.8)}


def section(kind, inten, n, t_off):
    x = np.zeros(n)
    bar = 4 * BEAT
    prog = {"dark": DARK, "tense": TENSE, "drive": DARK, "hope": HOPE}[kind]
    nb = int(np.ceil(n / SR / bar)) + 1
    for b in range(nb):
        s = int(b * bar * SR)
        if s >= n:
            break
        ch = prog[b % 4]
        L = min(int(bar * SR) + int(0.3 * SR), n - s)
        bright = {"dark": 700, "tense": 500, "drive": 1100, "hope": 1600}[kind]
        x[s:s + L] += pad(ch, L, bright, 0.10 + 0.04 * inten) * env_adsr(L, 0.4, 0.5)
        # baixo sub
        bass = np.sin(2 * np.pi * midi(ch[0] - 12) * np.arange(L) / SR) * 0.10
        x[s:s + L] += bass * env_adsr(L, 0.05, 0.4)
        if kind == "drive":
            for k in range(16):  # ostinato em semicolcheias
                p = s + int(k * BEAT / 4 * SR)
                note = ch[[0, 2, 1, 2][k % 4]] + 12
                pl = pluck(note, 0.2, 0.06 + 0.05 * inten)
                e = min(len(pl), n - p)
                if e > 0: x[p:p + e] += pl[:e]
            for k in range(4):
                p = s + int(k * BEAT * SR)
                if inten > 0.7 or k % 2 == 0:
                    kk = kick() * (0.35 + 0.3 * inten)
                    e = min(len(kk), n - p)
                    if e > 0: x[p:p + e] += kk[:e]
            for k in range(8):
                p = s + int((k + 0.5) * BEAT / 2 * SR)
                hh = hat() * inten
                e = min(len(hh), n - p)
                if e > 0: x[p:p + e] += hh[:e]
        elif kind == "tense":
            for k in range(8):  # relógio
                p = s + int(k * BEAT / 2 * SR)
                tk = hp(rng.standard_normal(int(0.03 * SR)), 3000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 150) * 0.10
                e = min(len(tk), n - p)
                if e > 0: x[p:p + e] += tk[:e]
            for k in (0, 1):  # batimento cardíaco
                p = s + int((k * 2) * BEAT * SR)
                kk = kick(0.3) * 0.35 * inten
                e = min(len(kk), n - p)
                if e > 0: x[p:p + e] += kk[:e]
        elif kind == "hope":
            arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12]
            for k in range(8):
                p = s + int(k * BEAT / 2 * SR)
                pn = piano(arp[k] + 12, 1.4, 0.07 + 0.05 * inten)
                e = min(len(pn), n - p)
                if e > 0: x[p:p + e] += pn[:e]
            if inten > 0.9:
                for k in range(4):
                    p = s + int(k * BEAT * SR)
                    kk = kick() * 0.4
                    e = min(len(kk), n - p)
                    if e > 0: x[p:p + e] += kk[:e]
    return x


def add(buf, sig, t, gain=1.0):
    p = int(t * SR)
    if p < 0:
        sig = sig[-p:]; p = 0
    e = min(len(sig), len(buf) - p)
    if e > 0:
        buf[p:p + e] += sig[:e] * gain


def main():
    scenes, T = timeline.build(OUT)
    N = int((T + 1) * SR)
    music = np.zeros(N)
    sfx = np.zeros(N)
    vo = np.zeros(N)
    # secções musicais com crossfade
    XF = 1.2
    for sc in scenes:
        kind, inten = MOOD[sc["type"]]
        s0 = max(0, sc["start"] - XF / 2); s1 = min(T, sc["end"] + XF / 2)
        n = int((s1 - s0) * SR)
        sec = section(kind, inten, n, s0)
        fade = int(XF * SR)
        w = np.ones(n); w[:fade] = np.linspace(0, 1, fade) ** 0.5; w[-fade:] = np.linspace(1, 0, fade) ** 0.5
        add(music, sec * w, s0)
    # efeitos
    for k, sc in enumerate(scenes):
        typ = sc["type"]
        if typ in ("race", "chapter", "title", "champion", "controversy", "news"):
            add(sfx, riser(2.2), sc["start"] - 2.2, 0.8)
            add(sfx, impact(), sc["start"], 0.9)
            if typ in ("chapter", "title", "champion"):
                add(sfx, braam(38, 4.0), sc["start"], 1.0)
        else:
            add(sfx, whoosh(0.7), sc["start"] - 0.35, 0.8)
        if typ == "race":
            add(sfx, impact(), sc["end"] - 4.4, 0.6)   # cartão do pódio
            add(sfx, whoosh(0.6), sc["end"] - 4.6, 0.7)
        last = None
        for ln in sc["lines"]:
            cap = ln["cap"]
            if cap and cap != last:
                if cap.startswith("!"):
                    add(sfx, impact(), ln["t0"], 0.55)
                else:
                    add(sfx, whoosh(0.45), ln["t0"] - 0.2, 0.45)
                last = cap
            if ln["wav"]:
                a = np.fromfile(ln["wav"], np.float32).astype(np.float64)
                add(vo, a, ln["t0"])
    # voz: compressão leve + EQ + "sala"
    vo = hp(vo, 80)
    pk = np.max(np.abs(vo)) + 1e-9
    vo = vo / pk * 0.85
    vo = np.tanh(vo * 1.6) / np.tanh(1.6)
    ir_n = int(0.5 * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 11)
    ir = lp(ir, 5000); ir /= np.sum(np.abs(ir))
    vo_wet = fftconvolve(vo, ir)[:N] * 6
    vo = vo * 0.92 + vo_wet * 0.08
    # ducking pela voz
    env = np.abs(vo)
    win = int(0.25 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    env = np.clip(env / 0.06, 0, 1)
    duck = 1.0 - 0.72 * env
    duck = np.convolve(duck, np.ones(win) / win, mode="same")
    mus = (music * 0.9 + 0) * duck
    # reverb na música
    irm_n = int(2.2 * SR)
    irm = rng.standard_normal(irm_n) * np.exp(-np.arange(irm_n) / SR * 2.5)
    irm = lp(irm, 4000); irm /= np.sum(np.abs(irm))
    mus = mus + fftconvolve(mus, irm)[:N] * 12 * 0.25
    fx = sfx * (1.0 - 0.45 * env)
    mix_l = vo * 1.0 + mus * 0.78 + fx * 0.55
    mix_r = vo * 1.0 + np.roll(mus, 220) * 0.78 + np.roll(fx, 90) * 0.55
    st = np.stack([mix_l, mix_r], 1)
    # fade final + limitador
    fo = int(4 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    st = np.tanh(st * 1.1) * 0.89
    st.astype(np.float32).tofile(os.path.join(OUT, "mix.f32"))
    print("mix ok", st.shape, T)


if __name__ == "__main__":
    main()
