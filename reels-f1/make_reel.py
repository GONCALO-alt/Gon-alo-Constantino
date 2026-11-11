#!/usr/bin/env python3
"""Gera o Reel diário de F1 a partir de um guião JSON.

Uso: python3 reels-f1/make_reel.py guiao.json --out PASTA

Produz em PASTA: reel.mp4 (1080x1920, voz inglesa, animações, legendas, efeitos,
música), capa.jpg e index.html (página de entrega). Ver reels-f1/ROTINA.md.
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
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import visuais  # noqa: E402

W, H = 1080, 1920
FPS = 30
SR = 44100
GAP = 0.30        # silêncio entre falas
WIPE = 0.40       # duração da transição em diagonal
TAIL = 2.0        # tempo final depois da última fala (bandeira de xadrez)
M = 90            # margem lateral
LIMITE_TEXTO = 1180  # abaixo disto ficam as legendas
FONT_DIR = Path("/usr/share/fonts/opentype/inter")
F_BLACK = str(FONT_DIR / "InterDisplay-Black.otf")
F_SEMI = str(FONT_DIR / "Inter-SemiBold.otf")
VOZ_PADRAO = "en_GB-northern_english_male-medium"

# Cores dos tempos por setor da F1: roxo (melhor absoluto), verde (melhor pessoal), amarelo.
TIPOS = {
    "gancho":   {"rotulo": "THE HOOK",    "cor": (232, 40, 40)},
    "problema": {"rotulo": "THE PROBLEM", "cor": (245, 197, 24)},
    "contexto": {"rotulo": "CONTEXT",     "cor": (245, 197, 24)},
    "virada":   {"rotulo": "THE TWIST",   "cor": (43, 212, 125)},
    "chamada":  {"rotulo": "YOUR CALL",   "cor": (181, 123, 255)},
}
SECTOR_COLS = [(181, 123, 255), (43, 212, 125), (245, 197, 24)]


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def ease_out(x):
    x = clamp(x); return 1 - (1 - x) ** 3


def ease_back(x):
    x = clamp(x); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def ease_in_out(x):
    x = clamp(x); return 3 * x * x - 2 * x * x * x


def cor_da(cena):
    return tuple(cena.get("cor", TIPOS.get(cena.get("tipo"), TIPOS["contexto"])["cor"]))


# ---------------------------------------------------------------- voz
def voice_model(nome: str) -> Path:
    d = Path(os.environ.get("REEL_VOICE_DIR", Path.home() / ".cache/reels-f1/voice"))
    m = d / f"{nome}.onnx"
    if not m.exists():
        sys.exit(f"Voz não encontrada em {m}. Corre primeiro: bash reels-f1/setup.sh")
    return m


def tts(text: str, out_wav: Path, model: Path, speaker: int | None) -> np.ndarray:
    raw = out_wav.with_suffix(".raw.wav")
    cmd = [sys.executable, "-m", "piper", "-m", str(model), "-f", str(raw),
           "--length-scale", "0.86", "--sentence-silence", "0.10"]
    if speaker is not None:
        cmd += ["-s", str(speaker)]
    run(cmd, input=text.encode(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
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


def sfx_tick() -> np.ndarray:
    n = int(0.03 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.006) * 0.18


def sfx_impact() -> np.ndarray:
    n = int(0.5 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(40 + 120 * np.exp(-t * 18)) / SR) * np.exp(-t * 6)
    return (boom * 0.6 + rng.standard_normal(n) * np.exp(-t * 40) * 0.25) * 0.6


def sfx_rev(dur=1.6) -> np.ndarray:
    """Motor a subir de rotação (dente de serra com vibrato), como numa partida."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = 70 + 260 * (t / dur) ** 1.6 + 6 * np.sin(2 * np.pi * 28 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    saw2 = 2 * ((ph * 2.01 / (2 * np.pi)) % 1) - 1
    a = (saw * 0.6 + saw2 * 0.3) * np.minimum(1, t / 0.15) * np.clip((dur - t) / 0.35, 0, 1)
    return np.convolve(a, np.ones(12) / 12, "same") * 0.22


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
    roots = [55.0, 55.0, 65.41, 49.0]
    b = 0

    def add(x, at):
        e = min(n, at + len(x))
        if at < n: out[at:e] += x[: e - at]
    while b * beat < dur:
        s = int(b * beat * SR)
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


# ---------------------------------------------------------------- texto
@lru_cache(maxsize=None)
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


_MEDIR = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def wrap(text: str, f, max_w: int) -> list[str]:
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if _MEDIR.textlength(t, font=f) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur); cur = word
    if cur: lines.append(cur)
    return lines


def fit_text(text, path, max_w, max_h, start=150, minimum=60, spacing=1.05):
    size = start
    while size > minimum:
        f = font(path, size)
        lines = wrap(text, f, max_w)
        if len(lines) * size * spacing <= max_h and all(_MEDIR.textlength(l, font=f) <= max_w for l in lines):
            return f, lines, size
        size -= 6
    f = font(path, minimum)
    return f, wrap(text, f, max_w), minimum


@lru_cache(maxsize=4096)
def text_img(text: str, path: str, size: int, fill: tuple) -> Image.Image:
    f = font(path, size)
    w = int(_MEDIR.textlength(text, font=f)) + 12
    im = Image.new("RGBA", (max(w, 1), int(size * 1.3)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), text, font=f, fill=fill)
    return im


def with_alpha(im: Image.Image, a: float) -> Image.Image:
    if a >= 0.999: return im
    im = im.copy()
    im.putalpha(im.getchannel("A").point(lambda p: int(p * a)))
    return im


# ---------------------------------------------------------------- fundos
def base_background(cor) -> Image.Image:
    """Asfalto escuro com uma luz da cor da cena no topo."""
    noise = rng.normal(0, 1, (H // 4, (W + 200) // 4))
    base = np.clip(16 + noise * 5, 0, 255).astype(np.uint8)
    img = Image.fromarray(base).resize((W + 200, H), Image.BILINEAR).convert("RGB")
    glow = Image.new("RGB", img.size, (0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W * 0.05, -H * 0.25, W * 1.3, H * 0.45], fill=tuple(int(c * 0.55) for c in cor))
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    return ImageChops.add(img, glow)


def zebra_strip() -> Image.Image:
    stripe = 70
    im = Image.new("RGB", (W + 4 * stripe, 80), (14, 14, 14))
    d = ImageDraw.Draw(im)
    for i in range(-3, (W + 4 * stripe) // stripe + 3):
        x0 = i * stripe
        col = (215, 30, 30) if i % 2 == 0 else (235, 235, 235)
        d.polygon([(x0, 70), (x0 + stripe, 70), (x0 + stripe + 70, 0), (x0 + 70, 0)], fill=col)
    return im


def lines_strip() -> Image.Image:
    """Linhas de velocidade numa faixa larga que desliza para a esquerda."""
    h = 420
    im = Image.new("RGBA", (W * 2, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = np.random.default_rng(3)
    for _ in range(36):
        y = r.uniform(0, h); x = r.uniform(0, W * 2); L = r.uniform(140, 520)
        d.line([(x, y), (x + L, y)], fill=(255, 255, 255, int(r.uniform(18, 55))), width=3)
        if x + L > W * 2:
            d.line([(x - W * 2, y), (x + L - W * 2, y)], fill=(255, 255, 255, 40), width=3)
    return im


ZEBRA = None
LINES = None


# ---------------------------------------------------------------- cenas animadas
class Cena:
    """Prepara os elementos de uma cena e desenha-a num instante qualquer."""

    def __init__(self, cena: dict, idx: int, total: int, data_txt: str):
        self.c = cena
        self.idx, self.total = idx, total
        self.cor = cor_da(cena)
        self.bg = base_background(self.cor)
        self.data_txt = data_txt
        tipo = TIPOS.get(cena.get("tipo", "contexto"), TIPOS["contexto"])
        self.chip_txt = f"{idx + 1:02d}  {cena.get('rotulo', tipo['rotulo'])}"
        y = 440
        self.visual = visuais.criar(cena.get("visual"))
        compacto = self.visual is not None
        # número grande (opcional). «A → B» anima: A aparece, seta desliza, B conta de A até B.
        self.num = None
        if cena.get("numero"):
            txt = cena["numero"]
            f, lines, size = fit_text(txt, F_BLACK, W - 2 * M, 170 if compacto else 360,
                                      start=170 if compacto else 330, minimum=90 if compacto else 140)
            self.num = {"txt": txt, "size": size, "y": y}
            y += int(size * 0.98) * len(lines) + (10 if compacto else 30)
        reserva = 130 if cena.get("detalhe") and not compacto else 0
        if compacto:
            f, lines, size = fit_text(cena["ecra"], F_BLACK, W - 2 * M, 150, start=80, minimum=50)
        else:
            f, lines, size = fit_text(cena["ecra"], F_BLACK, W - 2 * M, min(560, LIMITE_TEXTO - y - reserva),
                                      start=128, minimum=60)
        self.lines = []
        for l in lines:
            self.lines.append((l, size, y)); y += int(size * 1.05)
        self.det = []
        if compacto:
            y += 30
            self.vbox = (M - 30, y, W - 2 * (M - 30), max(560, 1400 - y))
        elif cena.get("detalhe"):
            y += 26
            fd = font(F_SEMI, 42)
            for l in wrap(cena["detalhe"], fd, W - 2 * M)[: max(1, (LIMITE_TEXTO + 60 - y) // 56)]:
                self.det.append((l, y)); y += 56
        self.t_texto = 0.55 if self.num else 0.15
        self.dur = 5.0  # definido em build()

    # -- contagem do número (usada também para os «tiques» sonoros)
    def num_parts(self, u: float) -> list[tuple[str, float, float]]:
        """Devolve [(texto, alfa, escala)] das partes do número no instante u."""
        txt = self.num["txt"]
        if "→" in txt:
            a, b = [s.strip() for s in txt.split("→", 1)]
            na, nb = _int(a), _int(b)
            p_b = ease_out((u - 0.75) / 0.7)
            if na is not None and nb is not None:
                v = round(na + (nb - na) * p_b)
                b_txt = _set_num(b, v)
            else:
                b_txt = b
            return [(a, clamp(u / 0.15), _pop(u - 0.05)), ("→", clamp((u - 0.45) / 0.2), 1.0),
                    (b_txt, clamp((u - 0.7) / 0.1), _pop(u - 0.7))]
        n = _int(txt)
        if n is not None:
            v = round(n * ease_out((u - 0.05) / 0.8))
            return [(_set_num(txt, v), clamp(u / 0.12), _pop(u - 0.05))]
        return [(txt, clamp(u / 0.15), _pop(u - 0.05))]

    def num_value_track(self, dur: float) -> list[float]:
        """Instantes (relativos à cena) em que o número muda, para os tiques."""
        if not self.num: return []
        out, prev = [], None
        for k in range(int(dur * FPS)):
            u = k / FPS
            s = "".join(p[0] for p in self.num_parts(u) if p[1] > 0)
            if prev is not None and s != prev and re.search(r"\d", s):
                out.append(u)
            prev = s
        return out

    def draw(self, u: float, t_global: float, total_dur: float) -> Image.Image:
        # fundo com deslize lento (parallax)
        off = int(100 + 90 * math.sin(u * 0.6 + self.idx))
        img = self.bg.crop((off, 0, off + W, H))
        # linhas de velocidade
        lx = int((t_global * 1400) % W)
        img.paste(LINES.crop((lx, 0, lx + W, LINES.height)), (0, 1080), LINES.crop((lx, 0, lx + W, LINES.height)))
        # zebra a correr
        zx = int((t_global * 420) % 140)
        img.paste(ZEBRA.crop((zx, 0, zx + W, ZEBRA.height)), (0, H - 230))
        d = ImageDraw.Draw(img)
        d.rectangle([0, H - 160, W, H], fill=(14, 14, 14))

        # topo: marca, data e barra dos 3 setores a encher ao longo do vídeo
        d.text((M, 150), "F1 TODAY", font=font(F_BLACK, 40), fill=(255, 255, 255))
        d.text((W - M, 154), self.data_txt, font=font(F_SEMI, 34), fill=(200, 200, 200), anchor="ra")
        seg_w = (W - 2 * M - 20) / 3
        prog = clamp(t_global / total_dur)
        for s in range(3):
            x0 = M + s * (seg_w + 10)
            d.rounded_rectangle([x0, 215, x0 + seg_w, 225], 5, fill=(60, 60, 60))
            frac = clamp(prog * 3 - s)
            if frac > 0.01:
                d.rounded_rectangle([x0, 215, x0 + seg_w * frac, 225], 5, fill=SECTOR_COLS[s])

        # chip: entra da esquerda com ressalto
        fc = font(F_BLACK, 40)
        tw = d.textlength(self.chip_txt, font=fc)
        cx = M - (1 - ease_back(u / 0.4)) * (tw + 200)
        d.rounded_rectangle([cx, 330, cx + tw + 50, 404], 14, fill=self.cor)
        d.text((cx + 25, 367), self.chip_txt, font=fc, fill=(12, 12, 12), anchor="lm")

        # número grande
        if self.num:
            x = M; y = self.num["y"]; size = self.num["size"]
            for txt, a, sc in self.num_parts(u):
                if a <= 0:
                    x += _MEDIR.textlength(txt + " ", font=font(F_BLACK, size)); continue
                im = text_img(txt, F_BLACK, size, self.cor)
                if abs(sc - 1) > 0.01:
                    im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR)
                dx = 0 if txt != "→" else -40 * (1 - a)
                img.alpha_composite(with_alpha(im, a), (int(x + dx), int(y - (im.height - size * 1.3) / 2))) \
                    if img.mode == "RGBA" else img.paste(im, (int(x + dx), int(y - (im.height - size * 1.3) / 2)), with_alpha(im, a))
                x += _MEDIR.textlength(txt + " ", font=font(F_BLACK, size))

        # título: linhas sobem e aparecem em cascata
        for i, (l, size, y) in enumerate(self.lines):
            p = (u - self.t_texto - i * 0.09) / 0.35
            if p <= 0: continue
            im = text_img(l, F_BLACK, size, (255, 255, 255))
            img.paste(im, (M, int(y + 60 * (1 - ease_out(p)))), with_alpha(im, ease_out(p)))
        # detalhe: desliza da direita
        for i, (l, y) in enumerate(self.det):
            p = (u - self.t_texto - 0.45 - i * 0.08) / 0.35
            if p <= 0: continue
            im = text_img(l, F_SEMI, 42, (210, 210, 210))
            img.paste(im, (int(M + 120 * (1 - ease_out(p))), y), with_alpha(im, ease_out(p)))

        # sublinhado animado debaixo do título
        if self.lines:
            l, size, y = self.lines[-1]
            p = ease_out((u - self.t_texto - 0.3) / 0.5)
            if p > 0:
                lw = _MEDIR.textlength(l, font=font(F_BLACK, size))
                yy = y + int(size * 1.08)
                if self.det: yy = min(yy, self.det[0][1] - 14)
                d.rectangle([M, yy, M + lw * p, yy + 8], fill=self.cor)

        # visual animado (repetição GPS, gráfico, notícia, meme...): sobe a partir de baixo
        if self.visual:
            p = ease_out((u - 0.25) / 0.45)
            if p > 0:
                bx, by, bw, bh = self.vbox
                by2 = int(by + 260 * (1 - p))
                if p < 1:
                    layer = img.copy()
                    self.visual.draw(layer, (bx, by2, bw, bh), u, self.dur)
                    img = Image.blend(img, layer, p)
                else:
                    self.visual.draw(img, (bx, by2, bw, bh), u, self.dur)

        # abanão quando o número aterra (só no gancho)
        if self.num and self.c.get("tipo") == "gancho":
            for t_hit in (0.05, 0.7):
                k = u - t_hit
                if 0 < k < 0.35:
                    amp = 18 * (1 - k / 0.35)
                    img = ImageChops.offset(img, int(amp * math.sin(k * 90)), int(amp * math.cos(k * 70)))
        return img


def _int(s: str):
    m = re.search(r"\d+", s)
    return int(m.group()) if m else None


def _set_num(s: str, v: int) -> str:
    """Troca o primeiro número por v e corrige o sufixo ordinal inglês (1st, 2nd, 3rd, 4th)."""
    def rep(m):
        suf = m.group(2)
        if suf and suf.lower() in ("st", "nd", "rd", "th"):
            suf = "th" if 10 <= v % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(v % 10, "th")
        return f"{v}{suf}"
    return re.sub(r"(\d+)([A-Za-z]{0,2})", rep, s, count=1)


def _pop(k: float) -> float:
    """Escala de «pop»: começa a 1.35 e assenta em 1.0."""
    if k < 0: return 1.35
    return 1 + 0.35 * (1 - ease_out(k / 0.28))


_GRAIN = None
_VIGNETTE = None


def post_fx(frame: Image.Image, t: float, cuts: list[float], beat: float) -> Image.Image:
    """Zoom de batida, flash e glitch RGB nos cortes, grão de filme e vinheta."""
    global _GRAIN, _VIGNETTE
    if _GRAIN is None:
        r = np.random.default_rng(11)
        _GRAIN = [Image.fromarray(np.clip(128 + r.normal(0, 10, (H // 2, W // 2)), 0, 255).astype(np.uint8))
                  .resize((W, H)).convert("RGB") for _ in range(4)]
        yy, xx = np.mgrid[0:H // 4, 0:W // 4]
        dist = np.sqrt(((xx - W / 8) / (W / 8)) ** 2 + ((yy - H / 8) / (H / 8)) ** 2)
        v = np.clip(1.08 - 0.42 * dist ** 2.2, 0.45, 1) * 255
        _VIGNETTE = Image.fromarray(v.astype(np.uint8)).resize((W, H), Image.BILINEAR).convert("RGB")
    since_cut = min((t - c for c in cuts if t >= c), default=99)
    # zoom: forte em cada corte, leve em cada batida
    z = 0.0
    if since_cut < 0.35: z = 0.07 * (1 - ease_out(since_cut / 0.35))
    else:
        bp = (t % beat) / beat
        if int(t / beat) % 2 == 0 and bp < 0.25: z = 0.012 * (1 - bp / 0.25)
    if z > 0.002:
        cw, ch = int(W / (1 + z)), int(H / (1 + z))
        frame = frame.crop(((W - cw) // 2, (H - ch) // 2, (W - cw) // 2 + cw, (H - ch) // 2 + ch)).resize((W, H), Image.BILINEAR)
    # glitch RGB e flash logo a seguir ao corte
    if since_cut < 0.14:
        k = int(26 * (1 - since_cut / 0.14))
        r_, g_, b_ = frame.split()
        frame = Image.merge("RGB", (ImageChops.offset(r_, k, 0), g_, ImageChops.offset(b_, -k, 0)))
        if since_cut < 0.07:
            frame = Image.blend(frame, Image.new("RGB", (W, H), (255, 255, 255)), 0.35 * (1 - since_cut / 0.07))
    frame = ImageChops.multiply(frame, _VIGNETTE)
    frame = Image.blend(frame, ImageChops.overlay(frame, _GRAIN[int(t * FPS / 3) % 4]), 0.5)
    return frame


def wipe(old: Image.Image, new: Image.Image, p: float, cor) -> Image.Image:
    """Transição: uma faixa em diagonal varre o ecrã; à esquerda dela já está a cena nova."""
    p = ease_in_out(p)
    x = -500 + (W + 1000) * p
    slant = 500
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon([(-10, 0), (x + slant, 0), (x, H), (-10, H)], fill=255)
    out = Image.composite(new, old, mask)
    d = ImageDraw.Draw(out)
    for off, w, col in ((0, 60, cor), (60, 18, (255, 255, 255))):
        d.polygon([(x + slant - off, 0), (x + slant - off - w, 0), (x - off - w, H), (x - off, H)], fill=col)
    return out


def chequered(img: Image.Image, p: float, t: float) -> Image.Image:
    """Bandeira de xadrez a ondular, que sobe no fim do vídeo."""
    if p <= 0: return img
    d = ImageDraw.Draw(img)
    sq = 90
    top = H - 160 - int(760 * ease_out(p))
    for gx in range(-1, W // sq + 2):
        wave_y = 22 * math.sin(gx * 0.7 - t * 7)
        for gy in range(0, 9):
            col = (240, 240, 240) if (gx + gy) % 2 == 0 else (20, 20, 20)
            x0 = gx * sq; y0 = top + gy * sq + wave_y
            d.rectangle([x0, y0, x0 + sq, y0 + sq], fill=col)
    if p > 0.6:
        fbig, _, _ = fit_text("SEE YOU TOMORROW", F_BLACK, W - 2 * M, 130, start=110, minimum=50)
        d.text((W // 2 + 4, top - 106), "SEE YOU TOMORROW", font=fbig, fill=(0, 0, 0), anchor="mm")
        d.text((W // 2, top - 110), "SEE YOU TOMORROW", font=fbig, fill=(255, 255, 255), anchor="mm")
    return img


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
        if re.search(r"\d", core): v += 4
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
Style: Sub,Inter Display Black,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,3,2,90,90,330,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    for cena, t0, dur in zip(cenas, starts, durs):
        cor = ass_color(cor_da(cena))
        words = cena["fala"].split()
        wts = word_weights(words)
        tot = sum(wts)
        times, acc = [], t0
        for w in wts:
            times.append((acc, acc + dur * w / tot)); acc += dur * w / tot
        chunks, cur = [], []
        for i, w in enumerate(words):
            cur.append(i)
            if len(cur) == 3 or w.endswith((".", ",", "!", "?", ":", ";")) or len(" ".join(words[j] for j in cur)) > 14:
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for ch in chunks:
            for k in ch:
                parts = []
                for j in ch:
                    txt = words[j].upper()
                    parts.append(f"{{\\c{cor}\\fscx112\\fscy112}}{txt}{{\\c&H00FFFFFF&\\fscx100\\fscy100}}" if j == k else txt)
                s, e = times[k]
                pop = "{\\fscx115\\fscy115\\t(0,100,\\fscx100\\fscy100)}" if k == ch[0] else ""
                ev.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Sub,,0,0,0,,{pop}{' '.join(parts)}")
    out.write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- montagem
def build(guiao: dict, outdir: Path) -> dict:
    global ZEBRA, LINES
    ZEBRA, LINES = zebra_strip(), lines_strip()
    outdir.mkdir(parents=True, exist_ok=True)
    work = outdir / "_trabalho"
    work.mkdir(exist_ok=True)
    voz_cfg = guiao.get("voz", {})
    model = voice_model(voz_cfg.get("modelo", VOZ_PADRAO))
    speaker = voz_cfg.get("speaker")
    cenas = guiao["cenas"]
    data_txt = guiao.get("data_curta") or guiao.get("data", "")

    voices, durs = [], []
    for i, c in enumerate(cenas):
        a = tts(c["fala"], work / f"voz_{i}.wav", model, speaker)
        voices.append(a); durs.append(len(a) / SR)

    starts, t = [], 0.35
    for dsec in durs:
        starts.append(t); t += dsec + GAP
    # cada cena começa um pouco antes da sua fala; a transição fica centrada nesse ponto
    scene_start = [0.0] + [s - 0.15 for s in starts[1:]]
    speech_end = starts[-1] + durs[-1]
    total = speech_end + TAIL

    cenas_obj = [Cena(c, i, len(cenas), data_txt) for i, c in enumerate(cenas)]
    bounds = scene_start[1:] + [total]
    for co, a, b in zip(cenas_obj, scene_start, bounds):
        co.dur = b - a

    # áudio
    n = int(total * SR) + SR
    voz = np.zeros(n); fx = np.zeros(n)
    for a, s in zip(voices, starts):
        i0 = int(s * SR); voz[i0:i0 + len(a)] += a

    def put(x, at, g=1.0):
        i0 = max(0, int(at * SR)); e = min(n, i0 + len(x)); fx[i0:e] += x[: e - i0] * g
    put(sfx_rev(), 0.0)
    tick = sfx_tick()
    for i, co in enumerate(cenas_obj):
        if i > 0: put(sfx_whoosh(), scene_start[i] - 0.25)
        if co.num:
            put(sfx_impact() if co.c.get("tipo") == "gancho" else sfx_pop(), scene_start[i] + 0.05)
            if "→" in co.num["txt"]: put(sfx_impact(), scene_start[i] + 0.7)
            for u in co.num_value_track(bounds[i] - scene_start[i]):
                put(tick, scene_start[i] + u)
    put(sfx_whoosh(0.6), speech_end + 0.1)
    put(sfx_ding(), speech_end + 0.5)
    bed = music_bed(total)
    mus = np.zeros(n); mus[: len(bed)] = bed
    gate = np.convolve((np.abs(voz) > 0.01).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
    mus *= 0.16 * (1 - 0.55 * np.clip(gate * 3, 0, 1))
    mix = (voz * 0.9 + fx * 0.8 + mus)[: int(total * SR)]
    write_wav(work / "mix.wav", mix / max(1.0, np.abs(mix).max()))

    ass = work / "legendas.ass"
    subtitles(cenas, starts, durs, ass)

    # vídeo: cada fotograma é desenhado aqui e enviado ao ffmpeg, que junta legendas e áudio
    mp4 = outdir / "reel.mp4"
    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-i", str(work / "mix.wav"),
         "-filter_complex", f"[0:v]subtitles={ass}:fontsdir={FONT_DIR},format=yuv420p[v]",
         "-map", "[v]", "-map", "1:a", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000",
         "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-maxrate", "3M", "-bufsize", "6M", "-profile:v", "high",
         "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", str(mp4)],
        stdin=subprocess.PIPE)
    nframes = int(total * FPS)
    for k in range(nframes):
        t = k / FPS
        i = max(j for j in range(len(cenas_obj)) if scene_start[j] <= t)
        co = cenas_obj[i]
        frame = co.draw(t - scene_start[i], t, total)
        # transição para a cena seguinte, centrada no início dela
        if i + 1 < len(cenas_obj) and t > scene_start[i + 1] - WIPE / 2:
            nxt = cenas_obj[i + 1].draw(t - scene_start[i + 1], t, total)
            frame = wipe(frame, nxt, (t - (scene_start[i + 1] - WIPE / 2)) / WIPE, cenas_obj[i + 1].cor)
        elif i > 0 and t < scene_start[i] + WIPE / 2:
            prv = cenas_obj[i - 1].draw(t - scene_start[i - 1], t, total)
            frame = wipe(prv, frame, (t - (scene_start[i] - WIPE / 2)) / WIPE, co.cor)
        if t > speech_end:
            frame = chequered(frame, (t - speech_end - 0.1) / 0.7, t)
        frame = post_fx(frame, t, scene_start[1:] + [speech_end + 0.1], 60 / 124)
        if t < 0.25:  # entrada a partir de preto
            frame = Image.blend(Image.new("RGB", (W, H)), frame, t / 0.25)
        ff.stdin.write(frame.convert("RGB").tobytes())
    ff.stdin.close()
    if ff.wait() != 0:
        sys.exit("ffmpeg falhou a gerar o vídeo")

    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(1.6, total / 2):.2f}", "-i", str(mp4),
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
/* Layout: duas colunas tipo pit wall (vídeo | guião e legenda); empilha no telemóvel. */
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
  <span class="meta">{e(guiao.get('data', ''))} · {info['duracao']} s · {info['tamanho_mb']} MB · voz sintética inglesa</span>
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
