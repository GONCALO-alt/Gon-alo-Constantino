#!/usr/bin/env python3
"""Gera o Reel diário de F1 a partir de um guião JSON.

Uso: python3 reels-f1/make_reel.py guiao.json --out PASTA

Produz em PASTA: reel.mp4 (1080x1920, voz pt_PT, legendas, efeitos, música),
capa.jpg e index.html (página de entrega). Ver reels-f1/README.md para o formato.
"""
from __future__ import annotations

import argparse
import html
import json
import math
import os
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
FPS = 30
SR = 44100
GAP = 0.30        # silêncio entre cenas
TRANS = 0.30      # duração da transição entre cenas
TAIL = 1.4        # tempo final depois da última fala
FONT_DIR = Path("/usr/share/fonts/opentype/inter")
F_BLACK = str(FONT_DIR / "InterDisplay-Black.otf")
F_BOLD = str(FONT_DIR / "InterDisplay-Bold.otf")
F_SEMI = str(FONT_DIR / "Inter-SemiBold.otf")

# Cores dos tempos por setor da F1: roxo (melhor absoluto), verde (melhor pessoal), amarelo.
TIPOS = {
    "gancho":   {"rotulo": "GANCHO",   "cor": (232, 40, 40)},
    "problema": {"rotulo": "O PROBLEMA", "cor": (245, 197, 24)},
    "contexto": {"rotulo": "CONTEXTO", "cor": (245, 197, 24)},
    "virada":   {"rotulo": "A VIRADA", "cor": (43, 212, 125)},
    "chamada":  {"rotulo": "E AGORA?", "cor": (181, 123, 255)},
}


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


# ---------------------------------------------------------------- voz
def voice_model() -> Path:
    d = Path(os.environ.get("REEL_VOICE_DIR", Path.home() / ".cache/reels-f1/voice"))
    m = d / "pt_PT-tugao-medium.onnx"
    if not m.exists():
        sys.exit(f"Voz não encontrada em {m}. Corre primeiro: bash reels-f1/setup.sh")
    return m


def tts(text: str, out_wav: Path, model: Path) -> np.ndarray:
    raw = out_wav.with_suffix(".raw.wav")
    run([sys.executable, "-m", "piper", "-m", str(model), "-f", str(raw),
         "--length-scale", "0.88", "--sentence-silence", "0.12"],
        input=text.encode(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-ac", "1", "-ar", str(SR),
         "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                "highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"
                "equalizer=f=3500:t=q:w=1:g=3",
         str(out_wav)])
    return read_wav(out_wav)


def read_wav(p: Path) -> np.ndarray:
    with wave.open(str(p)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    return a / 32768.0


def write_wav(p: Path, a: np.ndarray) -> None:
    a = np.clip(a, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- efeitos sonoros (sintetizados)
rng = np.random.default_rng(7)


def env(n: int, attack: float, release: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / max(release, 1e-4))


def sfx_whoosh(dur=0.45) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # filtro passa-banda que sobe e desce (varrimento)
    out = np.zeros(n); y1 = y2 = 0.0
    for i in range(n):
        f = 300 + 3200 * math.sin(math.pi * i / n)
        r = 0.97; c = 2 * r * math.cos(2 * math.pi * f / SR)
        y = noise[i] * (1 - r) + c * y1 - r * r * y2
        out[i] = y; y2, y1 = y1, y
    out *= np.sin(np.linspace(0, math.pi, n)) ** 2
    return out / (np.abs(out).max() + 1e-9) * 0.5


def sfx_pop() -> np.ndarray:
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 900 * np.exp(-t * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.03) * 0.45


def sfx_rev(dur=1.6) -> np.ndarray:
    """Motor a subir de rotação (dente de serra com vibrato), como numa partida."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = 70 + 260 * (t / dur) ** 1.6 + 6 * np.sin(2 * np.pi * 28 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    saw2 = 2 * ((ph * 2.01 / (2 * np.pi)) % 1) - 1
    a = (saw * 0.6 + saw2 * 0.3) * np.minimum(1, t / 0.15) * np.clip((dur - t) / 0.35, 0, 1)
    k = np.ones(12) / 12  # suaviza o som
    return np.convolve(a, k, "same") * 0.22


def sfx_ding() -> np.ndarray:
    n = int(1.2 * SR); t = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * f * t) * g for f, g in ((1318, 1), (1976, .5), (2637, .25)))
    return tone * env(n, 0.003, 0.35) * 0.18


def music_bed(dur: float, bpm=124) -> np.ndarray:
    n = int(dur * SR); out = np.zeros(n); beat = 60 / bpm
    kick_n = int(0.25 * SR); tk = np.arange(kick_n) / SR
    kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tk * 35)) / SR) * np.exp(-tk * 9)
    hat_n = int(0.05 * SR)
    hat = np.diff(rng.standard_normal(hat_n + 1)) * np.exp(-np.arange(hat_n) / SR * 90) * 0.12
    roots = [55.0, 55.0, 65.41, 49.0]  # Lá, Lá, Dó, Sol (graves)
    b = 0
    while b * beat < dur:
        s = int(b * beat * SR)
        def add(x, at):
            e = min(n, at + len(x))
            if at < n: out[at:e] += x[: e - at]
        add(kick * 0.9, s)
        add(hat, s + int(beat / 2 * SR))
        f = roots[(b // 8) % 4]
        bn = int(beat * 0.45 * SR); tb = np.arange(bn) / SR
        bass = np.sign(np.sin(2 * np.pi * f * tb)) * 0.5 + np.sin(2 * np.pi * f * 2 * tb) * 0.3
        add(np.convolve(bass, np.ones(30) / 30, "same") * np.exp(-tb * 5) * 0.35, s + int(beat / 2 * SR))
        b += 1
    fade = int(1.5 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out[: int(0.8 * SR)] *= np.linspace(0, 1, int(0.8 * SR))
    return out


# ---------------------------------------------------------------- imagens
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, f, max_w: int) -> list[str]:
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if draw.textlength(t, font=f) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur); cur = word
    if cur: lines.append(cur)
    return lines


def fit_text(draw, text, path, max_w, max_h, start=150, minimum=60, spacing=1.05):
    size = start
    while size > minimum:
        f = font(path, size)
        lines = wrap(draw, text, f, max_w)
        h = len(lines) * size * spacing
        if h <= max_h and all(draw.textlength(l, font=f) <= max_w for l in lines):
            return f, lines, size
        size -= 6
    f = font(path, minimum)
    return f, wrap(draw, text, f, max_w), minimum


def background(cor) -> Image.Image:
    """Fundo escuro tipo asfalto + faixa de zebra (vermelho/branco) e luz da cor da cena."""
    S = 1.12
    w, h = int(W * S), int(H * S)
    noise = rng.normal(0, 1, (h // 4, w // 4))
    base = np.clip(16 + noise * 5, 0, 255).astype(np.uint8)
    img = Image.fromarray(base).resize((w, h), Image.BILINEAR).convert("RGB")
    glow = Image.new("RGB", (w, h), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.1, -h * 0.25, w * 1.3, h * 0.45], fill=tuple(int(c * 0.55) for c in cor))
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    img = Image.blend(img, Image.fromarray(np.clip(np.asarray(img, np.int16) + np.asarray(glow, np.int16), 0, 255).astype(np.uint8)), 1)
    # linhas de velocidade, discretas e só na metade de baixo
    lines = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lines)
    for _ in range(14):
        y = rng.uniform(0.62, 0.86) * h
        x = rng.uniform(-0.2, 0.9) * w
        ld.line([(x, y), (x + rng.uniform(140, 460), y)], fill=(255, 255, 255, 38), width=3)
    img = Image.alpha_composite(img.convert("RGBA"), lines).convert("RGB")
    d = ImageDraw.Draw(img)
    # zebra (corretor) diagonal em baixo, dentro da área visível
    stripe, top = 70, h - (h - H) // 2 - 150
    for i in range(-10, 30):
        x0 = i * stripe
        col = (215, 30, 30) if i % 2 == 0 else (235, 235, 235)
        d.polygon([(x0, top + 70), (x0 + stripe, top + 70), (x0 + stripe + 70, top), (x0 + 70, top)], fill=col)
    d.rectangle([0, top + 70, w, h], fill=(14, 14, 14))
    return img.filter(ImageFilter.GaussianBlur(0.6))


def render_scene(cena: dict, idx: int, total: int, data_txt: str, out: Path) -> None:
    tipo = TIPOS.get(cena.get("tipo", "contexto"), TIPOS["contexto"])
    cor = tuple(cena.get("cor", tipo["cor"]))
    img = background(cor)
    d = ImageDraw.Draw(img)
    ox = (img.width - W) // 2
    oy = (img.height - H) // 2
    m = 90  # margem lateral dentro da área visível

    # topo: marca + data + barra de 3 setores
    f_small = font(F_SEMI, 34)
    d.text((ox + m, oy + 150), "F1 · HOJE", font=font(F_BLACK, 40), fill=(255, 255, 255))
    d.text((ox + W - m, oy + 154), data_txt, font=f_small, fill=(200, 200, 200), anchor="ra")
    seg_w = (W - 2 * m - 20) / 3
    sector_cols = [(181, 123, 255), (43, 212, 125), (245, 197, 24)]
    for s in range(3):
        x0 = ox + m + s * (seg_w + 10)
        filled = (idx + 1) / total
        d.rounded_rectangle([x0, oy + 215, x0 + seg_w, oy + 225], 5, fill=(60, 60, 60))
        frac = min(1, max(0, filled * 3 - s))
        if frac > 0:
            d.rounded_rectangle([x0, oy + 215, x0 + seg_w * frac, oy + 225], 5, fill=sector_cols[s])

    # chip com número e tipo da cena
    chip = f"{idx + 1:02d}  {cena.get('rotulo', tipo['rotulo'])}"
    fc = font(F_BLACK, 40)
    tw = d.textlength(chip, font=fc)
    y = oy + 330
    d.rounded_rectangle([ox + m, y, ox + m + tw + 50, y + 74], 14, fill=cor)
    d.text((ox + m + 25, y + 37), chip, font=fc, fill=(12, 12, 12), anchor="lm")

    y += 130
    if cena.get("numero"):
        fnum, lines, size = fit_text(d, cena["numero"], F_BLACK, W - 2 * m, 360, start=330, minimum=140)
        for l in lines:
            d.text((ox + m, y), l, font=fnum, fill=cor)
            y += int(size * 0.98)
        y += 30
    limite = oy + 1180  # abaixo disto ficam as legendas
    reserva = 130 if cena.get("detalhe") else 0
    ftit, lines, size = fit_text(d, cena["ecra"], F_BLACK, W - 2 * m, min(560, limite - y - reserva),
                                 start=128, minimum=60)
    for l in lines:
        d.text((ox + m, y), l, font=ftit, fill=(255, 255, 255))
        y += int(size * 1.05)
    if cena.get("detalhe"):
        y += 26
        fd = font(F_SEMI, 42)
        for l in wrap(d, cena["detalhe"], fd, W - 2 * m)[: max(1, (limite + 60 - y) // 56)]:
            d.text((ox + m, y), l, font=fd, fill=(205, 205, 205))
            y += 56
    img.save(out, quality=95)


# ---------------------------------------------------------------- legendas
def ass_time(t: float) -> str:
    t = max(0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def ass_color(rgb) -> str:
    r, g, b = rgb
    return f"&H00{b:02X}{g:02X}{r:02X}"


def word_weights(words: list[str]) -> list[float]:
    ws = []
    for w in words:
        core = re.sub(r"[^\wÀ-ÿ]", "", w)
        v = 1.2 + len(core)
        if re.search(r"\d", core): v += 4  # números são lidos por extenso
        if w.endswith((",", ";")): v += 3
        if w.endswith((".", "!", "?", ":")): v += 6
        ws.append(v)
    return ws


def subtitles(cenas, starts, durs, out: Path) -> None:
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter Display Black,86,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,3,2,90,90,330,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    for cena, t0, dur in zip(cenas, starts, durs):
        cor = ass_color(tuple(cena.get("cor", TIPOS.get(cena.get("tipo"), TIPOS["contexto"])["cor"])))
        words = cena["fala"].split()
        wts = word_weights(words)
        tot = sum(wts)
        times, acc = [], t0
        for w in wts:
            times.append((acc, acc + dur * w / tot)); acc += dur * w / tot
        chunks, cur = [], []
        for i, w in enumerate(words):
            cur.append(i)
            if len(cur) == 3 or w.endswith((".", ",", "!", "?", ":", ";")) or len(" ".join(words[j] for j in cur)) > 16:
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for ch in chunks:
            for k in ch:
                parts = []
                for j in ch:
                    txt = words[j].upper()
                    parts.append(f"{{\\c{cor}}}{txt}{{\\c&H00FFFFFF&}}" if j == k else txt)
                s, e = times[k]
                pop = "{\\fscx108\\fscy108\\t(0,90,\\fscx100\\fscy100)}" if k == ch[0] else ""
                ev.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Sub,,0,0,0,,{pop}{' '.join(parts)}")
    out.write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- montagem
def build(guiao: dict, outdir: Path) -> dict:
    outdir.mkdir(parents=True, exist_ok=True)
    work = outdir / "_trabalho"
    work.mkdir(exist_ok=True)
    model = voice_model()
    cenas = guiao["cenas"]
    data_txt = guiao.get("data_curta") or guiao.get("data", "")

    voices, durs = [], []
    for i, c in enumerate(cenas):
        a = tts(c["fala"], work / f"voz_{i}.wav", model)
        voices.append(a); durs.append(len(a) / SR)

    # início de cada fala; a cena seguinte entra por cima do fim da transição
    starts, t = [], 0.25
    for i, dsec in enumerate(durs):
        starts.append(t)
        t += dsec + GAP
    scene_start = [0.0] + [s - 0.15 for s in starts[1:]]
    total = starts[-1] + durs[-1] + TAIL

    # áudio
    n = int(total * SR) + SR
    voz = np.zeros(n); fx = np.zeros(n)
    for a, s in zip(voices, starts):
        i0 = int(s * SR); voz[i0:i0 + len(a)] += a
    def put(x, at):
        i0 = max(0, int(at * SR)); e = min(n, i0 + len(x)); fx[i0:e] += x[: e - i0]
    put(sfx_rev(), 0.0)
    for i, c in enumerate(cenas):
        if i > 0: put(sfx_whoosh(), scene_start[i] - 0.2)
        if c.get("numero"): put(sfx_pop(), scene_start[i] + 0.12)
    put(sfx_ding(), starts[-1] + durs[-1] + 0.1)
    bed = music_bed(total)
    mus = np.zeros(n); mus[: len(bed)] = bed
    # baixa a música enquanto há voz (ducking simples)
    gate = np.convolve((np.abs(voz) > 0.01).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
    mus *= 0.16 * (1 - 0.55 * np.clip(gate * 3, 0, 1))
    mix = voz * 0.9 + fx * 0.8 + mus
    mix = mix[: int(total * SR)]
    write_wav(work / "mix.wav", mix / max(1.0, np.abs(mix).max()))

    # imagens e clips com movimento lento
    clips = []
    bounds = scene_start[1:] + [total]
    for i, c in enumerate(cenas):
        png = work / f"cena_{i}.jpg"
        render_scene(c, i, len(cenas), data_txt, png)
        L = bounds[i] - scene_start[i] + (TRANS if i < len(cenas) - 1 else 0)
        frames = int(round(L * FPS))
        dx = 0.06 * W * (1 if i % 2 == 0 else -1)
        clip = work / f"clip_{i}.mp4"
        sw, sh = int(W * 1.12), int(H * 1.12)
        x0 = (sw - W) / 2 - dx / 2
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(FPS), "-i", str(png),
             "-vf", f"scale={sw}:{sh},crop={W}:{H}:x='{x0}+{dx}*t/{L:.3f}':y='({sh}-{H})/2-20+40*t/{L:.3f}',format=yuv420p",
             "-frames:v", str(frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", str(clip)])
        clips.append((clip, L))

    # junta com transições e queima as legendas
    ass = work / "legendas.ass"
    subtitles(cenas, starts, durs, ass)
    inputs, fc, last, acc = [], [], "[0:v]", clips[0][1]
    for i, (clip, L) in enumerate(clips):
        inputs += ["-i", str(clip)]
    trans = ["slideleft", "smoothup", "slideright", "circleopen", "wipeleft", "smoothdown"]
    for i in range(1, len(clips)):
        off = acc - TRANS
        lbl = f"[v{i}]"
        fc.append(f"{last}[{i}:v]xfade=transition={trans[(i - 1) % len(trans)]}:duration={TRANS}:offset={off:.3f}{lbl}")
        last = lbl
        acc += clips[i][1] - TRANS
    fontsdir = str(FONT_DIR)
    fc.append(f"{last}subtitles={ass}:fontsdir={fontsdir},fade=t=in:st=0:d=0.25[vout]")
    mp4 = outdir / "reel.mp4"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-i", str(work / "mix.wav"),
         "-filter_complex", ";".join(fc), "-map", "[vout]", "-map", f"{len(clips)}:a",
         "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000",
         "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.2f}", str(mp4)])
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(1.2, total / 2):.2f}", "-i", str(mp4),
         "-frames:v", "1", "-q:v", "3", str(outdir / "capa.jpg")])
    if not os.environ.get("REEL_KEEP_WORK"):
        shutil.rmtree(work)
    return {"duracao": round(total, 1), "tamanho_mb": round(mp4.stat().st_size / 1e6, 1)}


# ---------------------------------------------------------------- página de entrega
def page(guiao: dict, info: dict) -> str:
    e = html.escape
    tipo_cor = {k: "#%02x%02x%02x" % v["cor"] for k, v in TIPOS.items()}
    linhas = "".join(
        f'<li><span class="tag" style="--c:{tipo_cor.get(c.get("tipo"), "#f5c518")}">'
        f'{e(c.get("rotulo", TIPOS.get(c.get("tipo"), TIPOS["contexto"])["rotulo"]))}</span>'
        f'<p>{e(c["fala"])}</p></li>' for c in guiao["cenas"])
    fontes = "".join(f'<li><a href="{e(f["url"])}" target="_blank" rel="noopener">{e(f["titulo"])}</a></li>'
                     for f in guiao.get("fontes", []))
    tags = " ".join("#" + t.lstrip("#") for t in guiao.get("hashtags", []))
    legenda = (guiao.get("legenda_post", "") + "\n\n" + tags).strip()
    virais = "".join(f"<li>{e(v)}</li>" for v in guiao.get("referencias_virais", []))
    return f"""<title>Reel F1 do Dia</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@600;700;900&family=Inter:wght@400;500;600&display=swap">
<style>
/* Layout: uma coluna tipo pit wall: vídeo à esquerda, guião e legenda à direita; empilha no telemóvel. */
:root {{
  --bg:#f3f2ef; --panel:#ffffff; --fg:#141414; --muted:#5c5a55; --line:#dcd9d2;
  --red:#d71e1e; --purple:#7b3fe4; --green:#14935a; --yellow:#b88a00;
  --display:"Titillium Web", "Arial Narrow", system-ui, sans-serif;
  --body:Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg:#0e0e10; --panel:#18181b; --fg:#f2f2f2; --muted:#a3a19c; --line:#2c2c30;
  --red:#ff3b3b; --purple:#b57bff; --green:#2bd47d; --yellow:#f5c518; color-scheme:dark }} }}
:root[data-theme="dark"] {{
  --bg:#0e0e10; --panel:#18181b; --fg:#f2f2f2; --muted:#a3a19c; --line:#2c2c30;
  --red:#ff3b3b; --purple:#b57bff; --green:#2bd47d; --yellow:#f5c518; color-scheme:dark }}
* {{ box-sizing:border-box }}
body {{ background:var(--bg); color:var(--fg); font:16px/1.55 var(--body);
  padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:28px 56px }}
.wrap {{ max-width:1080px; margin:0 auto; display:grid; gap:28px }}
header {{ display:grid; gap:6px; border-bottom:6px solid; border-image:repeating-linear-gradient(90deg,var(--red) 0 22px,var(--fg) 22px 44px) 1; padding-bottom:18px }}
.eyebrow {{ font:700 13px/1 var(--display); letter-spacing:.14em; text-transform:uppercase; color:var(--red) }}
h1 {{ font:900 clamp(30px,5vw,52px)/1.02 var(--display); margin:0; text-wrap:balance; text-transform:uppercase }}
.meta {{ color:var(--muted); font-variant-numeric:tabular-nums }}
.grid {{ display:grid; grid-template-columns:minmax(0,360px) minmax(0,1fr); gap:32px; align-items:start }}
@media (max-width:760px) {{ .grid {{ grid-template-columns:1fr }} }}
video {{ width:100%; max-width:100%; aspect-ratio:9/16; background:#000; border-radius:14px; display:block }}
.col {{ display:grid; gap:26px; min-width:0 }}
h2 {{ font:700 15px/1 var(--display); letter-spacing:.12em; text-transform:uppercase; margin:0 0 12px; color:var(--muted) }}
ol.guiao {{ list-style:none; margin:0; padding:0; display:grid; gap:14px }}
ol.guiao li {{ display:grid; grid-template-columns:118px 1fr; gap:14px; align-items:baseline }}
ol.guiao p {{ margin:0 }}
.tag {{ font:700 12px/1 var(--display); letter-spacing:.1em; padding:6px 8px; border-radius:6px; background:var(--c); color:#111; justify-self:start }}
.box {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 18px; min-width:0 }}
pre {{ white-space:pre-wrap; word-break:break-word; margin:0; font:15px/1.55 var(--body) }}
button {{ font:700 14px/1 var(--display); letter-spacing:.06em; text-transform:uppercase; border:0; border-radius:8px; padding:11px 16px; background:var(--red); color:#fff; cursor:pointer; margin-top:12px }}
button:focus-visible, a:focus-visible {{ outline:3px solid var(--purple); outline-offset:2px }}
ul {{ margin:0; padding-left:20px }} a {{ color:var(--purple) }}
.note {{ color:var(--muted); font-size:14px }}
</style>
<div class="wrap">
<header>
  <span class="eyebrow">Reel do dia · F1</span>
  <h1>{e(guiao['titulo'])}</h1>
  <span class="meta">{e(guiao.get('data', ''))} · {info['duracao']} s · {info['tamanho_mb']} MB · voz sintética pt-PT</span>
</header>
<div class="grid">
  <div class="col">
    <video src="reel.mp4" poster="capa.jpg" controls playsinline preload="metadata"></video>
    <p class="note">Para guardar: abre o vídeo em ecrã inteiro e usa o menu do leitor, ou pede-me o ficheiro.</p>
  </div>
  <div class="col">
    <section><h2>Legenda para publicar</h2>
      <div class="box"><pre id="legenda">{e(legenda)}</pre><button id="copiar" type="button">Copiar legenda</button></div></section>
    <section><h2>Guião</h2><ol class="guiao">{linhas}</ol></section>
    <section><h2>Porque este tema</h2><div class="box"><p style="margin:0">{e(guiao.get('analise', ''))}</p>
      {f'<ul style="margin-top:10px">{virais}</ul>' if virais else ''}</div></section>
    <section><h2>Fontes</h2><ul>{fontes}</ul></section>
  </div>
</div>
</div>
<script>
document.getElementById('copiar').addEventListener('click', async (ev) => {{
  const t = document.getElementById('legenda').innerText;
  try {{ await navigator.clipboard.writeText(t); ev.target.textContent = 'Copiada'; }}
  catch (_) {{ const r = document.createRange(); r.selectNodeContents(document.getElementById('legenda'));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); ev.target.textContent = 'Seleccionada: copia à mão'; }}
}});
</script>
"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("guiao")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    guiao = json.loads(Path(a.guiao).read_text(encoding="utf-8"))
    outdir = Path(a.out)
    info = build(guiao, outdir)
    (outdir / "index.html").write_text(page(guiao, info), encoding="utf-8")
    shutil.copy(a.guiao, outdir / "guiao.json")
    print(json.dumps({"pasta": str(outdir), **info}, ensure_ascii=False))


if __name__ == "__main__":
    main()
