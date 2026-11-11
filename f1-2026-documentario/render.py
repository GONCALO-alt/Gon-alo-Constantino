# -*- coding: utf-8 -*-
"""Renderização do vídeo (1920x1080, 25 fps): arte original, tipografia cinética."""
import os, sys, math, json, subprocess, textwrap
from functools import lru_cache
from multiprocessing import Pool
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import guiao, timeline

W, H, FPS = 1920, 1080, 25
OUT = os.environ.get("OUT", "build")
FONTS = os.environ.get("FONTS", "fonts")
F_ANTON = os.path.join(FONTS, "anton-latin-400-normal.ttf")
F_BARLOW = os.path.join(FONTS, "barlow-condensed-latin-800-normal.ttf")
F_BARLOW6 = os.path.join(FONTS, "barlow-condensed-latin-600-normal.ttf")
F_INTER = os.path.join(FONTS, "inter-latin-400-normal.ttf")
F_INTERB = os.path.join(FONTS, "inter-latin-700-normal.ttf")
RED = (225, 6, 0)
GOLD = (240, 196, 70)
WHITE = (255, 255, 255)

TEAMNAME = {"MER": "MERCEDES", "FER": "FERRARI", "MCL": "McLAREN", "RBR": "RED BULL",
            "RB": "RACING BULLS", "ALP": "ALPINE", "HAA": "HAAS", "WIL": "WILLIAMS",
            "AUD": "AUDI", "AST": "ASTON MARTIN", "CAD": "CADILLAC"}
TEAMCARD = {
    "MER": ("1.º", "652", "12 VITÓRIAS", "CAMPEÃ DE CONSTRUTORES"),
    "FER": ("2.º", "512", "2 VITÓRIAS", "HAMILTON · LECLERC"),
    "RBR": ("3.º", "415", "2 VITÓRIAS", "VERSTAPPEN · HADJAR"),
    "MCL": ("4.º", "398", "3 VITÓRIAS", "NORRIS · PIASTRI"),
    "RB": ("5.º", "112", "MELHOR DO RESTO", "LAWSON · LINDBLAD"),
    "ALP": ("6.º", "69", "MOTOR MERCEDES", "GASLY · COLAPINTO"),
    "HAA": ("7.º–9.º", "31 · 28 · 12", "HAAS · AUDI · WILLIAMS", ""),
    "AST": ("10.º–11.º", "7 · 0", "ASTON MARTIN · CADILLAC", ""),
}
GRID = [("MER", "Antonelli · Russell"), ("FER", "Leclerc · Hamilton"), ("MCL", "Norris · Piastri"),
        ("RBR", "Verstappen · Hadjar"), ("RB", "Lawson · Lindblad"), ("ALP", "Gasly · Colapinto"),
        ("HAA", "Ocon · Bearman"), ("WIL", "Sainz · Albon"), ("AUD", "Hulkenberg · Bortoleto"),
        ("AST", "Alonso · Stroll"), ("CAD", "Pérez · Bottas")]
LEADER = {1: "Russell", 2: "Russell"}  # a partir do Japão: Antonelli


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


@lru_cache(maxsize=64)
def font(path, size):
    return ImageFont.truetype(path, size)


# ------------------------------------------------------------------ sprites de texto
@lru_cache(maxsize=512)
def text_sprite(text, path, size, color=WHITE, glow=None, glow_r=18, stroke=0, tracking=0):
    f = font(path, size)
    if tracking:
        ws = [f.getbbox(ch)[2] - f.getbbox(ch)[0] if ch != " " else size * 0.28 for ch in text]
        tw = int(sum(ws) + tracking * (len(text) - 1))
    else:
        b = f.getbbox(text, stroke_width=stroke)
        tw = b[2] - b[0]
    asc, desc = f.getmetrics()
    th = asc + desc
    pad = glow_r * 3 if glow else 8
    im = Image.new("RGBA", (tw + pad * 2 + stroke * 2, th + pad * 2 + stroke * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0 = pad + stroke - (0 if tracking else f.getbbox(text, stroke_width=stroke)[0])
    if tracking:
        x = pad
        for ch, wch in zip(text, ws):
            d.text((x - f.getbbox(ch)[0] if ch != " " else x, pad), ch, font=f, fill=color)
            x += wch + tracking
    else:
        d.text((x0, pad + stroke), text, font=f, fill=color, stroke_width=stroke, stroke_fill=color)
    if glow:
        a = im.split()[3]
        g = Image.new("RGBA", im.size, glow + (0,))
        g.putalpha(a.filter(ImageFilter.GaussianBlur(glow_r)).point(lambda v: min(255, int(v * 2.2))))
        g.alpha_composite(im)
        im = g
    return im


def fit_size(text, path, maxw, start):
    s = start
    while s > 20:
        f = font(path, s)
        b = f.getbbox(text)
        if b[2] - b[0] <= maxw:
            return s
        s -= 6
    return s


def paste(canvas, spr, cx, cy, scale=1.0, alpha=1.0, anchor="c"):
    if alpha <= 0.01:
        return
    if abs(scale - 1.0) > 0.003:
        spr = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * scale))), Image.BILINEAR)
    if alpha < 0.999:
        a = spr.split()[3].point(lambda v: int(v * alpha))
        spr = spr.copy(); spr.putalpha(a)
    if anchor == "c":
        x, y = int(cx - spr.width / 2), int(cy - spr.height / 2)
    elif anchor == "l":
        x, y = int(cx), int(cy - spr.height / 2)
    else:
        x, y = int(cx - spr.width), int(cy - spr.height / 2)
    canvas.alpha_composite(spr, (max(x, -spr.width + 1), max(y, -spr.height + 1))) if (x >= 0 and y >= 0) else _paste_clip(canvas, spr, x, y)


def _paste_clip(canvas, spr, x, y):
    cx0, cy0 = max(0, -x), max(0, -y)
    spr = spr.crop((cx0, cy0, spr.width, spr.height))
    canvas.alpha_composite(spr, (max(x, 0), max(y, 0)))


# ------------------------------------------------------------------ fundos
_bg_cache = {}


def base_bg(accent):
    if accent in _bg_cache:
        return _bg_cache[accent]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W * 0.5) / W) ** 2 + ((yy - H * 0.55) / H) ** 2)
    glow = np.clip(1 - r * 1.6, 0, 1) ** 2
    base = np.zeros((H, W, 3), np.float32)
    base[:] = (10, 10, 14)
    acc = np.array(accent, np.float32)
    base += glow[..., None] * acc * 0.33
    vign = np.clip(1 - (r * 1.15) ** 2.2, 0.15, 1)
    base *= vign[..., None]
    _bg_cache[accent] = (base, glow)
    return _bg_cache[accent]


_streaks = None


def streaks():
    global _streaks
    if _streaks is None:
        rng = np.random.default_rng(3)
        im = Image.new("L", (W * 2, H), 0)
        d = ImageDraw.Draw(im)
        for _ in range(140):
            y = rng.integers(0, H); x = rng.integers(0, W * 2); L = rng.integers(80, 600)
            v = int(rng.integers(20, 90)); th = int(rng.integers(1, 3))
            d.line([(x, y), (x + L, y - L * 0.18)], fill=v, width=th)
        im = im.filter(ImageFilter.GaussianBlur(1.2))
        _streaks = np.asarray(im, np.float32) / 255.0
    return _streaks


_grain = None


def grain(i):
    global _grain
    if _grain is None:
        rng = np.random.default_rng(5)
        _grain = [cv2.resize(rng.normal(0, 3.0, (H // 3, W // 3)).astype(np.float32), (W, H),
                             interpolation=cv2.INTER_NEAREST) for _ in range(6)]
    return _grain[(i // 2) % 6]


def background(t, gi, accent, speed=1.0, pulse=0.0, lines=0.5):
    base, glow = base_bg(accent)
    f = base.copy()
    if pulse:
        f += glow[..., None] * np.array(accent, np.float32) * pulse
    if lines > 0:
        st = streaks()
        off = int((t * 900 * speed) % W)
        sl = st[:, W - off: 2 * W - off]
        f += sl[..., None] * np.array([255, 255, 255], np.float32) * 0.22 * lines
        f += sl[..., None] * np.array(accent, np.float32) * 0.35 * lines
    # faixa de luz que varre
    ph = (t * 0.12) % 1.0
    xc = -400 + ph * (W + 800)
    xs = np.arange(W, dtype=np.float32)
    band = np.exp(-((xs - xc) / 260) ** 2) * 18
    f += band[None, :, None]
    f += grain(gi)[..., None]
    return f


def to_pil(f):
    return Image.fromarray(np.clip(f, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def post(img, t_imp, zoom=1.0, shake=0.0, gi=0):
    """img RGBA -> np RGB com zoom lento, tremor e aberração cromática."""
    a = np.asarray(img.convert("RGB"))
    if zoom != 1.0 or shake:
        rng = np.random.default_rng(gi)
        dx, dy = (rng.uniform(-1, 1, 2) * shake) if shake else (0, 0)
        M = np.array([[zoom, 0, (1 - zoom) * W / 2 + dx], [0, zoom, (1 - zoom) * H / 2 + dy]], np.float32)
        a = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    if t_imp is not None and 0 <= t_imp < 0.45:
        k = int(14 * (1 - t_imp / 0.45))
        if k > 0:
            a = a.copy()
            a[..., 0] = np.roll(a[..., 0], k, axis=1)
            a[..., 2] = np.roll(a[..., 2], -k, axis=1)
    return a


# ------------------------------------------------------------------ elementos
def caption_sprites(cap, color=WHITE, big=200, glowc=None):
    lines = cap.split("|")
    out = []
    for i, ln in enumerate(lines):
        sz = big if i == 0 else int(big * 0.55)
        if len(lines) == 2 and i == 1 and len(ln) > 18:
            sz = int(big * 0.42)
        sz = fit_size(ln, F_ANTON, 1650, sz)
        out.append(text_sprite(ln, F_ANTON, sz, color, glowc, 22))
    return out


def draw_caption(canvas, cap, lt, cy=500, impact=False, color=WHITE, big=200, accent=RED):
    if not cap:
        return
    imp = cap.startswith("!")
    c = cap[1:] if imp else cap
    label = None
    parts = c.split("|")
    if parts[0] in ("FATO", "OPINIÃO", "MERCEDES:"):
        label, c = parts[0], "|".join(parts[1:])
    col = color
    sprs = caption_sprites(c, col, big if not imp else int(big * 1.1), ((255, 20, 0) if imp else (0, 0, 0)))
    e = ease_out(lt / 0.35)
    scale = (1.35 - 0.35 * e) if imp else (1.12 - 0.12 * e)
    scale *= 1 + 0.02 * lt  # deriva lenta (câmara lenta)
    alpha = min(1.0, lt / 0.18)
    total = sum(s.height * 0.78 for s in sprs)
    y = cy - total / 2
    if label:
        lc = (40, 200, 120) if label == "FATO" else ((255, 190, 0) if label == "OPINIÃO" else WHITE)
        ls = text_sprite(label, F_BARLOW, 54, lc, None, 0, 0, 6)
        bx = Image.new("RGBA", (ls.width + 30, ls.height - 6), (0, 0, 0, 170))
        paste(canvas, bx, W / 2, y - 40, 1, alpha)
        paste(canvas, ls, W / 2, y - 40, 1, alpha)
        y += 20
    for s in sprs:
        h = s.height * 0.78
        paste(canvas, s, W / 2, y + h / 2, scale, alpha)
        y += h


def draw_subtitle(canvas, text, lt, dur):
    if not text:
        return
    a = min(1.0, lt / 0.15, max(0.0, (dur + 0.3 - lt) / 0.2))
    if a <= 0:
        return
    wrapped = textwrap.wrap(text, 78)
    if len(wrapped) > 2:
        # mostra metade conforme o tempo
        half = (len(wrapped) + 1) // 2
        wrapped = wrapped[:half] if lt < dur * half / len(wrapped) else wrapped[half:]
    y = 1000 - 22 * (len(wrapped) - 1)
    for i, ln in enumerate(wrapped):
        s = sub_sprite(ln)
        paste(canvas, s, W / 2, y + i * 46, 1, a)


@lru_cache(maxsize=1024)
def sub_sprite(ln):
    f = font(F_INTER, 33)
    b = f.getbbox(ln)
    im = Image.new("RGBA", (b[2] - b[0] + 36, 46), (0, 0, 0, 150))
    ImageDraw.Draw(im).text((18 - b[0], 5), ln, font=f, fill=(235, 235, 235))
    return im


def tag(canvas, text, x, y, col, size=42, alpha=1.0):
    s = text_sprite(text, F_BARLOW, size, WHITE, None, 0, 0, 3)
    bar = Image.new("RGBA", (s.width + 14, s.height - 10), col + (230,))
    paste(canvas, bar, x, y, 1, alpha, "l")
    paste(canvas, s, x + 7, y, 1, alpha, "l")


def season_strip(canvas, rnd, alpha=1.0):
    n = 19
    x0, x1, y = 360, 1560, 1052
    for k in range(n):
        x = x0 + (x1 - x0) * k / (n - 1)
        d = ImageDraw.Draw(canvas)
        if k < rnd:
            col = guiao.C[guiao.P[guiao.WINNERS[k]]]
            r = 9 if k < rnd - 1 else 13
            d.ellipse([x - r, y - r, x + r, y + r], fill=col + (int(255 * alpha),))
        else:
            d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(120, 120, 120, int(200 * alpha)), width=2)


# ------------------------------------------------------------------ cenas
def scene_frame(sc, data, t, gi):
    """Devolve np RGB para o tempo local t."""
    typ = sc["type"]
    lines = sc["lines"]
    dur = sc["end"] - sc["start"]
    tg = sc["start"] + t
    # linha ativa
    cur, curl = None, None
    for ln in lines:
        if tg >= ln["t0"] - 0.05:
            cur = ln
    capline = None
    for ln in lines:
        if ln["cap"] and tg >= ln["t0"] - 0.05:
            capline = ln
    accent = RED
    if typ == "race":
        winner = data["podium"][0]
        accent = guiao.C[guiao.P[winner]] if winner else RED
    elif typ in ("champion",):
        accent = GOLD
    elif typ == "cold":
        accent = (150, 0, 0)
    elif typ == "controversy":
        accent = (200, 20, 20)
    elif typ == "news":
        accent = (200, 30, 30)

    pulse = 0.0
    t_imp = None
    if capline and capline["cap"].startswith("!"):
        t_imp = tg - capline["t0"]
        pulse = max(0, 0.6 * (1 - t_imp / 0.6))
    lines_amt = {"race": 0.9, "cold": 0.4, "title": 0.7, "chapter": 0.3, "champion": 0.5}.get(typ, 0.45)
    f = background(tg, gi, accent, 1.0, pulse, lines_amt)
    cv = to_pil(f)
    hud = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    zoom, shake = 1.0, 0.0
    if t_imp is not None and t_imp < 0.5:
        shake = 10 * (1 - t_imp / 0.5)

    fade_in = min(1.0, t / 0.4)
    fade_out = min(1.0, (dur - t) / 0.35)
    fa = min(fade_in, fade_out)

    if typ == "title":
        e = ease_out(t / 1.2)
        s1 = text_sprite("F1 2026", F_ANTON, 300, WHITE, RED, 30)
        paste(cv, s1, W / 2, 430, 1.25 - 0.25 * e, min(1, t / 0.5) * fade_out)
        s2 = text_sprite("TUDO O QUE ACONTECEU ATÉ O BRASIL", F_BARLOW, 78, WHITE, None, 0, 0, 10)
        paste(cv, s2, W / 2, 640, 1, ease_out((t - 0.8) / 0.8) * fade_out)
        w = int(1100 * ease_out((t - 0.5) / 1.0))
        if w > 2:
            paste(cv, Image.new("RGBA", (w, 6), RED + (255,)), W / 2, 700, 1, fade_out)
        s3 = text_sprite("UM DOCUMENTÁRIO DA TEMPORADA · DA AUSTRÁLIA AO BRASIL", F_BARLOW6, 36, (180, 180, 180), None, 0, 0, 4)
        paste(cv, s3, W / 2, 750, 1, ease_out((t - 1.6) / 0.8) * fade_out)
        zoom = 1 + 0.03 * t / dur
    elif typ == "chapter":
        e = ease_out(t / 0.9)
        n = text_sprite("CAPÍTULO " + data["num"], F_BARLOW, 56, RED, None, 0, 0, 14)
        paste(cv, n, W / 2, 400, 1, e * fade_out)
        tt = text_sprite(data["title"], F_ANTON, fit_size(data["title"], F_ANTON, 1700, 190), WHITE, (0, 0, 0), 20)
        paste(cv, tt, W / 2, 540, 1.15 - 0.15 * e, e * fade_out)
        w = int(700 * ease_out((t - 0.3) / 0.8))
        if w > 2:
            paste(cv, Image.new("RGBA", (w, 5), RED + (255,)), W / 2, 660, 1, fade_out)
        zoom = 1 + 0.04 * t / dur
    elif typ == "race":
        intro_end = lines[0]["t0"] - sc["start"]
        podium_start = dur - 4.6
        if t < intro_end + 0.2:
            # cartão de abertura
            e = ease_out(t / 0.7)
            fl = data["flag"]
            for k, col in enumerate(fl):
                w = int(W * ease_out((t - k * 0.12) / 0.6))
                if w > 0:
                    bar = Image.new("RGBA", (w, 26), col + (255,))
                    paste(cv, bar, 0, 300 + k * 26, 1, 1, "l")
            s = text_sprite("ETAPA %02d / 22" % data["rnd"], F_BARLOW, 60, WHITE, None, 0, 0, 12)
            paste(cv, s, W / 2, 440, 1, e)
            g = text_sprite(data["gp"], F_ANTON, fit_size(data["gp"], F_ANTON, 1700, 230), WHITE, (0, 0, 0), 20)
            paste(cv, g, W / 2, 600, 1.2 - 0.2 * e, min(1, t / 0.3))
            c2 = text_sprite(data["circuit"] + "  ·  " + data["date"], F_BARLOW6, 50, (200, 200, 200), None, 0, 0, 6)
            paste(cv, c2, W / 2, 750, 1, ease_out((t - 0.5) / 0.6))
            zoom = 1 + 0.05 * t / max(intro_end, 0.1)
            if t < 0.45:
                t_imp = t
                shake = 12 * (1 - t / 0.45)
        elif t < podium_start:
            # cabeçalho + legenda
            tag(hud, "R%02d · %s" % (data["rnd"], data["gp"]), 60, 70, accent if accent != (255, 255, 255) else RED, 44)
            if capline:
                draw_caption(cv, capline["cap"], tg - capline["t0"], 480)
            zoom = 1 + 0.035 * min(1.0, (tg - (capline["t0"] if capline else 0)) / 8)
        else:
            tp = t - podium_start
            hdr = text_sprite("PÓDIO · " + data["gp"], F_BARLOW, 54, WHITE, None, 0, 0, 10)
            paste(cv, hdr, W / 2, 190, 1, ease_out(tp / 0.4) * fade_out)
            order = [1, 0, 2]
            xs = [W / 2 - 520, W / 2, W / 2 + 520]
            hs = [300, 400, 230]
            for k, pi in enumerate(order):
                name = data["podium"][pi]
                if not name:
                    continue
                col = guiao.C[guiao.P[name]]
                e = ease_out((tp - 0.15 * k) / 0.6)
                h = int(hs[k] * e)
                if h > 2:
                    blk = Image.new("RGBA", (420, h), col + (235,))
                    cv.alpha_composite(blk, (int(xs[k] - 210), 900 - h))
                    num = text_sprite("P%d" % (pi + 1), F_ANTON, 110, (0, 0, 0) if sum(col) > 400 else WHITE)
                    paste(cv, num, xs[k], 900 - h + 80, 1, e * fade_out)
                nm = text_sprite(name.upper(), F_ANTON, 92, WHITE, (0, 0, 0), 14)
                paste(cv, nm, xs[k], 900 - hs[k] - 120, 1, e * fade_out)
                tm = text_sprite(TEAMNAME[guiao.P[name]], F_BARLOW6, 36, col, None, 0, 0, 5)
                paste(cv, tm, xs[k], 900 - hs[k] - 45, 1, e * fade_out)
            lead = LEADER.get(data["rnd"], "Antonelli")
            if data["rnd"] >= 18:
                ltxt = "CAMPEÃO: ANTONELLI"
            else:
                ltxt = "LÍDER DO CAMPEONATO: " + lead.upper()
            tag(hud, ltxt, W / 2 - 250, 960, guiao.C[guiao.P[lead]] if data["rnd"] < 18 else GOLD, 40, ease_out((tp - 0.8) / 0.5) * fade_out)
        season_strip(hud, data["rnd"] - (0 if t >= podium_start else 1) if data["rnd"] > 1 or t >= podium_start else 0, fa)
    elif typ == "rules":
        draw_rules(cv, capline, tg)
        tag(hud, "AS REGRAS DE 2026", 60, 70, RED, 44)
    elif typ == "grid":
        draw_grid(cv, capline, tg, t)
        tag(hud, "O GRID DE 2026", 60, 70, RED, 44)
    elif typ == "controversy":
        st = text_sprite(data.get("title", "POLÉMICA"), F_BARLOW, 48, WHITE, None, 0, 0, 8)
        tag(hud, data.get("title", "POLÉMICA"), 60, 70, RED, 44)
        if capline:
            draw_caption(cv, capline["cap"], tg - capline["t0"], 500, big=150)
    elif typ == "news":
        tag(hud, "ÚLTIMA HORA", 60, 70, RED, 44)
        if capline:
            draw_caption(cv, capline["cap"], tg - capline["t0"], 500)
    elif typ == "champion":
        draw_confetti(cv, t)
        if capline:
            draw_caption(cv, capline["cap"], tg - capline["t0"], 470, color=GOLD if not capline["cap"].startswith("!") else WHITE)
        s = text_sprite("CAMPEÃO DO MUNDO 2026", F_BARLOW, 56, GOLD, None, 0, 0, 14)
        paste(cv, s, W / 2, 160, 1, fa)
        zoom = 1 + 0.03 * t / dur
    elif typ == "teams":
        draw_team(cv, capline, tg)
    elif typ == "standings":
        draw_standings(cv, data, capline, tg, t)
    elif typ == "midseason":
        tag(hud, "PAUSA DE VERÃO", 60, 70, RED, 44)
        if capline:
            col = WHITE
            if "ASTON" in capline["cap"]:
                col = guiao.C["AST"]
            if "CADILLAC" in capline["cap"]:
                col = guiao.C["CAD"]
            draw_caption(cv, capline["cap"], tg - capline["t0"], 500, color=col)
    elif typ == "outro":
        last = lines[-1]
        if tg < last["t1"] + 0.3 and capline:
            draw_caption(cv, capline["cap"], tg - capline["t0"], 500)
        else:
            tt = tg - last["t1"] - 0.3
            s1 = text_sprite("F1 2026", F_ANTON, 220, WHITE, RED, 26)
            paste(cv, s1, W / 2, 380, 1, ease_out(tt / 0.6) * fade_out)
            cr = ["FONTES: FORMULA1.COM · FIA · IMPRENSA ESPECIALIZADA (THE RACE, PLANETF1, SKY SPORTS, AP)",
                  "CLASSIFICAÇÃO EM 11 DE NOVEMBRO DE 2026 · APÓS O GP DO BRASIL (ETAPA 19 DE 22)",
                  "ARTE E MÚSICA ORIGINAIS · NARRAÇÃO SINTÉTICA EM PORTUGUÊS DO BRASIL"]
            for k, ln in enumerate(cr):
                s = text_sprite(ln, F_BARLOW6, 34, (190, 190, 190), None, 0, 0, 2)
                paste(cv, s, W / 2, 590 + k * 56, 1, ease_out((tt - 0.5 - 0.2 * k) / 0.6) * fade_out)
    elif typ == "cold":
        if capline:
            draw_caption(cv, capline["cap"], tg - capline["t0"], 520, big=210)
        zoom = 1 + 0.035 * min(1.0, (tg - (capline["t0"] if capline else 0)) / 6)

    # legendas (narração)
    if cur and cur["text"] and typ not in ("title",):
        draw_subtitle(hud, cur["text"], tg - cur["t0"], cur["t1"] - cur["t0"])
    a = post(cv, t_imp, zoom, shake, gi)
    hi = Image.fromarray(a).convert("RGBA"); hi.alpha_composite(hud); a = np.asarray(hi.convert("RGB"))
    if fa < 1:
        a = (a.astype(np.float32) * (0.25 + 0.75 * fa)).astype(np.uint8) if typ not in ("race",) else a
    return a


def draw_confetti(cv, t):
    rng = np.random.default_rng(11)
    d = ImageDraw.Draw(cv)
    for k in range(160):
        x0 = rng.uniform(0, W); sp = rng.uniform(80, 260); ph = rng.uniform(0, 10)
        y = (rng.uniform(-H, 0) + t * sp) % (H + 40) - 20
        x = x0 + 30 * math.sin(t * 2 + ph)
        col = [GOLD, WHITE, guiao.C["MER"], (200, 200, 200)][k % 4]
        s = rng.uniform(4, 10)
        d.rectangle([x, y, x + s, y + s * 0.5], fill=col + (200,))


def draw_rules(cv, capline, tg):
    if not capline:
        return
    cap = capline["cap"]; lt = tg - capline["t0"]
    if not cap.startswith("@"):
        draw_caption(cv, cap, lt, 500)
        return
    e = ease_out(lt / 1.2)
    d = ImageDraw.Draw(cv)
    if cap == "@split":
        x0, x1, y = 260, 1660, 520
        mid = x0 + (x1 - x0) * 0.5 * e
        d.rectangle([x0, y - 70, mid, y + 70], fill=(225, 6, 0, 255))
        d.rectangle([mid, y - 70, x0 + (x1 - x0) * e, y + 70], fill=(39, 160, 255, 255))
        paste(cv, text_sprite("COMBUSTÃO", F_BARLOW, 60, WHITE), (x0 + mid) / 2, y, 1, e)
        paste(cv, text_sprite("ELÉTRICO", F_BARLOW, 60, WHITE), (mid + x1) / 2, y, 1, e)
        paste(cv, text_sprite("~50%", F_ANTON, 120, WHITE), (x0 + mid) / 2, y - 170, 1, e)
        paste(cv, text_sprite("~50%", F_ANTON, 120, WHITE), (mid + x1) / 2, y - 170, 1, e)
        paste(cv, text_sprite("NOVA UNIDADE DE POTÊNCIA", F_BARLOW, 54, (200, 200, 200), None, 0, 0, 8), W / 2, y + 160, 1, e)
    elif cap == "@kw":
        v = int(120 + (350 - 120) * ease_io(lt / 2.0))
        paste(cv, text_sprite("MGU-K", F_BARLOW, 70, (200, 200, 200), None, 0, 0, 10), W / 2, 300, 1, 1)
        paste(cv, text_sprite("%d kW" % v, F_ANTON, 260, WHITE, (39, 160, 255), 24), W / 2, 500, 1, 1)
        paste(cv, text_sprite("MGU-H: ELIMINADO", F_BARLOW, 60, RED, None, 0, 0, 8), W / 2, 720, 1, ease_out((lt - 1.5) / 0.5))
    elif cap == "@kg":
        v = int(800 - (800 - 768) * ease_io(lt / 2.0))
        paste(cv, text_sprite("PESO MÍNIMO", F_BARLOW, 70, (200, 200, 200), None, 0, 0, 10), W / 2, 300, 1, 1)
        paste(cv, text_sprite("%d KG" % v, F_ANTON, 260, WHITE, RED, 24), W / 2, 500, 1, 1)
        paste(cv, text_sprite("MAIS CURTOS · MAIS ESTREITOS · MAIS LEVES", F_BARLOW, 56, WHITE, None, 0, 0, 6), W / 2, 720, 1, ease_out((lt - 1.2) / 0.5))
    elif cap == "@aero":
        ph = (math.sin(lt * 1.6) + 1) / 2
        ang = 6 + 26 * ph
        for k, (cx, lbl) in enumerate([(640, "ASA DIANTEIRA"), (1280, "ASA TRASEIRA")]):
            wing = Image.new("RGBA", (420, 46), (0, 0, 0, 0))
            ImageDraw.Draw(wing).rounded_rectangle([0, 0, 419, 45], 22, fill=(255, 255, 255, 255))
            wing = wing.rotate(ang if k else ang * 0.7, expand=True, resample=Image.BICUBIC)
            paste(cv, wing, cx, 480, 1, e)
            paste(cv, text_sprite(lbl, F_BARLOW, 48, (200, 200, 200), None, 0, 0, 6), cx, 640, 1, e)
        mode = "MODO CURVA · MAIS DOWNFORCE" if ph > 0.5 else "MODO RETA · MENOS ARRASTO"
        paste(cv, text_sprite(mode, F_ANTON, 96, WHITE if ph > 0.5 else (39, 160, 255), (0, 0, 0), 12), W / 2, 280, 1, 1)
        paste(cv, text_sprite("ADEUS DRS", F_BARLOW, 60, RED, None, 0, 0, 10), W / 2, 760, 1, e)
    elif cap == "@overtake":
        x0, y0 = 660, 400
        d.rounded_rectangle([x0, y0, x0 + 560, y0 + 220], 18, outline=(255, 255, 255, 255), width=8)
        d.rectangle([x0 + 560, y0 + 70, x0 + 590, y0 + 150], fill=(255, 255, 255, 255))
        fill = ease_io((lt % 3.0) / 2.2)
        d.rectangle([x0 + 18, y0 + 18, x0 + 18 + 524 * fill, y0 + 202], fill=(39, 220, 120, 255))
        paste(cv, text_sprite("OVERTAKE", F_ANTON, 130, WHITE, (39, 220, 120), 20), W / 2, 280, 1, e)
        paste(cv, text_sprite("ENERGIA EXTRA PARA ULTRAPASSAR  ·  BOOST", F_BARLOW, 54, WHITE, None, 0, 0, 6), W / 2, 720, 1, e)


def draw_grid(cv, capline, tg, t):
    hl = None
    if capline:
        c = capline["cap"]
        hl = {"AUDI": "AUD", "CADILLAC": "CAD", "HADJAR|LINDBLAD": ("RBR", "RB")}.get(c, None)
    for k, (tm, drv) in enumerate(GRID):
        col, row = k % 4, k // 4
        x = 150 + col * 420; y = 230 + row * 230
        e = ease_out((t - 0.08 * k) / 0.5)
        on = hl is None or tm == hl or (isinstance(hl, tuple) and tm in hl)
        a = e * (1.0 if on else 0.28)
        colr = guiao.C[tm]
        box = Image.new("RGBA", (390, 190), (20, 20, 26, 230))
        ImageDraw.Draw(box).rectangle([0, 0, 12, 189], fill=colr + (255,))
        paste(cv, box, x, y + 95, 1.0 + (0.05 if (hl and on) else 0), a, "l")
        paste(cv, text_sprite(TEAMNAME[tm], F_ANTON, 56, WHITE), x + 40, y + 70, 1, a, "l")
        paste(cv, text_sprite(drv.upper(), F_BARLOW6, 34, (200, 200, 200)), x + 40, y + 140, 1, a, "l")
    if capline and capline["cap"].startswith("22"):
        draw_caption(cv, "22 CARROS|11 EQUIPAS", tg - capline["t0"], 960, big=110)


def draw_team(cv, capline, tg):
    if not capline:
        return
    tm = capline["cap"][1:]
    lt = tg - capline["t0"]
    e = ease_out(lt / 0.6)
    col = guiao.C[tm]
    d = ImageDraw.Draw(cv)
    w = int(1920 * e)
    d.rectangle([0, 180, w, 196], fill=col + (255,))
    pos, pts, l1, l2 = TEAMCARD[tm]
    name = TEAMNAME[tm] if tm not in ("HAA", "AST") else ("O PELOTÃO" if tm == "HAA" else "LÁ ATRÁS")
    paste(cv, text_sprite(name, F_ANTON, 190, WHITE, col, 22), 140, 380, 1.08 - 0.08 * e, e, "l")
    paste(cv, text_sprite(pos, F_ANTON, 150, col), 140, 640, 1, ease_out((lt - 0.3) / 0.5), "l")
    paste(cv, text_sprite(pts + " PTS", F_ANTON, 150, WHITE), 620 if len(pos) < 4 else 860, 640, 1, ease_out((lt - 0.45) / 0.5), "l")
    paste(cv, text_sprite(l1, F_BARLOW, 60, (220, 220, 220), None, 0, 0, 6), 140, 800, 1, ease_out((lt - 0.6) / 0.5), "l")
    if l2:
        paste(cv, text_sprite(l2, F_BARLOW6, 48, col, None, 0, 0, 6), 140, 870, 1, ease_out((lt - 0.75) / 0.5), "l")


def draw_standings(cv, data, capline, tg, t):
    kind = data["kind"]
    if kind == "drivers":
        rows = [(n.upper(), guiao.C[guiao.P[n]], v) for n, v in guiao.DRIVERS]
        title = "PILOTOS · 11 NOV 2026"
    else:
        rows = [(n, guiao.C[c], v) for n, c, v in guiao.TEAMS[:8]]
        title = "CONSTRUTORES · 11 NOV 2026"
    tag(cv, title, 60, 70, RED, 44)
    mx = rows[0][2]
    n = len(rows)
    rh = 760 / n
    cap = capline["cap"] if capline else ""
    for k, (nm, col, v) in enumerate(rows):
        y = 170 + k * rh + rh / 2
        e = ease_out((t - 0.4 - 0.1 * k) / 1.4)
        hi = True
        if cap == "@vice" and kind == "drivers":
            hi = 1 <= k <= 5
        if cap == "@fight" and kind == "teams":
            hi = k in (2, 3)
        if cap.startswith("!") and kind == "drivers":
            hi = 1 <= k <= 5
        a = 1.0 if hi else 0.3
        bw = int(900 * v / mx * e)
        if bw > 2:
            bar = Image.new("RGBA", (bw, int(rh * 0.68)), col + (230,))
            paste(cv, bar, 560, y, 1, a, "l")
        paste(cv, text_sprite("%d" % (k + 1), F_ANTON, int(rh * 0.6), (150, 150, 150)), 120, y, 1, a, "l")
        paste(cv, text_sprite(nm, F_ANTON, int(rh * 0.52), WHITE), 190, y, 1, a, "l")
        val = int(v * e)
        paste(cv, text_sprite(str(val), F_ANTON, int(rh * 0.55), WHITE), 580 + bw, y, 1, a, "l")
        if k == 0:
            paste(cv, text_sprite("CAMPEÃO" if kind == "drivers" else "CAMPEÃ", F_BARLOW, 34, GOLD, None, 0, 0, 4),
                  600 + bw + 120, y, 1, e, "l")
    if cap.startswith("!"):
        draw_caption(cv, cap, tg - capline["t0"], 500, big=150)


# ------------------------------------------------------------------ execução
def render_scene(args):
    idx, sc, data = args
    path = os.path.join(OUT, "seg_%02d.mp4" % idx)
    f0 = int(round(sc["start"] * FPS)); f1 = int(round(sc["end"] * FPS))
    if os.path.exists(path) and os.environ.get("FORCE") != "1":
        return path
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
                          "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-tune", "animation", path],
                         stdin=subprocess.PIPE)
    for fi in range(f0, f1):
        t = fi / FPS - sc["start"]
        p.stdin.write(scene_frame(sc, data, t, fi).tobytes())
    p.stdin.close(); p.wait()
    print("seg", idx, sc["type"], f1 - f0, "frames", flush=True)
    return path


def main():
    scenes, T = timeline.build(OUT)
    only = os.environ.get("ONLY")
    jobs = [(i, sc, guiao.SCENES[i]) for i, sc in enumerate(scenes) if not only or str(i) in only.split(",")]
    jobs.sort(key=lambda j: -(j[1]["end"] - j[1]["start"]))
    with Pool(int(os.environ.get("PROCS", "4"))) as pool:
        segs = pool.map(render_scene, jobs, chunksize=1)
    if only:
        return
    lst = os.path.join(OUT, "segs.txt")
    with open(lst, "w") as fh:
        for i in range(len(scenes)):
            fh.write("file '%s'\n" % os.path.join(OUT, "seg_%02d.mp4" % i))
    print("ok")


if __name__ == "__main__":
    main()
