"""Visuais animados para as cenas do Reel: repetição da corrida com dados GPS reais (OpenF1),
gráfico de posições, ultrapassagens, mensagens da direção de corrida, cartão de notícia e memes (sem emojis).

Cada visual desenha-se numa caixa (x, y, w, h) a partir do instante u (segundos desde o início
da cena) e da duração da cena. Os dados da OpenF1 ficam em cache na pasta de trabalho.
"""
from __future__ import annotations

import bisect
import hashlib
import json
import math
import subprocess
import urllib.parse
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

API = "https://api.openf1.org/v1"
CACHE = Path.home() / ".cache/reels-f1/openf1"
FONT_DIR = Path("/usr/share/fonts/opentype/inter")
F_BLACK = str(FONT_DIR / "InterDisplay-Black.otf")
F_BOLD = str(FONT_DIR / "InterDisplay-Bold.otf")
F_SEMI = str(FONT_DIR / "Inter-SemiBold.otf")
F_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def ease_out(x):
    x = clamp(x); return 1 - (1 - x) ** 3


def ease_back(x):
    x = clamp(x); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


@lru_cache(maxsize=None)
def font(path: str, size: int):
    return ImageFont.truetype(path, size)


def hexcol(h: str | None, default=(200, 200, 200)):
    if not h: return default
    h = h.lstrip("#")
    try: return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError: return default


def ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


# ---------------------------------------------------------------- OpenF1
def api(path: str, **params) -> list:
    q = "&".join(f"{k.replace('__gt', '>').replace('__lt', '<')}={urllib.parse.quote(str(v), safe=':+-.T')}"
                 for k, v in params.items())
    url = f"{API}/{path}?{q}"
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / (hashlib.sha1(url.encode()).hexdigest() + ".json")
    if f.exists():
        return json.loads(f.read_text())
    for _ in range(4):
        r = subprocess.run(["curl", "-s", "-m", "90", "-g", url], capture_output=True)
        try:
            data = json.loads(r.stdout)
            if isinstance(data, list):
                f.write_text(json.dumps(data)); return data
        except json.JSONDecodeError:
            pass
        subprocess.run(["sleep", "3"])
    raise RuntimeError(f"OpenF1 não respondeu: {url}")


def drivers(sk: int) -> dict[int, dict]:
    return {d["driver_number"]: d for d in api("drivers", session_key=sk)}


def lap_window(sk: int, piloto: int, volta: int) -> tuple[datetime, float]:
    laps = {l["lap_number"]: l for l in api("laps", session_key=sk, driver_number=piloto)}
    l = laps[volta]
    dur = l.get("lap_duration")
    if not dur and volta + 1 in laps:
        dur = (ts(laps[volta + 1]["date_start"]) - ts(l["date_start"])).total_seconds()
    return ts(l["date_start"]), float(dur or 100)


# ---------------------------------------------------------------- utilitários de desenho
def panel(img: Image.Image, box, radius=26, fill=(10, 10, 12, 215), outline=None):
    x, y, w, h = box
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle([0, 0, w - 1, h - 1], radius, fill=fill,
                                            outline=outline, width=3 if outline else 0)
    img.paste(layer, (x, y), layer)


# ---------------------------------------------------------------- 1. repetição da corrida (GPS)
class Replay:
    """Carros a andar no traçado real, a partir das posições GPS da OpenF1, com tabela de posições."""

    def __init__(self, cfg: dict):
        sk = cfg["session_key"]; self.piloto = cfg.get("piloto")
        self.drv = drivers(sk)
        ref = cfg.get("piloto_traçado", self.piloto or next(iter(self.drv)))
        if "inicio" in cfg:
            self.t0 = ts(cfg["inicio"]); self.span = float(cfg.get("segundos", 90))
        else:
            self.t0, self.span = lap_window(sk, ref, cfg.get("volta", 1))
        self.label = cfg.get("etiqueta") or (f"LAP {cfg.get('volta', 1)}" if "volta" in cfg or "inicio" not in cfg else "")
        # traçado: uma volta limpa do piloto de referência
        lt0, lspan = lap_window(sk, ref, cfg.get("volta_traçado", 5))
        pts = api("location", session_key=sk, driver_number=ref,
                  date__gt=lt0.isoformat(), date__lt=(lt0 + timedelta(seconds=lspan)).isoformat())
        self.track = [(p["x"], p["y"]) for p in pts if p["x"] or p["y"]]
        xs = [p[0] for p in self.track]; ys = [p[1] for p in self.track]
        self.bounds = (min(xs), min(ys), max(xs), max(ys))
        # posições de todos os carros na janela
        a = (self.t0 - timedelta(seconds=2)).isoformat(); b = (self.t0 + timedelta(seconds=self.span + 2)).isoformat()
        self.cars = {}
        for n in self.drv:
            pts = api("location", session_key=sk, driver_number=n, date__gt=a, date__lt=b)
            pts = [p for p in pts if p["x"] or p["y"]]
            if pts:
                self.cars[n] = ([(ts(p["date"]) - self.t0).total_seconds() for p in pts], [(p["x"], p["y"]) for p in pts])
        pos = api("position", session_key=sk)
        self.pos_events = sorted(((ts(p["date"]) - self.t0).total_seconds(), p["driver_number"], p["position"]) for p in pos)

    def _xy(self, n, t):
        times, pts = self.cars[n]
        i = bisect.bisect_left(times, t)
        if i <= 0: return pts[0]
        if i >= len(times): return pts[-1]
        f = (t - times[i - 1]) / max(1e-6, times[i] - times[i - 1])
        (x0, y0), (x1, y1) = pts[i - 1], pts[i]
        return x0 + (x1 - x0) * f, y0 + (y1 - y0) * f

    def _order(self, t):
        cur = {}
        for when, n, p in self.pos_events:
            if when > t: break
            cur[n] = p
        return sorted(cur, key=lambda n: cur[n])

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        panel(img, box)
        d = ImageDraw.Draw(img)
        tower_w = 230
        mx, my = x + 30, y + 80; mw, mh = w - tower_w - 70, h - 120
        x0, y0, x1, y1 = self.bounds
        s = min(mw / (x1 - x0), mh / (y1 - y0))
        ox = mx + (mw - (x1 - x0) * s) / 2; oy = my + (mh - (y1 - y0) * s) / 2

        def P(px, py):  # y invertido para o norte ficar em cima
            return ox + (px - x0) * s, oy + (y1 - py) * s
        pts = [P(*p) for p in self.track]
        d.line(pts + pts[:1], fill=(70, 70, 76), width=22, joint="curve")
        d.line(pts + pts[:1], fill=(140, 140, 150), width=4, joint="curve")
        speed = self.span / max(1.0, dur - 0.4)
        t = clamp(u - 0.2, 0, dur) * speed
        order = self._order(t)
        # carros (o destacado por cima, maior e com rasto)
        for n in sorted(self.cars, key=lambda n: n == self.piloto):
            cx, cy = P(*self._xy(n, t))
            col = hexcol(self.drv.get(n, {}).get("team_colour"))
            if n == self.piloto:
                for k in range(1, 9):
                    tx, ty = P(*self._xy(n, t - k * 0.35 * speed / 8))
                    r = 14 - k
                    d.ellipse([tx - r, ty - r, tx + r, ty + r], fill=col)
                pulse = 26 + 6 * math.sin(u * 10)
                d.ellipse([cx - pulse, cy - pulse, cx + pulse, cy + pulse], outline=(255, 255, 255), width=4)
                d.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], fill=col, outline=(255, 255, 255), width=3)
                d.text((cx + 30, cy - 30), self.drv[n]["name_acronym"], font=font(F_BLACK, 34), fill=(255, 255, 255))
            else:
                d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=col, outline=(15, 15, 15), width=2)
        # cabeçalho
        d.text((x + 30, y + 26), "RACE REPLAY", font=font(F_BLACK, 30), fill=(255, 255, 255))
        d.text((x + 30 + 270, y + 30), f"{self.label}  ·  ×{speed:.0f}  ·  GPS DATA", font=font(F_SEMI, 24), fill=(170, 170, 175))
        # torre de posições
        tx = x + w - tower_w - 20; ty = y + 80
        rows = order[:22]; rh = min(30, (h - 110) // max(1, len(rows)))
        for i, n in enumerate(rows):
            yy = ty + i * rh
            hl = n == self.piloto
            if hl: d.rectangle([tx - 6, yy - 2, tx + tower_w, yy + rh - 2], fill=(255, 255, 255))
            col = hexcol(self.drv.get(n, {}).get("team_colour"))
            d.rectangle([tx + 46, yy + 3, tx + 52, yy + rh - 6], fill=col)
            fc = (10, 10, 10) if hl else (235, 235, 235)
            d.text((tx + 4, yy), f"{i + 1:>2}", font=font(F_MONO, rh - 8), fill=fc)
            d.text((tx + 62, yy), self.drv.get(n, {}).get("name_acronym", str(n)), font=font(F_BLACK, rh - 6), fill=fc)


# ---------------------------------------------------------------- 2. gráfico de posições volta a volta
class Posicoes:
    def __init__(self, cfg: dict):
        sk = cfg["session_key"]; self.piloto = cfg["piloto"]
        self.drv = drivers(sk)
        laps = sorted(api("laps", session_key=sk, driver_number=self.piloto), key=lambda l: l["lap_number"])
        pos = sorted((ts(p["date"]), p["position"]) for p in api("position", session_key=sk, driver_number=self.piloto))
        grid = pos[0][1]
        self.series = [grid]
        for l in laps:
            if not l.get("date_start"): continue
            end = ts(l["date_start"]) + timedelta(seconds=l.get("lap_duration") or 90)
            cur = grid
            for d_, p in pos:
                if d_ > end: break
                cur = p
            self.series.append(cur)
        self.col = hexcol(self.drv[self.piloto].get("team_colour"), (54, 113, 198))
        self.name = self.drv[self.piloto]["name_acronym"]
        self.n = max(20, max(self.series))

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        panel(img, box)
        d = ImageDraw.Draw(img)
        d.text((x + 30, y + 26), f"{self.name} · POSITION BY LAP", font=font(F_BLACK, 30), fill=(255, 255, 255))
        gx, gy, gw, gh = x + 90, y + 90, w - 130, h - 150
        for p in (1, 5, 10, 15, 20):
            if p > self.n: continue
            yy = gy + (p - 1) / (self.n - 1) * gh
            d.line([gx, yy, gx + gw, yy], fill=(55, 55, 60), width=2)
            d.text((gx - 16, yy), f"P{p}", font=font(F_SEMI, 24), fill=(150, 150, 155), anchor="rm")
        N = len(self.series) - 1
        d.text((gx, gy + gh + 22), "START", font=font(F_SEMI, 22), fill=(150, 150, 155))
        d.text((gx + gw, gy + gh + 22), f"LAP {N}", font=font(F_SEMI, 22), fill=(150, 150, 155), anchor="ra")
        prog = ease_out((u - 0.2) / max(0.5, dur - 1.0))
        upto = prog * N
        pts = []
        for i, p in enumerate(self.series):
            if i > upto + 1: break
            pts.append((gx + i / N * gw, gy + (p - 1) / (self.n - 1) * gh))
        if len(pts) >= 2:
            k = int(upto); f = upto - k
            if k + 1 < len(pts):
                (ax, ay), (bx, by) = pts[k], pts[k + 1]
                pts = pts[: k + 1] + [(ax + (bx - ax) * f, ay + (by - ay) * f)]
            d.line(pts, fill=self.col, width=10, joint="curve")
            cx, cy = pts[-1]
            d.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(255, 255, 255), outline=self.col, width=6)
            cur = self.series[min(N, int(round(upto)))]
            d.rounded_rectangle([cx - 70, cy - 78, cx + 20, cy - 26], 10, fill=(255, 255, 255))
            d.text((cx - 25, cy - 52), f"P{cur}", font=font(F_BLACK, 36), fill=(10, 10, 10), anchor="mm")


# ---------------------------------------------------------------- 3. ultrapassagens
class Ultrapassagens:
    def __init__(self, cfg: dict):
        sk = cfg["session_key"]; self.piloto = cfg["piloto"]
        self.drv = drivers(sk)
        ov = sorted(api("overtakes", session_key=sk, overtaking_driver_number=self.piloto), key=lambda o: o["date"])
        self.items = [(o["overtaken_driver_number"], o["position"]) for o in ov]

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        panel(img, box)
        d = ImageDraw.Draw(img)
        me = self.drv[self.piloto]
        d.text((x + 30, y + 26), f"{me['name_acronym']} OVERTAKES", font=font(F_BLACK, 30), fill=(255, 255, 255))
        n = len(self.items)
        shown = int(clamp((u - 0.2) / max(0.5, dur - 1.2)) * n + 0.999)
        d.text((x + w - 30, y + 18), f"{shown}", font=font(F_BLACK, 48), fill=(43, 212, 125), anchor="ra")
        cols, rh = 2, 62
        rows_fit = (h - 100) // rh
        visible = self.items[:shown][-rows_fit * cols:]
        start = max(0, shown - len(visible))
        for j, (victim, pos) in enumerate(visible):
            i = start + j
            appear = (u - 0.2) - i * (max(0.5, dur - 1.2) / n)
            c, r = j % cols, j // cols
            cw = (w - 80) // cols
            cx = x + 30 + c * (cw + 20) + int(60 * (1 - ease_out(appear / 0.25)))
            cy = y + 90 + r * rh
            vd = self.drv.get(victim, {})
            d.rounded_rectangle([cx, cy, cx + cw, cy + rh - 10], 10, fill=(32, 32, 36))
            d.rectangle([cx, cy, cx + 8, cy + rh - 10], fill=hexcol(vd.get("team_colour")))
            d.text((cx + 22, cy + 8), f"P{pos}", font=font(F_BLACK, 32), fill=(43, 212, 125))
            d.text((cx + 110, cy + 8), f"› {vd.get('name_acronym', victim)}", font=font(F_BLACK, 32), fill=(240, 240, 240))


# ---------------------------------------------------------------- 4. direção de corrida
class Direcao:
    def __init__(self, cfg: dict):
        if cfg.get("mensagens"):
            self.msgs = [(m.get("volta"), m["texto"], m.get("bandeira")) for m in cfg["mensagens"]]
        else:
            rc = api("race_control", session_key=cfg["session_key"])
            keys = cfg.get("filtro", ["RAIN", "SAFETY CAR", "RED FLAG", "PENALTY", "WET"])
            self.msgs = [(m.get("lap_number"), m["message"], m.get("flag")) for m in rc
                         if any(k in m["message"].upper() for k in keys)][: cfg.get("max", 6)]

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        panel(img, box, fill=(8, 8, 10, 230), outline=(245, 197, 24))
        d = ImageDraw.Draw(img)
        d.text((x + 30, y + 26), "RACE CONTROL", font=font(F_BLACK, 30), fill=(245, 197, 24))
        step = max(0.4, (dur - 1) / max(1, len(self.msgs)))
        yy = y + 90
        for i, (lap, txt, flag) in enumerate(self.msgs):
            a = (u - 0.2 - i * step)
            if a < 0: break
            f = font(F_MONO, 30)
            lines = _wrap(txt.upper(), f, w - 200)
            full = " ".join(lines)
            nchar = int(len(full) * clamp(a / 0.6))
            col = {"RED": (232, 40, 40), "YELLOW": (245, 197, 24), "GREEN": (43, 212, 125),
                   "DOUBLE YELLOW": (245, 197, 24), "BLUE": (60, 140, 255)}.get((flag or "").upper(), (230, 230, 230))
            d.text((x + 30, yy), f"L{lap or '-':<2}", font=font(F_MONO, 26), fill=(150, 150, 155))
            shown = full[:nchar]
            for l in lines:
                part = shown[: len(l)]; shown = shown[len(l) + 1:]
                d.text((x + 140, yy), part, font=f, fill=col)
                yy += 40
            yy += 18
            if yy > y + h - 50: break


def _wrap(text, f, max_w):
    m = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    lines, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if m.textlength(t, font=f) <= max_w or not cur: cur = t
        else: lines.append(cur); cur = wd
    if cur: lines.append(cur)
    return lines


# ---------------------------------------------------------------- 5. cartão de notícia
class Noticia:
    def __init__(self, cfg: dict):
        self.fonte = cfg.get("fonte", ""); self.manchete = cfg["manchete"]
        self.rodape = cfg.get("rodape", self.manchete)
        self.pontos = cfg.get("pontos", [])

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        d = ImageDraw.Draw(img)
        s = ease_back(u / 0.45)
        cw = int(w * (0.85 + 0.15 * s)); cx = x + (w - cw) // 2
        panel(img, (cx, y, cw, h), radius=18, fill=(245, 245, 242, 255))
        d.rectangle([cx, y + 40, cx + cw, y + 110], fill=(215, 25, 25))
        blink = (int(u * 3) % 2 == 0)
        d.text((cx + 30, y + 75), "● BREAKING" if blink else "  BREAKING", font=font(F_BLACK, 40), fill=(255, 255, 255), anchor="lm")
        d.text((cx + cw - 30, y + 75), self.fonte.upper(), font=font(F_SEMI, 26), fill=(255, 225, 225), anchor="rm")
        f = font(F_BLACK, 62)
        lines = _wrap(self.manchete, f, cw - 70)
        n = int(len(self.manchete) * clamp((u - 0.3) / 1.2))
        shown = self.manchete[:n]; yy = y + 150
        for l in lines[:5]:
            part = shown[: len(l)]; shown = shown[len(l) + 1:]
            d.text((cx + 35, yy), part, font=f, fill=(15, 15, 15)); yy += 74
        # pontos-chave: entram um a um depois da manchete
        yy += 20
        t_ini = 0.3 + 1.2
        for i, (txt) in enumerate(self.pontos[:4]):
            a = ease_out((u - t_ini - i * 0.35) / 0.3)
            if a <= 0: break
            px = cx + 35 + int(80 * (1 - a))
            d.rounded_rectangle([px, yy, px + cw - 70, yy + 62], 10, fill=(230, 230, 226))
            d.rectangle([px, yy, px + 10, yy + 62], fill=(215, 25, 25))
            d.text((px + 30, yy + 31), txt, font=font(F_BLACK, 36), fill=(20, 20, 20), anchor="lm")
            yy += 76
        # faixa em movimento no fundo do cartão (recortada ao cartão)
        ft = font(F_BOLD, 32)
        unit = "   ◆   " + self.rodape.upper()
        uw = ImageDraw.Draw(Image.new("RGB", (4, 4))).textlength(unit, font=ft)
        strip = Image.new("RGB", (cw, 70), (20, 20, 22))
        off = (u * 260) % uw
        ImageDraw.Draw(strip).text((20 - off, 35), unit * (int(cw / uw) + 3), font=ft, fill=(255, 255, 255), anchor="lm")
        img.paste(strip, (cx, y + h - 70))


# ---------------------------------------------------------------- 6. meme
class Meme:
    """Cartão de meme original: frase («POV: …») e uma palavra de reação grande a abanar."""

    def __init__(self, cfg: dict):
        self.topo = cfg.get("topo", "POV:"); self.texto = cfg["texto"]
        self.reacao = cfg.get("reacao", "PAIN.")
        self.cor = tuple(cfg.get("cor", (215, 25, 25)))

    def draw(self, img, box, u, dur):
        x, y, w, h = box
        panel(img, box, fill=(255, 255, 255, 255))
        d = ImageDraw.Draw(img)
        f = font(F_BLACK, 58)
        lines = _wrap(f"{self.topo} {self.texto}".strip(), f, w - 70)
        yy = y + 30
        for l in lines[:4]:
            d.text((x + 35, yy), l, font=f, fill=(10, 10, 10)); yy += 68
        # palavra de reação: entra com ressalto, abana e pulsa
        s = ease_back((u - 0.35) / 0.4)
        if s <= 0.02: return
        size = 260
        while size > 80 and ImageDraw.Draw(Image.new("RGB", (4, 4))).textlength(self.reacao, font=font(F_BLACK, size)) > w - 120:
            size -= 10
        pulse = 1 + 0.04 * math.sin(u * 9)
        fr = font(F_BLACK, size)
        tw = int(ImageDraw.Draw(Image.new("RGB", (4, 4))).textlength(self.reacao, font=fr)) + 30
        layer = Image.new("RGBA", (tw, int(size * 1.3)), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.text((14, 6), self.reacao, font=fr, fill=(10, 10, 10))
        ld.text((4, 0), self.reacao, font=fr, fill=self.cor)
        k = s * pulse
        layer = layer.resize((max(1, int(layer.width * k)), max(1, int(layer.height * k))), Image.BICUBIC)
        layer = layer.rotate(5 * math.sin(u * 7), expand=True, resample=Image.BICUBIC)
        cy = yy + (y + h - yy) // 2
        img.paste(layer, (x + w // 2 - layer.width // 2, cy - layer.height // 2), layer)


TIPOS_VISUAL = {"replay": Replay, "posicoes": Posicoes, "ultrapassagens": Ultrapassagens,
                "direcao": Direcao, "noticia": Noticia, "meme": Meme}


def criar(cfg: dict | None):
    if not cfg: return None
    return TIPOS_VISUAL[cfg["tipo"]](cfg)
