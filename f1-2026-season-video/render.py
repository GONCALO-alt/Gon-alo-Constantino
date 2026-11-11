"""Frame renderer for every scene type (pycairo), streamed to ffmpeg."""
import math, random, subprocess
import cairo
import script

W, H, FPS = 1280, 720, 30
SS = 1.5  # output scale -> 1920x1080
TEAMS = script.TEAMS

# ----------------------------------------------------------------- helpers
def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

RED = rgb("#E10600")
WHITE = (1, 1, 1)
GREY = rgb("#9AA3B8")
DIM = rgb("#5A6380")
BG0 = rgb("#070912")
BG1 = rgb("#141A2E")
CARD = rgb("#1A2038")
GOLD = rgb("#F5C542")
GREEN = rgb("#2BD576")

def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x

def prog(t, start, dur):
    return clamp((t - start) / dur) if dur > 0 else float(t >= start)

def eo(x):  # ease out cubic
    x = clamp(x)
    return 1 - (1 - x) ** 3

def eio(x):
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2

def lerp(a, b, x):
    return a + (b - a) * x

def lstart(sc, j, dur, n=None):
    """Start time of narration line j of this scene (fallback: even spread)."""
    L = sc.get("_lines") or []
    if j < len(L):
        return L[j][0]
    n = n or max(1, len(L))
    return 0.6 + j * dur * 0.7 / n

def team_col(k):
    return rgb(TEAMS[k][1])

def abbr(name):
    return name.split()[-1][:3].upper()

FONTS = {
    "black": ("Inter Display Black", cairo.FONT_WEIGHT_NORMAL),
    "xbold": ("Inter Display ExtraBold", cairo.FONT_WEIGHT_NORMAL),
    "bold": ("Inter Display", cairo.FONT_WEIGHT_BOLD),
    "semi": ("Inter SemiBold", cairo.FONT_WEIGHT_NORMAL),
    "med": ("Inter Medium", cairo.FONT_WEIGHT_NORMAL),
    "reg": ("Inter", cairo.FONT_WEIGHT_NORMAL),
    "light": ("Inter Display Light", cairo.FONT_WEIGHT_NORMAL),
}

def font(ctx, w, size):
    fam, wt = FONTS[w]
    ctx.select_font_face(fam, cairo.FONT_SLANT_NORMAL, wt)
    ctx.set_font_size(size)

def text_w(ctx, s, w, size):
    font(ctx, w, size)
    return ctx.text_extents(s).x_advance

def text(ctx, s, x, y, size, col=WHITE, a=1.0, w="bold", align="l", track=0.0):
    if a <= 0.001 or not s:
        return 0
    font(ctx, w, size)
    if track:
        widths = [ctx.text_extents(ch).x_advance + track for ch in s]
        tw = sum(widths) - track
    else:
        tw = ctx.text_extents(s).x_advance
    if align == "c":
        x -= tw / 2
    elif align == "r":
        x -= tw
    ctx.set_source_rgba(*col, a)
    if track:
        cx = x
        for ch, cw in zip(s, widths):
            ctx.move_to(cx, y)
            ctx.show_text(ch)
            cx += cw
    else:
        ctx.move_to(x, y)
        ctx.show_text(s)
    return tw

def wrap(ctx, s, w, size, maxw):
    font(ctx, w, size)
    words, lines, cur = s.split(), [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if ctx.text_extents(trial).x_advance > maxw and cur:
            lines.append(cur)
            cur = wd
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines

def rrect(ctx, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()

def fill(ctx, col, a=1.0):
    ctx.set_source_rgba(*col, a)
    ctx.fill()

def para(ctx, x, y, w, h, skew):
    ctx.move_to(x + skew, y)
    ctx.line_to(x + w + skew, y)
    ctx.line_to(x + w, y + h)
    ctx.line_to(x, y + h)
    ctx.close_path()

# --------------------------------------------------------------- background
_bg_cache = {}

def background(ctx, t, tint=None):
    key = tint
    if key not in _bg_cache:
        s = cairo.ImageSurface(cairo.FORMAT_RGB24, int(W * SS), int(H * SS))
        c = cairo.Context(s)
        c.scale(SS, SS)
        g = cairo.LinearGradient(0, 0, W, H)
        g.add_color_stop_rgb(0, *BG0)
        g.add_color_stop_rgb(1, *BG1)
        c.set_source(g)
        c.paint()
        if tint:
            rg = cairo.RadialGradient(W * 0.85, H * 0.1, 10, W * 0.85, H * 0.1, W * 0.9)
            rg.add_color_stop_rgba(0, *tint, 0.22)
            rg.add_color_stop_rgba(1, *tint, 0.0)
            c.set_source(rg)
            c.paint()
        # dot grid
        c.set_source_rgba(1, 1, 1, 0.035)
        for gx in range(0, W, 32):
            for gy in range(0, H, 32):
                c.rectangle(gx, gy, 1.5, 1.5)
        c.fill()
        vg = cairo.RadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75)
        vg.add_color_stop_rgba(0, 0, 0, 0, 0)
        vg.add_color_stop_rgba(1, 0, 0, 0, 0.55)
        c.set_source(vg)
        c.paint()
        _bg_cache[key] = s
    ctx.save()
    ctx.scale(1 / SS, 1 / SS)
    ctx.set_source_surface(_bg_cache[key], 0, 0)
    ctx.paint()
    ctx.restore()
    # moving speed stripes
    for i in range(7):
        x = ((t * (60 + i * 17) + i * 263) % (W + 600)) - 300
        para(ctx, x, 0, 26 + i * 6, H, -220)
        ctx.set_source_rgba(1, 1, 1, 0.012 + 0.006 * (i % 3))
        ctx.fill()

def chrome(ctx, sc, t, gt, total):
    """Persistent overlay: chapter tag, watermark, progress line."""
    label = sc.get("_label")
    if label:
        rrect(ctx, 40, 34, 6, 22, 2)
        fill(ctx, RED)
        text(ctx, label, 56, 51, 15, GREY, 0.95, "semi", track=1.5)
    text(ctx, "F1 2026  ·  SEASON REVIEW", W - 40, H - 26, 13, DIM, 0.9, "semi", "r", track=1.2)
    ctx.rectangle(0, H - 4, W, 4)
    fill(ctx, (1, 1, 1), 0.06)
    ctx.rectangle(0, H - 4, W * gt / total, 4)
    fill(ctx, RED, 0.9)

def transition(ctx, t, dur, first=False):
    T = 0.5
    if t < T and not first:
        p = eio(t / T)
        x = lerp(-80, W + 300, p)
        para(ctx, x, 0, W + 400, H, -260)
        fill(ctx, BG0)
        para(ctx, x - 60, 0, 70, H, -260)
        fill(ctx, RED)
    if t > dur - T:
        p = eio((t - (dur - T)) / T)
        x = lerp(-W - 700, -80, p)
        para(ctx, x, 0, W + 400, H, -260)
        fill(ctx, BG0)
        para(ctx, x + W + 400 - 10, 0, 70, H, -260)
        fill(ctx, RED)

# -------------------------------------------------------------------- car
def draw_car(ctx, x, yg, s, col, accent=None, rot=0.0, flap=0.0, rain=False, helmet=(1, 0.85, 0.1), shadow=True):
    """Side-view stylised F1 car facing right. x = rear, yg = ground y, s = px per unit (car = 100u)."""
    accent = accent or WHITE
    dark = (0.07, 0.07, 0.09)
    ctx.save()
    ctx.translate(x, yg)
    ctx.scale(s, s)
    if shadow:
        ctx.save()
        ctx.scale(1, 0.12)
        rg = cairo.RadialGradient(50, 0, 5, 50, 0, 55)
        rg.add_color_stop_rgba(0, 0, 0, 0, 0.65)
        rg.add_color_stop_rgba(1, 0, 0, 0, 0)
        ctx.set_source(rg)
        ctx.arc(50, 0, 55, 0, 2 * math.pi)
        ctx.fill()
        ctx.restore()

    def poly(pts, c, a=1.0):
        ctx.move_to(*pts[0])
        for p in pts[1:]:
            ctx.line_to(*p)
        ctx.close_path()
        ctx.set_source_rgba(*c, a)
        ctx.fill()

    # rear wing endplate + elements
    poly([(2, -6), (9, -6), (10, -27.5), (3, -27.5)], dark)
    poly([(1, -28), (12, -28), (12, -24.6), (1, -24.6)], dark)
    ctx.save()
    ctx.translate(6.5, -22.8)
    ctx.rotate(-flap * 0.55)
    poly([(-5, -1.1), (5, -1.1), (5, 1.1), (-5, 1.1)], col)
    ctx.restore()
    poly([(1, -28), (12, -28), (12, -27.1), (1, -27.1)], accent)
    poly([(4, -12.5), (11, -12.5), (11, -11), (4, -11)], dark)
    # floor
    poly([(9, -5.6), (91, -5.6), (91, -3.4), (9, -3.4)], (0.1, 0.1, 0.12))
    # main body
    body = [(8, -6), (12, -9.5), (22, -10.5), (27, -15), (33, -17), (46, -17), (50, -19.5), (56, -18.5),
            (62, -14.5), (72, -11.2), (86, -8.6), (96, -6.4), (99.5, -5.4), (97, -4.6), (86, -5), (70, -5.4),
            (30, -5.4), (14, -5.4)]
    poly(body, col)
    # engine cover / airbox
    poly([(24, -10.5), (27, -18), (31, -22.5), (40, -25), (47, -25), (50, -21), (50, -17), (33, -17), (27, -15)], col)
    # shading
    g = cairo.LinearGradient(0, -25, 0, -4)
    g.add_color_stop_rgba(0, 1, 1, 1, 0.22)
    g.add_color_stop_rgba(0.45, 1, 1, 1, 0.0)
    g.add_color_stop_rgba(1, 0, 0, 0, 0.35)
    ctx.move_to(*body[0])
    for p in body[1:]:
        ctx.line_to(*p)
    ctx.close_path()
    ctx.set_source(g)
    ctx.fill()
    # accent stripe
    ctx.move_to(30, -13.5)
    ctx.line_to(60, -13.0)
    ctx.line_to(90, -7.4)
    ctx.set_line_width(1.1)
    ctx.set_source_rgba(*accent, 0.85)
    ctx.stroke()
    poly([(44, -25), (48.2, -25), (48.2, -22), (44, -22)], dark)  # airbox
    poly([(36, -15.5), (41, -15.5), (41, -11.5), (36, -11.5)], dark, 0.55)  # sidepod inlet
    poly([(50, -19.6), (57.5, -18.6), (60.5, -16.4), (51.5, -16.6)], dark)  # cockpit
    ctx.arc(53.6, -19.4, 2.6, 0, 2 * math.pi)
    ctx.set_source_rgb(*helmet)
    ctx.fill()
    poly([(54.2, -20.6), (56.3, -20.2), (56.0, -18.8), (54.2, -18.9)], dark)
    # halo
    ctx.move_to(48.5, -21.2)
    ctx.curve_to(52, -24.2, 57, -22.5, 60.5, -16.8)
    ctx.set_line_width(1.2)
    ctx.set_source_rgb(*dark)
    ctx.stroke()
    poly([(58, -17.5), (61.5, -17.5), (61.5, -16.4), (58, -16.4)], dark)  # mirror
    # suspension
    ctx.set_line_width(0.6)
    ctx.set_source_rgb(*dark)
    for a, b in (((72, -10.5), (82, -6.2)), ((72, -6), (82, -6.2)), ((22, -9.5), (15, -6.6)), ((22, -6.2), (15, -6.6))):
        ctx.move_to(*a)
        ctx.line_to(*b)
    ctx.stroke()
    # wheels
    for cx, cy, r in ((15, -6.6, 6.9), (82, -6.2, 6.4)):
        ctx.arc(cx, cy, r, 0, 2 * math.pi)
        ctx.set_source_rgb(0.05, 0.05, 0.06)
        ctx.fill()
        ctx.arc(cx, cy, r * 0.8, 0, 2 * math.pi)
        ctx.set_line_width(0.5)
        ctx.set_source_rgba(0.95, 0.15, 0.15, 0.9)
        ctx.stroke()
        ctx.arc(cx, cy, r * 0.58, 0, 2 * math.pi)
        ctx.set_source_rgb(0.18, 0.19, 0.22)
        ctx.fill()
        ctx.set_line_width(0.55)
        ctx.set_source_rgb(0.35, 0.36, 0.4)
        for k in range(6):
            a = rot + k * math.pi / 3
            ctx.move_to(cx, cy)
            ctx.line_to(cx + math.cos(a) * r * 0.56, cy + math.sin(a) * r * 0.56)
        ctx.stroke()
        ctx.arc(cx, cy, r * 0.14, 0, 2 * math.pi)
        ctx.set_source_rgb(*accent)
        ctx.fill()
    # front wing
    poly([(85, -5.2), (100.5, -5.2), (100.5, -2.0), (85, -2.0)], dark)
    poly([(97.5, -7.2), (100.5, -7.2), (100.5, -1.6), (97.5, -1.6)], dark)
    poly([(86, -3.0), (100, -3.0), (100, -2.2), (86, -2.2)], accent, 0.9)
    if rain:
        poly([(3, -8.4), (6.5, -8.4), (6.5, -6.6), (3, -6.6)], (1, 0.1, 0.1))
        ctx.arc(4.75, -7.5, 4, 0, 2 * math.pi)
        rg = cairo.RadialGradient(4.75, -7.5, 0.5, 4.75, -7.5, 4)
        rg.add_color_stop_rgba(0, 1, 0.2, 0.2, 0.6)
        rg.add_color_stop_rgba(1, 1, 0, 0, 0)
        ctx.set_source(rg)
        ctx.fill()
    ctx.restore()

def topcar(ctx, x, y, ang, col, s=1.0):
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(ang)
    ctx.scale(s, s)
    rrect(ctx, -22, -6, 44, 12, 4)
    fill(ctx, col)
    ctx.rectangle(16, -11, 8, 22)
    fill(ctx, (0.08, 0.08, 0.1))
    ctx.rectangle(-26, -10, 7, 20)
    fill(ctx, (0.08, 0.08, 0.1))
    for wx in (-14, 12):
        for wy in (-10, 10):
            rrect(ctx, wx - 4.5, wy - 3, 9, 6, 1.5)
            fill(ctx, (0.05, 0.05, 0.05))
    ctx.arc(2, 0, 3, 0, 2 * math.pi)
    fill(ctx, (1, 0.85, 0.1))
    ctx.restore()

# ------------------------------------------------------------------ track
def make_track(seed, box):
    rnd = random.Random(seed)
    n = rnd.randint(8, 12)
    angs = sorted(rnd.uniform(0, 2 * math.pi) for _ in range(n))
    ctrl = []
    for i, a in enumerate(angs):
        r = rnd.uniform(0.62, 1.0)
        if rnd.random() < 0.25:
            r *= 0.6  # inward hairpin / chicane
        ctrl.append((r * math.cos(a) * rnd.uniform(1.2, 1.5), r * math.sin(a)))
    # Chaikin smoothing keeps straights, rounds corners
    pts = ctrl
    for _ in range(4):
        nxt = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            nxt.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            nxt.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        pts = nxt
    rot = rnd.uniform(0, math.pi)
    pts = [(x * math.cos(rot) - y * math.sin(rot), x * math.sin(rot) + y * math.cos(rot)) for x, y in pts]
    x0, y0, x1, y1 = box
    mnx = min(p[0] for p in pts); mxx = max(p[0] for p in pts)
    mny = min(p[1] for p in pts); mxy = max(p[1] for p in pts)
    sc = min((x1 - x0) / (mxx - mnx), (y1 - y0) / (mxy - mny))
    ox = (x0 + x1) / 2 - (mnx + mxx) / 2 * sc
    oy = (y0 + y1) / 2 - (mny + mxy) / 2 * sc
    pts = [(ox + px * sc, oy + py * sc) for px, py in pts]
    N = len(pts)
    cum = [0.0]
    for i in range(1, N + 1):
        a, b = pts[i - 1], pts[i % N]
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    return pts, cum

def track_pos(pts, cum, s):
    L = cum[-1]
    s %= L
    lo, hi = 0, len(pts)
    while lo < hi - 1:
        mid = (lo + hi) // 2
        if cum[mid] <= s:
            lo = mid
        else:
            hi = mid
    a, b = pts[lo], pts[(lo + 1) % len(pts)]
    seg = cum[lo + 1] - cum[lo]
    f = (s - cum[lo]) / seg if seg else 0
    return a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, math.atan2(b[1] - a[1], b[0] - a[0])

def draw_track(ctx, pts, frac=1.0):
    n = max(2, int(len(pts) * frac))
    path = pts[:n] + ([pts[0]] if frac >= 1 else [])
    for wdt, col, a in ((26, (0, 0, 0), 0.35), (18, (0.9, 0.92, 1), 0.9), (13, (0.16, 0.18, 0.26), 1.0)):
        ctx.move_to(*path[0])
        for p in path[1:]:
            ctx.line_to(*p)
        ctx.set_line_width(wdt)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.set_source_rgba(*col, a)
        ctx.stroke()

# ================================================================== scenes
def sc_lights(ctx, t, dur, sc):
    ctx.set_source_rgb(0.01, 0.01, 0.02)
    ctx.paint()
    out_t = 5.2
    gy = 210
    # gantry
    rrect(ctx, 250, gy - 50, 780, 30, 6)
    fill(ctx, (0.12, 0.12, 0.14))
    for i in range(5):
        cx = 330 + i * 155
        rrect(ctx, cx - 50, gy - 30, 100, 200, 14)
        fill(ctx, (0.06, 0.06, 0.07))
        for j in range(2):
            cy = gy + 25 + j * 85
            on = (t >= 0.8 + i * 0.85) and t < out_t
            ctx.arc(cx, cy, 30, 0, 2 * math.pi)
            if on:
                fill(ctx, (0.95, 0.05, 0.05))
                rg = cairo.RadialGradient(cx, cy, 5, cx, cy, 90)
                rg.add_color_stop_rgba(0, 1, 0.1, 0.1, 0.55)
                rg.add_color_stop_rgba(1, 1, 0, 0, 0)
                ctx.set_source(rg)
                ctx.arc(cx, cy, 90, 0, 2 * math.pi)
                ctx.fill()
            else:
                fill(ctx, (0.18, 0.04, 0.04))
    if t >= out_t:
        p = eo((t - out_t) / 0.6)
        a = clamp((t - out_t) / 0.25) * clamp((dur - t) / 0.6)
        sz = lerp(140, 96, p)
        text(ctx, "LIGHTS OUT", W / 2, 560, sz, WHITE, a, "black", "c", track=4)
        # car launch
        cp = (t - out_t - 0.3) / 2.2
        if 0 <= cp <= 1.2:
            x = lerp(-500, W + 200, eio(clamp(cp)))
            for k in range(14):
                ly = 600 + (k % 7) * 12
                ctx.rectangle(x - 300 - k * 37 % 200, ly, 260, 2)
                fill(ctx, (1, 1, 1), 0.08)
            draw_car(ctx, x, 690, 4.2, team_col("MER"), WHITE, rot=t * 40)
    if t < 0.6:
        ctx.set_source_rgba(0, 0, 0, 1 - t / 0.6)
        ctx.paint()

def sc_title(ctx, t, dur, sc):
    background(ctx, t, RED)
    s = 1 + 0.03 * t / dur
    ctx.save()
    ctx.translate(W / 2, 330)
    ctx.scale(s, s)
    font(ctx, "black", 430)
    ext = ctx.text_extents("2026")
    ctx.move_to(-ext.x_advance / 2, 150)
    ctx.text_path("2026")
    ctx.set_line_width(2)
    ctx.set_source_rgba(1, 1, 1, 0.09 * eo(t / 1.5))
    ctx.stroke()
    ctx.restore()
    p1 = eo((t - 0.4) / 0.7)
    text(ctx, sc["kicker"], W / 2, 250 - 20 * (1 - p1), 26, RED, p1, "xbold", "c", track=8)
    p2 = eo((t - 0.7) / 0.8)
    ctx.save()
    ctx.rectangle(0, 270, W, 130)
    ctx.clip()
    text(ctx, sc["title"], W / 2, 370 + 110 * (1 - p2), 96, WHITE, 1, "black", "c", track=2)
    ctx.restore()
    p3 = eo((t - 1.3) / 0.8)
    ctx.rectangle(W / 2 - 160 * p3, 400, 320 * p3, 4)
    fill(ctx, RED)
    text(ctx, sc["sub"], W / 2, 450, 24, GREY, p3, "med", "c", track=2)
    # cars passing periodically
    period = 7.0
    ph = (t - 2.0) % period
    if t > 2.0 and ph < 2.6:
        x = lerp(-520, W + 120, ph / 2.6)
        for k in range(10):
            ctx.rectangle(x - 200 - (k * 53) % 260, 600 + (k % 5) * 14, 220, 2)
            fill(ctx, (1, 1, 1), 0.07)
        cols = ["MER", "FER", "MCL", "RBR"]
        c = cols[int((t - 2.0) // period) % 4]
        draw_car(ctx, x, 680, 3.6, team_col(c), WHITE, rot=t * 40, rain=True)

def sc_chapter(ctx, t, dur, sc):
    background(ctx, t, RED)
    p = eo(t / 0.8)
    size = 92 if len(sc["title"]) < 16 else 76
    bw = max(980, text_w(ctx, sc["title"], "black", size) + 420)
    para(ctx, lerp(-bw - 20, -120, p), 250, bw, 230, -60)
    fill(ctx, RED, 0.95)
    font(ctx, "black", 380)
    ctx.move_to(W - 40 - ctx.text_extents(sc["num"][-1]).x_advance, 560)
    ctx.text_path(sc["num"][-1])
    ctx.set_line_width(3)
    ctx.set_source_rgba(1, 1, 1, 0.12 * p)
    ctx.stroke()
    text(ctx, "PART " + sc["num"], 90, 300, 26, WHITE, eo((t - 0.3) / 0.5), "xbold", track=8)
    p2 = eo((t - 0.45) / 0.7)
    ctx.save()
    ctx.rectangle(0, 310, W, 150)
    ctx.clip()
    text(ctx, sc["title"], 86, 420 + 120 * (1 - p2), size, WHITE, 1, "black", track=1)
    ctx.restore()
    text(ctx, sc["sub"], 90, 540, 26, GREY, eo((t - 0.9) / 0.6), "med", track=1)

def card_items(ctx, t, dur, items, x, y0, wdt, step=104, sc=None):
    n = len(items)
    for i, it in enumerate(items):
        st = lstart(sc, i, dur, n) if sc else 0.6 + i * (dur * 0.72) / n
        p = eo((t - st) / 0.6)
        if p <= 0:
            continue
        y = y0 + i * step
        ox = -40 * (1 - p)
        rrect(ctx, x + ox, y, wdt, 84, 12)
        fill(ctx, CARD, 0.92 * p)
        rrect(ctx, x + ox, y, 6, 84, 3)
        fill(ctx, RED, p)
        ctx.arc(x + ox + 46, y + 42, 20, 0, 2 * math.pi)
        fill(ctx, RED, 0.18 * p)
        text(ctx, str(i + 1), x + ox + 46, y + 51, 22, RED, p, "black", "c")
        lines = wrap(ctx, it, "semi", 25, wdt - 100)
        if len(lines) == 1:
            text(ctx, lines[0], x + ox + 82, y + 51, 25, WHITE, p, "semi")
        else:
            for j, ln in enumerate(lines[:2]):
                text(ctx, ln, x + ox + 82, y + 38 + j * 28, 21, WHITE, p, "semi")

def heading(ctx, t, s, y=120, size=46):
    p = eo((t - 0.15) / 0.6)
    ctx.save()
    ctx.rectangle(0, y - size - 10, W, size + 26)
    ctx.clip()
    text(ctx, s, 80, y + (size + 20) * (1 - p), size, WHITE, 1, "black")
    ctx.restore()
    ctx.rectangle(80, y + 20, 90 * p, 5)
    fill(ctx, RED)

def sc_bullets(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, sc["heading"])
    card_items(ctx, t, dur, sc["items"], 80, 190, 540, sc=sc)
    vis = sc.get("visual")
    pv = eo((t - 0.4) / 0.8)
    ctx.save()
    ctx.translate(0, 30 * (1 - pv))
    rrect(ctx, 680, 170, 540, 470, 18)
    fill(ctx, (0.05, 0.06, 0.1), 0.85 * pv)
    rrect(ctx, 680, 170, 540, 470, 18)
    ctx.set_line_width(1.5)
    ctx.set_source_rgba(1, 1, 1, 0.07 * pv)
    ctx.stroke()
    ctx.restore()
    if pv > 0.05:
        ctx.save()
        ctx.rectangle(680, 170, 540, 470)
        ctx.clip()
        globals()["vis_" + vis](ctx, t, dur, pv)
        ctx.restore()

def vis_specs(ctx, t, dur, a):
    text(ctx, "2025  vs  2026", 950, 225, 22, GREY, a, "semi", "c", track=2)
    rows = [("Wheelbase", 3.6, 3.4, "m", 3.8), ("Width", 2.0, 1.9, "m", 2.1), ("Min. weight", 800, 768, "kg", 850)]
    for i, (lab, old, new, u, mx) in enumerate(rows):
        y = 290 + i * 115
        p = eo((t - 1.0 - i * 0.6) / 1.2)
        text(ctx, lab.upper(), 720, y, 17, GREY, a, "semi", track=2)
        rrect(ctx, 720, y + 14, 420 * old / mx * p, 22, 5)
        fill(ctx, DIM, a)
        text(ctx, f"{old:g} {u}", 720 + 420 * old / mx * p + 10, y + 32, 18, GREY, a * p, "semi")
        rrect(ctx, 720, y + 44, 420 * new / mx * p, 22, 5)
        fill(ctx, RED, a)
        text(ctx, f"{new:g} {u}", 720 + 420 * new / mx * p + 10, y + 62, 18, WHITE, a * p, "bold")
    # small car icon
    draw_car(ctx, 770, 625, 1.6, RED, WHITE, rot=t * 6, shadow=False)

def vis_powersplit(ctx, t, dur, a):
    cx, cy, R = 950, 400, 150
    p = eo((t - 0.8) / 2.0)
    elec = lerp(0.2, 0.5, p)
    ctx.set_line_width(42)
    ctx.arc(cx, cy, R, -math.pi / 2, -math.pi / 2 + 2 * math.pi * (1 - elec))
    ctx.set_source_rgba(*GREY, a * 0.8)
    ctx.stroke()
    pulse = 0.75 + 0.25 * math.sin(t * 5)
    ctx.arc(cx, cy, R, -math.pi / 2 + 2 * math.pi * (1 - elec), 1.5 * math.pi)
    ctx.set_source_rgba(0.2 * pulse, 0.75 * pulse + 0.2, 1, a)
    ctx.stroke()
    year = "2026" if p > 0.5 else "2025"
    text(ctx, year, cx, cy - 10, 46, WHITE, a, "black", "c")
    text(ctx, "POWER SPLIT", cx, cy + 26, 16, GREY, a, "semi", "c", track=2)
    text(ctx, f"Combustion  {round((1 - elec) * 100)}%", 720, 230, 22, GREY, a, "bold")
    text(ctx, f"Electric  {round(elec * 100)}%", 1180, 230, 22, (0.3, 0.85, 1), a, "bold", "r")
    text(ctx, "~350 kW electric  ·  MGU-H removed", cx, 610, 18, GREY, a * eo((t - 3) / 1), "med", "c")

def vis_wing(ctx, t, dur, a):
    cyc = (t % 6.0) / 6.0
    openf = eio(clamp((cyc - 0.05) / 0.12)) * (1 - eio(clamp((cyc - 0.55) / 0.12)))
    # airflow lines
    for k in range(9):
        y = 260 + k * 30
        sp = lerp(500, 900, openf)
        x = (t * sp + k * 97) % 640 + 660
        ctx.rectangle(x, y, 60 + 40 * openf, 2)
        fill(ctx, (0.4, 0.8, 1), 0.25 * a)
    draw_car(ctx, 730, 520, 4.4, RED, WHITE, rot=t * 20, flap=openf)
    mode = "STRAIGHT MODE · LOW DRAG" if openf > 0.5 else "CORNER MODE · HIGH DOWNFORCE"
    col = (0.3, 0.85, 1) if openf > 0.5 else GOLD
    rrect(ctx, 760, 570, 380, 40, 20)
    fill(ctx, col, 0.15 * a)
    text(ctx, mode, 950, 597, 17, col, a, "bold", "c", track=1.5)

def vis_overtake(ctx, t, dur, a):
    cyc = (t % 6.0)
    ctx.rectangle(690, 330, 520, 140)
    fill(ctx, (0.13, 0.14, 0.18), a)
    for k in range(12):
        x = 690 + ((k * 60 - t * 400) % 600)
        ctx.rectangle(x, 398, 30, 4)
        fill(ctx, WHITE, 0.5 * a)
    gap = lerp(1.6, 0.4, eio(clamp(cyc / 3.0)))
    boost = cyc > 3.0
    surge = eio(clamp((cyc - 3.2) / 1.8))
    lead_x = 1000 - 120 * surge
    chase_x = 1000 - gap * 170 + 230 * surge
    if boost:
        for k in range(6):
            ctx.rectangle(chase_x - 120 - k * 18, 430 + (k % 3) * 6 - 8, 90, 2)
            fill(ctx, (0.3, 0.85, 1), 0.5 * a)
    topcar(ctx, lead_x, 365, 0, team_col("MER"), 1.3)
    topcar(ctx, chase_x, 435, 0, team_col("MCL"), 1.3)
    text(ctx, f"GAP  {gap:.1f} s", 720, 240, 30, WHITE, a, "black")
    ok = gap < 1.0
    text(ctx, "WITHIN 1 SECOND" if ok else "TOO FAR BEHIND", 720, 275, 17, GREEN if ok else GREY, a, "bold", track=2)
    text(ctx, "ENERGY", 720, 540, 15, GREY, a, "semi", track=2)
    lvl = 1 - 0.7 * surge
    rrect(ctx, 720, 552, 460, 24, 6)
    fill(ctx, (0.15, 0.16, 0.22), a)
    rrect(ctx, 720, 552, 460 * lvl, 24, 6)
    fill(ctx, (0.3, 0.85, 1), a)
    if boost and int(t * 4) % 2 == 0:
        text(ctx, "OVERTAKE MODE", 1180, 610, 20, (0.3, 0.85, 1), a, "black", "r", track=2)

def vis_compression(ctx, t, dur, a):
    cx, cy, R = 950, 480, 160
    ctx.set_line_width(18)
    ctx.arc(cx, cy, R, math.pi, 2 * math.pi)
    ctx.set_source_rgba(0.18, 0.2, 0.28, a)
    ctx.stroke()
    lim = (16 - 10) / 10
    ctx.arc(cx, cy, R, math.pi + math.pi * lim, 2 * math.pi)
    ctx.set_source_rgba(*RED, a * 0.8)
    ctx.stroke()
    for v in (10, 12, 14, 16, 18, 20):
        ang = math.pi + math.pi * ((v - 10) / 10)
        text(ctx, str(v), cx + math.cos(ang) * (R + 34), cy + math.sin(ang) * (R + 34) + 6, 15, GREY, a, "semi", "c")
    cyc = (t % 7.0) / 7.0
    hot = cyc > 0.5
    val = lerp(15.6, 16.0, eo(cyc * 2)) if not hot else lerp(16.0, 17.6, eo((cyc - 0.5) * 3))
    ang = math.pi + math.pi * ((val - 10) / 10)
    ctx.move_to(cx, cy)
    ctx.line_to(cx + math.cos(ang) * (R - 20), cy + math.sin(ang) * (R - 20))
    ctx.set_line_width(5)
    ctx.set_source_rgba(*WHITE, a)
    ctx.stroke()
    ctx.arc(cx, cy, 12, 0, 2 * math.pi)
    fill(ctx, WHITE, a)
    text(ctx, "LIMIT 16 : 1", cx, cy + 60, 22, RED, a, "black", "c", track=2)
    lab, col = ("ON TRACK, HOT ?", RED) if hot else ("GARAGE TEST, COLD", (0.3, 0.85, 1))
    rrect(ctx, cx - 160, 200, 320, 44, 22)
    fill(ctx, col, 0.15 * a)
    text(ctx, lab, cx, 229, 19, col, a, "bold", "c", track=1.5)

def vis_report(ctx, t, dur, a):
    rows = [("MER", "A+"), ("FER", "B"), ("MCL", "B+"), ("RBR", "B"), ("AST", "D"), ("CAD", "C")]
    text(ctx, "OUR SUMMER GRADES", 950, 222, 18, GREY, a, "semi", "c", track=2)
    for i, (k, g) in enumerate(rows):
        p = eo((t - 1.0 - i * 0.5) / 0.6)
        y = 250 + i * 62
        rrect(ctx, 720, y, 460, 50, 10)
        fill(ctx, CARD, a * p)
        rrect(ctx, 720, y, 8, 50, 4)
        fill(ctx, team_col(k), a * p)
        text(ctx, TEAMS[k][0], 745, y + 33, 22, WHITE, a * p, "bold")
        gc = GREEN if g.startswith("A") else GOLD if g.startswith("B") else RED
        text(ctx, g, 1160, y + 36, 30, gc, a * p, "black", "r")

def vis_thumbs(ctx, t, dur, a):
    for i, (lab, up) in enumerate((("UP", True), ("DOWN", False))):
        cx = 830 + i * 240
        p = eo((t - 0.8 - i * (dur * 0.35)) / 0.7)
        bob = math.sin(t * 3 + i) * 6
        col = GREEN if up else RED
        ctx.save()
        ctx.translate(cx, 400 + bob)
        if not up:
            ctx.rotate(math.pi)
        ctx.move_to(0, -110)
        ctx.line_to(80, -20)
        ctx.line_to(30, -20)
        ctx.line_to(30, 90)
        ctx.line_to(-30, 90)
        ctx.line_to(-30, -20)
        ctx.line_to(-80, -20)
        ctx.close_path()
        ctx.set_source_rgba(*col, 0.9 * a * p)
        ctx.fill()
        ctx.restore()
        text(ctx, lab, cx, 590, 28, col, a * p, "black", "c", track=3)

def sc_grid(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, "The 2026 grid", 110, 42)
    hl = [["CAD"], ["AUD", "AST"], ["RBR"], ["RBR"], ["FER", "MCL"]]
    curs = []
    for j, ks in enumerate(hl):
        if t >= lstart(sc, j, dur, len(hl)):
            curs = ks
    cols = [80, 330, 520, 860]
    y0, rh = 158, 48
    for i, (k, d1, d2) in enumerate(script.GRID):
        p = eo((t - 0.3 - i * 0.12) / 0.5)
        y = y0 + i * rh
        on = k in curs
        rrect(ctx, 70 - 20 * (1 - p), y, 1140, rh - 6, 8)
        fill(ctx, team_col(k) if on else CARD, (0.22 if on else 0.75) * p)
        rrect(ctx, 70 - 20 * (1 - p), y, 8, rh - 6, 3)
        fill(ctx, team_col(k), p)
        text(ctx, TEAMS[k][0].upper(), cols[0] + 10, y + 29, 20, WHITE, p, "black", track=1)
        text(ctx, TEAMS[k][2], cols[1], y + 29, 17, GREY, p, "med")
        text(ctx, d1, cols[2], y + 29, 20, WHITE, p, "semi")
        text(ctx, d2, cols[3], y + 29, 20, WHITE, p, "semi")
    text(ctx, "TEAM", cols[0] + 10, 146, 13, DIM, 1, "semi", track=2)
    text(ctx, "POWER UNIT", cols[1], 146, 13, DIM, 1, "semi", track=2)
    text(ctx, "DRIVERS", cols[2], 146, 13, DIM, 1, "semi", track=2)

CAL = ["AUS", "CHN", "JPN", "BHR", "SAU", "MIA", "CAN", "MON", "BCN", "AUT", "GBR", "BEL",
       "HUN", "NED", "ITA", "MAD", "AZE", "SIN", "USA", "MEX", "BRA", "LVG", "QAT", "ABU"]

def sc_calendar(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, "A calendar torn up", 110, 42)
    l1, l2, l4 = lstart(sc, 1, dur, 5), lstart(sc, 2, dur, 5), lstart(sc, 4, dur, 5)
    cancel = eo((t - l1 - 1.5) / 0.5)
    collapse = eio((t - l1 - 3.5) / 0.7)
    add = eo((t - l2 - 1.0) / 0.7)
    done = eo((t - l4) / 0.7)
    # layout positions
    def layout(codes):
        pos = {}
        for i, c in enumerate(codes):
            r, col = divmod(i, 12)
            pos[c] = (64 + col * 96, 230 + r * 150)
        return pos
    before = layout(CAL)
    after_codes = [c for c in CAL if c not in ("BHR", "SAU")]
    mid = layout(after_codes)
    fin_codes = after_codes[:]
    fin_codes.insert(fin_codes.index("AZE") + 1, "MAL")
    final = layout(fin_codes)
    for i, c in enumerate(CAL + ["MAL"]):
        app = eo((t - 0.3 - i * 0.05) / 0.4)
        if c == "MAL":
            if add <= 0:
                continue
            x, y = final[c]
            y -= 80 * (1 - add)
            a = add
        elif c in ("BHR", "SAU"):
            x, y = before[c]
            y += 60 * collapse
            a = app * (1 - collapse)
        else:
            x0, y0 = before[c]
            x1, y1 = mid[c]
            x2, y2 = final[c]
            x, y = lerp(x0, x1, collapse), lerp(y0, y1, collapse)
            x, y = lerp(x, x2, add), lerp(y, y2, add)
            a = app
        if a <= 0:
            continue
        rnd_i = fin_codes.index(c) if c in fin_codes else -1
        completed = done > 0 and 0 <= rnd_i < 20
        base = GREEN if completed else (rgb("#3a8dff") if c == "MAL" else CARD)
        rrect(ctx, x, y, 86, 100, 10)
        fill(ctx, CARD, a)
        if completed:
            rrect(ctx, x, y, 86, 100, 10)
            fill(ctx, GREEN, 0.25 * done * a)
        if c == "MAL":
            rrect(ctx, x, y, 86, 100, 10)
            ctx.set_line_width(2.5)
            ctx.set_source_rgba(0.3, 0.6, 1, a)
            ctx.stroke()
        if c in ("BHR", "SAU") and cancel > 0:
            rrect(ctx, x, y, 86, 100, 10)
            fill(ctx, RED, 0.35 * cancel * a)
            ctx.set_line_width(6)
            ctx.set_source_rgba(*RED, a * cancel)
            ctx.move_to(x + 14, y + 14)
            ctx.line_to(x + 14 + 58 * cancel, y + 14 + 72 * cancel)
            ctx.stroke()
        num = (CAL.index(c) + 1) if (collapse < 0.5 and c in CAL) else (rnd_i + 1 if rnd_i >= 0 else "")
        text(ctx, str(num), x + 10, y + 24, 14, GREY, a, "semi")
        text(ctx, c, x + 43, y + 66, 26, WHITE, a, "black", "c")
        if c == "MAD":
            text(ctx, "NEW", x + 43, y + 88, 12, GOLD, a, "bold", "c", track=1.5)
        if c == "MAL":
            text(ctx, "SEPANG", x + 43, y + 88, 11, (0.4, 0.7, 1), a, "bold", "c", track=1)
    cnt = 24 if collapse < 0.5 else (22 if add < 0.5 else 23)
    text(ctx, f"{cnt} ROUNDS", W - 80, 120, 40, RED, 1, "black", "r", track=2)
    if cancel > 0:
        text(ctx, "Bahrain & Saudi Arabia cancelled (April)", 80, 600, 22, RED, cancel * (1 - add), "bold")
    if add > 0:
        text(ctx, "Bahrain GP moved to Sepang, Malaysia (October)", 80, 600, 22, (0.4, 0.7, 1), add * (1 - done), "bold")
    if done > 0:
        text(ctx, "20 completed  ·  3 to go", 80, 600, 24, GREEN, done, "bold")

_tracks = {}

def sc_race(ctx, t, dur, sc):
    tc = team_col(sc["podium"][0][1])
    background(ctx, t, tc)
    box = (90, 150, 610, 610)
    key = sc["seed"]
    if key not in _tracks:
        _tracks[key] = make_track(sc["seed"], box)
    pts, cum = _tracks[key]
    L = cum[-1]
    rrect(ctx, 50, 100, 600, 560, 20)
    fill(ctx, (0.04, 0.05, 0.09), 0.75)
    draw_track(ctx, pts, eio(t / 1.4))
    sx, sy, sa = track_pos(pts, cum, 0)
    if t > 1.4:
        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(sa + math.pi / 2)
        for k in range(4):
            for j in range(2):
                ctx.rectangle(-8 + k * 4, -3 + j * 3, 4, 3)
                fill(ctx, WHITE if (k + j) % 2 == 0 else (0, 0, 0))
        ctx.restore()
    # cars
    if t > 1.0:
        rnd = random.Random(sc["seed"])
        pod = [k for _, k in sc["podium"]]
        others = [k for k in TEAMS if k not in pod]
        rnd.shuffle(others)
        field = (pod + others)[:8]
        a = clamp((t - 1.0) / 0.5)
        speed = L / 9.0
        for i in reversed(range(len(field))):
            gap = 34 * i + 8 * math.sin(t * 0.7 + i * 1.7) * (i > 0)
            s = speed * (t - 1.0) - gap
            x, y, ang = track_pos(pts, cum, s)
            ctx.arc(x, y, 8.5 if i == 0 else 7, 0, 2 * math.pi)
            ctx.set_source_rgba(0, 0, 0, a * 0.6)
            ctx.set_line_width(5)
            ctx.stroke_preserve()
            fill(ctx, team_col(field[i]), a)
            if i == 0:
                rg = cairo.RadialGradient(x, y, 2, x, y, 28)
                rg.add_color_stop_rgba(0, *team_col(field[0]), 0.5 * a)
                rg.add_color_stop_rgba(1, *team_col(field[0]), 0)
                ctx.set_source(rg)
                ctx.arc(x, y, 28, 0, 2 * math.pi)
                ctx.fill()
                tag = abbr(sc["podium"][0][0])
                rrect(ctx, x + 12, y - 34, 52, 24, 5)
                fill(ctx, (0.03, 0.03, 0.05), 0.85 * a)
                text(ctx, tag, x + 38, y - 16, 15, team_col(field[0]), a, "black", "c")
        lap = min(57, 1 + int((t - 1.0) / 9.0 * 6))
        text(ctx, f"ILLUSTRATIVE CIRCUIT  ·  RACE SIM", 70, 645, 12, DIM, 1, "semi", track=1.5)
    # ---------------- info panel
    X = 700
    p = eo((t - 0.2) / 0.6)
    rrect(ctx, X, 118, 150, 34, 17)
    fill(ctx, RED, p)
    text(ctx, f"ROUND {sc['rnd']}", X + 75, 141, 17, WHITE, p, "black", "c", track=2)
    text(ctx, sc["date"].upper(), X + 168, 141, 17, GREY, p, "semi", track=2)
    lines = wrap(ctx, sc["gp"], "black", 44, 520)
    size = 44 if len(lines) == 1 else 36
    lines = wrap(ctx, sc["gp"], "black", size, 520)
    p2 = eo((t - 0.4) / 0.7)
    for j, ln in enumerate(lines[:2]):
        text(ctx, ln, X + 30 * (1 - p2), 202 + j * 42, size, WHITE, p2, "black")
    yv = 202 + (len(lines[:2]) - 1) * 42 + 36
    text(ctx, sc["venue"], X, yv, 19, GREY, p2, "med")
    # podium
    y = yv + 30
    text(ctx, "PODIUM" if len(sc["podium"]) > 1 else "WINNER", X, y + 8, 14, DIM, eo((t - 1.0) / 0.5), "semi", track=3)
    y += 20
    for i, (nm, k) in enumerate(sc["podium"]):
        pp = eo((t - 1.3 - i * 0.45) / 0.55)
        if pp <= 0:
            continue
        hgt = 62 if i == 0 else 48
        rrect(ctx, X + 30 * (1 - pp), y, 520, hgt, 10)
        fill(ctx, CARD, 0.9 * pp)
        rrect(ctx, X + 30 * (1 - pp), y, 8, hgt, 4)
        fill(ctx, team_col(k), pp)
        text(ctx, f"P{i + 1}", X + 24 + 30 * (1 - pp), y + hgt / 2 + 9, 24 if i == 0 else 19,
             GOLD if i == 0 else GREY, pp, "black")
        text(ctx, nm, X + 86 + 30 * (1 - pp), y + hgt / 2 + 10, 28 if i == 0 else 21, WHITE, pp, "black" if i == 0 else "bold")
        text(ctx, TEAMS[k][0].upper(), X + 505, y + hgt / 2 + 6, 13, team_col(k), pp, "bold", "r", track=1.5)
        y += hgt + 8
    y += 12
    nchips = len(sc["chips"])
    for i, c in enumerate(sc["chips"]):
        st = dur * (0.28 + 0.5 * i / max(1, nchips))
        pc = eo((t - st) / 0.5)
        if pc <= 0:
            continue
        lines = wrap(ctx, c, "semi", 18, 470)
        hh = 40 if len(lines) == 1 else 62
        rrect(ctx, X, y, 520, hh, hh / 2 if hh == 40 else 14)
        fill(ctx, tc, 0.13 * pc)
        ctx.arc(X + 22, y + hh / 2, 5, 0, 2 * math.pi)
        fill(ctx, tc, pc)
        for j, ln in enumerate(lines[:2]):
            text(ctx, ln, X + 40, y + 26 + j * 23 + (0 if hh == 40 else 0), 18, WHITE, pc, "semi")
        y += hh + 9

def sc_stat(ctx, t, dur, sc):
    background(ctx, t, team_col("MER"))
    heading(ctx, t, sc.get("heading", ""), 130, 44)
    n = len(sc["stats"])
    for i, (num, lab) in enumerate(sc["stats"]):
        cx = W / (n + 1) * (i + 1)
        p = eo((t - 0.6 - i * 0.9) / 0.8)
        s = lerp(0.6, 1.0, p)
        ctx.save()
        ctx.translate(cx, 400)
        ctx.scale(s, s)
        text(ctx, num, 0, 0, 150, team_col("MER") if i < 2 else WHITE, p, "black", "c")
        ctx.restore()
        text(ctx, lab.upper(), cx, 470, 22, GREY, p, "bold", "c", track=3)

def sc_bars(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, sc["heading"], 110, 42)
    rows = sc["rows"]
    n = len(rows)
    top, bot = 160, 660
    rh = min(70, (bot - top) / n)
    mx = max(r[2] for r in rows) or 1
    bx, bw = 360, 760
    for i, (nm, k, v) in enumerate(rows):
        y = top + i * rh
        p = eio((t - 0.6 - i * 0.18) / 1.6)
        a = clamp((t - 0.5 - i * 0.18) / 0.3)
        text(ctx, str(i + 1), 82, y + rh * 0.62, rh * 0.36, DIM, a, "black")
        text(ctx, nm, 122, y + rh * 0.62, min(26, rh * 0.4), WHITE, a, "bold")
        bh = rh * 0.62
        w = max(4, bw * (v / mx) * p)
        rrect(ctx, bx, y + (rh - bh) / 2, w, bh, min(8, bh / 3))
        g = cairo.LinearGradient(bx, 0, bx + w, 0)
        c = team_col(k)
        g.add_color_stop_rgba(0, *c, 0.55 * a)
        g.add_color_stop_rgba(1, *c, 1.0 * a)
        ctx.set_source(g)
        ctx.fill()
        val = int(round(v * p))
        text(ctx, f"{val}{sc['unit']}", bx + w + 14, y + rh * 0.63, min(24, rh * 0.38), WHITE, a, "black")

def trophy(ctx, cx, cy, s, a):
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(s, s)
    g = cairo.LinearGradient(-60, 0, 60, 0)
    g.add_color_stop_rgba(0, 0.6, 0.45, 0.1, a)
    g.add_color_stop_rgba(0.45, 1.0, 0.88, 0.45, a)
    g.add_color_stop_rgba(1, 0.65, 0.48, 0.12, a)
    ctx.move_to(-70, -120)
    ctx.line_to(70, -120)
    ctx.curve_to(70, -30, 40, 10, 12, 25)
    ctx.line_to(12, 70)
    ctx.line_to(45, 95)
    ctx.line_to(-45, 95)
    ctx.line_to(-12, 70)
    ctx.line_to(-12, 25)
    ctx.curve_to(-40, 10, -70, -30, -70, -120)
    ctx.close_path()
    ctx.set_source(g)
    ctx.fill()
    for sgn in (-1, 1):
        ctx.arc(sgn * 78, -80, 26, 0, 2 * math.pi)
        ctx.set_line_width(10)
        ctx.set_source(g)
        ctx.stroke()
    ctx.rectangle(-60, 95, 120, 26)
    ctx.set_source_rgba(0.12, 0.1, 0.08, a)
    ctx.fill()
    ctx.restore()

def champ_bg(ctx, t):
    tc = team_col("MER")
    background(ctx, t, GOLD)
    # rays
    ctx.save()
    ctx.translate(320, 360)
    ctx.rotate(t * 0.08)
    for k in range(18):
        ctx.move_to(0, 0)
        ctx.arc(0, 0, 900, k * 2 * math.pi / 18, k * 2 * math.pi / 18 + 0.12)
        ctx.close_path()
        ctx.set_source_rgba(*GOLD, 0.05)
        ctx.fill()
    ctx.restore()
    p = eo(t / 1.2)
    trophy(ctx, 320, 360 + 20 * math.sin(t * 1.3), lerp(0.6, 1.5, p), p)
    # confetti
    rnd = random.Random(7)
    for i in range(140):
        x0 = rnd.uniform(0, W)
        sp = rnd.uniform(60, 160)
        ph = rnd.uniform(0, 20)
        y = ((t + ph) * sp) % (H + 40) - 20
        x = x0 + 30 * math.sin(t * 2 + i)
        c = [GOLD, tc, WHITE, RED][i % 4]
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(t * 3 + i)
        ctx.rectangle(-5, -2.5, 10, 5)
        ctx.set_source_rgba(*c, 0.8 * clamp(t / 1.0))
        ctx.fill()
        ctx.restore()

def sc_champion(ctx, t, dur, sc):
    tc = team_col("MER")
    champ_bg(ctx, t)
    X = 600
    p1 = eo((t - 0.5) / 0.7)
    text(ctx, "2026 WORLD CHAMPION", X, 190, 26, GOLD, p1, "xbold", track=6)
    p2 = eo((t - 0.8) / 0.8)
    ctx.save()
    ctx.rectangle(X - 10, 200, 700, 200)
    ctx.clip()
    text(ctx, "KIMI", X, 280 + 120 * (1 - p2), 92, WHITE, 1, "black", track=2)
    text(ctx, "ANTONELLI", X, 372 + 120 * (1 - p2), 92, tc, 1, "black", track=2)
    ctx.restore()
    facts = [("20", "years old"), ("YOUNGEST", "champion ever"), ("1953", "last Italian champion"), ("4", "races to spare")]
    for i, (big, small) in enumerate(facts):
        st = [lstart(sc, 0, dur) + 2.5, lstart(sc, 1, dur), lstart(sc, 1, dur) + 4.0, lstart(sc, 2, dur) + 3.0][i]
        pf = eo((t - st) / 0.6)
        x = X + (i % 2) * 300
        y = 430 + (i // 2) * 105
        rrect(ctx, x, y + 20 * (1 - pf), 285, 92, 14)
        fill(ctx, CARD, 0.88 * pf)
        text(ctx, big, x + 20, y + 50 + 20 * (1 - pf), 34 if len(big) < 6 else 28, GOLD, pf, "black")
        text(ctx, small.upper(), x + 20, y + 76 + 20 * (1 - pf), 14, GREY, pf, "semi", track=2)

def sc_next(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, "Three rounds to go", 110, 42)
    for i, (r, nm) in enumerate(sc["items"]):
        p = eo((t - 0.5 - i * 0.4) / 0.6)
        x = 80 + i * 380
        rrect(ctx, x, 160 + 30 * (1 - p), 350, 190, 16)
        fill(ctx, CARD, 0.9 * p)
        key = 900 + i
        if key not in _tracks:
            _tracks[key] = make_track(key * 7, (x + 190, 180, x + 330, 330))
        pts, cum = _tracks[key]
        if p > 0.5:
            ctx.save()
            ctx.translate(0, 30 * (1 - p))
            ctx.set_line_width(5)
            ctx.move_to(*pts[0])
            for pt in pts[1:]:
                ctx.line_to(*pt)
            ctx.close_path()
            ctx.set_source_rgba(1, 1, 1, 0.5 * p)
            ctx.stroke()
            cx_, cy_, _ = track_pos(pts, cum, t * 120)
            ctx.arc(cx_, cy_, 6, 0, 2 * math.pi)
            fill(ctx, RED, p)
            ctx.restore()
        text(ctx, f"ROUND {r}", x + 24, 210 + 30 * (1 - p), 16, RED, p, "black", track=2)
        text(ctx, nm, x + 24, 300 + 30 * (1 - p), 32 if len(nm) < 9 else 28, WHITE, p, "black")
    # P2 battle
    pb = eo((t - dur * 0.42) / 0.8)
    text(ctx, "THE BATTLE FOR P2", 80, 410, 18, GREY, pb, "semi", track=3)
    rows = [("Verstappen", "RBR", 279), ("Russell", "MER", 262), ("Hamilton", "FER", 261), ("Leclerc", "FER", 249), ("Norris", "MCL", 246)]
    for i, (nm, k, v) in enumerate(rows):
        pp = eio((t - dur * 0.45 - i * 0.2) / 1.2)
        y = 432 + i * 44
        text(ctx, nm, 80, y + 26, 20, WHITE, pb, "bold")
        w = 600 * (v - 200) / 90 * pp
        rrect(ctx, 260, y + 6, max(4, w), 28, 6)
        fill(ctx, team_col(k), pb)
        text(ctx, str(v), 260 + w + 12, y + 28, 20, WHITE, pb * pp, "black")
    pg = eo((t - dur * 0.75) / 0.6)
    rrect(ctx, 960, 470, 240, 140, 16)
    fill(ctx, RED, 0.15 * pg)
    text(ctx, "3 pts", 1080, 540, 48, RED, pg, "black", "c")
    text(ctx, "RED BULL vs McLAREN", 1080, 580, 14, GREY, pg, "bold", "c", track=1.5)

def sc_outro(ctx, t, dur, sc):
    background(ctx, t, team_col("MER"))
    p = eo((t - 0.3) / 0.8)
    text(ctx, "2026", W / 2, 270, 40, RED, p, "black", "c", track=12)
    text(ctx, "A NEW ERA.", W / 2, 370, 84, WHITE, eo((t - 0.6) / 0.8), "black", "c", track=2)
    text(ctx, "A NEW CHAMPION.", W / 2, 460, 84, team_col("MER"), eo((t - 1.4) / 0.8), "black", "c", track=2)
    pe = eo((t - dur * 0.6) / 0.8)
    text(ctx, "THANKS FOR WATCHING  ·  SEE YOU IN LAS VEGAS", W / 2, 530, 22, GREY, pe, "bold", "c", track=3)
    ph = clamp((t - 2.0) / 5.0)
    if 0 < ph < 1:
        x = lerp(-520, W + 100, eio(ph))
        draw_car(ctx, x, 660, 3.4, team_col("MER"), WHITE, rot=t * 40, rain=True)
    pb = eo((t - lstart(sc, 1, dur)) / 0.6)
    if pb > 0:
        bw = 300
        bx = W / 2 - bw / 2
        pulse = 1 + 0.04 * math.sin(t * 6)
        ctx.save()
        ctx.translate(W / 2, 610)
        ctx.scale(pulse * pb, pulse * pb)
        rrect(ctx, -bw / 2, -32, bw, 64, 12)
        fill(ctx, (0.85, 0.0, 0.0))
        text(ctx, "SUBSCRIBE", 0, 11, 30, WHITE, 1, "black", "c", track=2)
        ctx.restore()

def sc_credits(ctx, t, dur, sc):
    ctx.set_source_rgb(*BG0)
    ctx.paint()
    lines = [("CREDITS", RED, 22, "black"),
             ("", WHITE, 10, "reg"),
             ("Script, animation and editing: generated programmatically", WHITE, 22, "semi"),
             ("Narration: AI voice (Kokoro text-to-speech)", WHITE, 22, "semi"),
             ("Music and sound effects: original, synthesised for this video", WHITE, 22, "semi"),
             ("Race scenes and circuit maps are illustrative animations, not real footage", GREY, 19, "med"),
             ("Results and standings as published after the Sao Paulo GP, 8 November 2026", GREY, 19, "med"),
             ("An unofficial fan video, not affiliated with Formula 1, the FIA or any team", GREY, 19, "med")]
    a = clamp(t / 0.8) * clamp((dur - t) / 2.0)
    y = 220
    for s, c, sz, w in lines:
        text(ctx, s, W / 2, y, sz, c, a, w, "c", track=2 if s == "CREDITS" else 0)
        y += sz + 24

def sc_duel(ctx, t, dur, sc):
    """Cinematic side-on chase with an overtake."""
    ca, cb = sc["colors"]
    sky = cairo.LinearGradient(0, 0, 0, 470)
    sky.add_color_stop_rgb(0, 0.03, 0.04, 0.12)
    sky.add_color_stop_rgb(1, 0.25, 0.14, 0.32)
    ctx.set_source(sky)
    ctx.rectangle(0, 0, W, 470)
    ctx.fill()
    # far skyline
    rnd = random.Random(5)
    off = (t * 30) % 1600
    for k in range(40):
        bx = (k * 80 - off) % 1600 - 160
        bh = rnd.uniform(60, 190)
        ctx.rectangle(bx, 340 - bh, 70, bh + 10)
        fill(ctx, (0.07, 0.07, 0.15))
        for wy in range(int(340 - bh + 10), 330, 18):
            if rnd.random() < 0.35:
                ctx.rectangle(bx + 10 + rnd.randint(0, 4) * 12, wy, 6, 6)
                fill(ctx, (1, 0.85, 0.5), 0.35)
    # floodlights
    for k in range(6):
        lx = (k * 260 - t * 120) % (W + 260) - 130
        ctx.rectangle(lx, 120, 6, 230)
        fill(ctx, (0.1, 0.1, 0.16))
        rg = cairo.RadialGradient(lx + 3, 120, 2, lx + 3, 120, 70)
        rg.add_color_stop_rgba(0, 1, 1, 0.9, 0.7)
        rg.add_color_stop_rgba(1, 1, 1, 0.9, 0)
        ctx.set_source(rg)
        ctx.arc(lx + 3, 120, 70, 0, 2 * math.pi)
        ctx.fill()
    # grandstand
    ctx.rectangle(0, 330, W, 110)
    fill(ctx, (0.1, 0.1, 0.16))
    off2 = (t * 420) % 40
    crowd = random.Random(3)
    cols = [RED, WHITE, GOLD, team_col("MER"), team_col("MCL"), team_col("RBR")]
    for row in range(6):
        for k in range(36):
            cx = (k * 40 + row * 13 - off2 * (1 + row * 0.02)) % (W + 40) - 20
            ctx.rectangle(cx, 345 + row * 15 + (math.sin(t * 9 + k + row) > 0.9) * -3, 8, 8)
            fill(ctx, cols[crowd.randint(0, 5)], 0.55)
    # fence
    off3 = (t * 900) % 60
    ctx.set_line_width(2)
    ctx.set_source_rgba(0.6, 0.6, 0.7, 0.35)
    for k in range(25):
        x = k * 60 - off3
        ctx.move_to(x, 420)
        ctx.line_to(x, 480)
    ctx.stroke()
    ctx.rectangle(0, 440, W, 2)
    fill(ctx, (0.6, 0.6, 0.7), 0.3)
    # asphalt
    g = cairo.LinearGradient(0, 480, 0, H)
    g.add_color_stop_rgb(0, 0.16, 0.16, 0.19)
    g.add_color_stop_rgb(1, 0.09, 0.09, 0.11)
    ctx.set_source(g)
    ctx.rectangle(0, 480, W, H - 480)
    ctx.fill()
    off4 = (t * 1500) % 120
    for k in range(13):
        x = k * 120 - off4
        ctx.rectangle(x, 480, 60, 14)
        fill(ctx, RED)
        ctx.rectangle(x + 60, 480, 60, 14)
        fill(ctx, WHITE)
    ctx.rectangle(0, 494, W, 4)
    fill(ctx, WHITE, 0.9)
    sr = random.Random(9)
    for k in range(26):
        y = sr.uniform(510, 715)
        ln = sr.uniform(80, 260)
        x = (sr.uniform(0, W + 400) - t * sr.uniform(1800, 2600)) % (W + 400) - 300
        ctx.rectangle(x, y, ln, 1.5)
        fill(ctx, WHITE, 0.06)
    # car motion
    f = t / dur
    surge = eio(clamp((f - 0.25) / 0.5))
    ax = lerp(560, 260, surge) + 8 * math.sin(t * 1.7)
    bx = lerp(140, 640, surge) + 6 * math.sin(t * 2.1 + 1)
    rot = t * 60
    draw_car(ctx, ax, 590 + math.sin(t * 23) * 0.8, 4.0, team_col(ca), WHITE, rot=rot, rain=True)
    if 0.2 < f < 0.8:
        for k in range(8):
            ctx.rectangle(bx - 160 - k * 22, 640 + (k % 4) * 9, 150, 2)
            fill(ctx, (0.3, 0.85, 1), 0.45)
    draw_car(ctx, bx, 680 + math.sin(t * 21) * 0.9, 4.5, team_col(cb), WHITE, rot=rot * 1.05, rain=True)
    # sparks
    sp = random.Random(int(t * 15))
    for k in range(12):
        sx = bx + 60 + sp.uniform(0, 160)
        ctx.rectangle(sx, 676 + sp.uniform(-3, 3), -sp.uniform(10, 40), 1.5)
        fill(ctx, (1, 0.8, 0.3), sp.uniform(0.2, 0.9))
    # letterbox + caption
    ctx.rectangle(0, 0, W, 54)
    fill(ctx, (0, 0, 0))
    ctx.rectangle(0, H - 54, W, 54)
    fill(ctx, (0, 0, 0))
    pc = eo((t - 0.5) / 0.6) * clamp((dur - t - 0.3) / 0.5) if sc.get("caption") else 0
    rrect(ctx, 40, 70, 8, 34, 3)
    fill(ctx, RED, pc)
    text(ctx, sc["caption"], 60, 97, 24, WHITE, pc, "black", track=3)
    if sc.get("caption") and 0.42 < f < 0.66 and int(t * 6) % 2 == 0:
        text(ctx, "OVERTAKE", W - 60, 97, 24, (0.3, 0.85, 1), 1, "black", "r", track=4)
    text(ctx, "ILLUSTRATIVE ANIMATION", W - 40, H - 22, 12, DIM, 1, "semi", "r", track=1.5)


# ======================================================= new scene types
YEL = rgb("#FFE14D")

def helmet(ctx, cx, cy, r, col, a=1.0):
    ctx.save()
    ctx.translate(cx, cy)
    g = cairo.LinearGradient(-r, -r, r, r)
    g.add_color_stop_rgba(0, *[min(1, c * 1.25 + 0.1) for c in col], a)
    g.add_color_stop_rgba(1, *[c * 0.55 for c in col], a)
    ctx.move_to(-r * 0.95, r * 0.55)
    ctx.curve_to(-r * 1.05, -r * 0.6, -r * 0.5, -r * 1.05, r * 0.15, -r * 1.0)
    ctx.curve_to(r * 0.85, -r * 0.95, r * 1.1, -r * 0.3, r * 1.05, r * 0.25)
    ctx.line_to(r * 0.95, r * 0.75)
    ctx.line_to(-r * 0.6, r * 0.8)
    ctx.close_path()
    ctx.set_source(g)
    ctx.fill()
    # visor
    ctx.move_to(-r * 0.05, -r * 0.35)
    ctx.curve_to(r * 0.5, -r * 0.42, r * 0.95, -r * 0.3, r * 1.04, -r * 0.05)
    ctx.line_to(r * 1.0, r * 0.22)
    ctx.curve_to(r * 0.6, r * 0.2, r * 0.1, r * 0.15, -r * 0.05, r * 0.1)
    ctx.close_path()
    ctx.set_source_rgba(0.05, 0.06, 0.1, a)
    ctx.fill()
    ctx.move_to(r * 0.2, -r * 0.3)
    ctx.line_to(r * 0.8, -r * 0.24)
    ctx.set_line_width(r * 0.05)
    ctx.set_source_rgba(1, 1, 1, 0.35 * a)
    ctx.stroke()
    # stripe
    ctx.move_to(-r * 0.9, r * 0.35)
    ctx.curve_to(-r * 0.4, r * 0.3, r * 0.3, r * 0.45, r * 0.98, r * 0.5)
    ctx.set_line_width(r * 0.1)
    ctx.set_source_rgba(1, 1, 1, 0.8 * a)
    ctx.stroke()
    ctx.restore()

def big_caption(ctx, s, cx, cy, maxw, size, p, a=1.0, rot=-0.04, col=WHITE, col2=YEL):
    lines = s.split("\n")
    sz = size
    for ln in lines:
        w = text_w(ctx, ln, "black", sz)
        if w > maxw:
            sz = min(sz, size * maxw / w)
    lh = sz * 1.02
    sc_ = lerp(1.5, 1.0, eo(p / 0.6)) if p < 0.6 else 1.0
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    ctx.scale(sc_, sc_)
    y0 = -lh * (len(lines) - 1) / 2 + sz * 0.36
    for i, ln in enumerate(lines):
        font(ctx, "black", sz)
        tw = ctx.text_extents(ln).x_advance
        y = y0 + i * lh
        # shadow
        ctx.move_to(-tw / 2 + sz * 0.06, y + sz * 0.06)
        ctx.text_path(ln)
        ctx.set_source_rgba(*RED, 0.9 * a)
        ctx.fill()
        ctx.move_to(-tw / 2, y)
        ctx.text_path(ln)
        ctx.set_line_width(sz * 0.12)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.set_source_rgba(0, 0, 0, a)
        ctx.stroke_preserve()
        ctx.set_source_rgba(*(col2 if i % 2 else col), a)
        ctx.fill()
    ctx.restore()

def sc_hype(ctx, t, dur, sc):
    L = sc["_lines"]
    j = 0
    for k, (st, d, *_r) in enumerate(L):
        if t >= st - 0.25:
            j = k
    b = sc["beats"][j]
    st = L[j][0]
    tb = t - st + 0.25
    vis = b.get("vis")
    if vis == "duel":
        sc_duel(ctx, t + j * 3.1, 8.0, dict(colors=b["teams"], caption=""))
    elif vis == "trophy":
        champ_bg(ctx, tb + 1.0)
        trophy(ctx, W / 2, 380, 1.6 + 0.05 * tb, 1.0)
    elif vis == "track":
        background(ctx, t, rgb("#3a8dff"))
        key = 4242
        if key not in _tracks:
            _tracks[key] = make_track(4242, (240, 110, 1040, 640))
        pts, cum = _tracks[key]
        draw_track(ctx, pts, 1.0)
        for i in range(8):
            x, y, ang = track_pos(pts, cum, cum[-1] / 5 * tb - i * 30)
            ctx.arc(x, y, 8, 0, 2 * math.pi)
            fill(ctx, team_col(list(TEAMS)[i]))
    elif vis == "number":
        background(ctx, t, RED)
        k = int(tb / 0.55) % 2
        text(ctx, ["P3", "P7"][k], W / 2, 560, 420, [GREEN, RED][k], 0.25, "black", "c")
    elif vis == "lights":
        ctx.set_source_rgb(0.01, 0.01, 0.02)
        ctx.paint()
        for i in range(5):
            cx = 330 + i * 155
            on = tb < 1.6
            ctx.arc(cx, 300, 34, 0, 2 * math.pi)
            fill(ctx, (0.95, 0.05, 0.05) if on else (0.18, 0.04, 0.04))
    # caption is drawn by the overlay system (cap of each beat)

def sc_strip(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, sc["heading"], 120, 44)
    cards = sc["cards"]
    n = len(cards)
    gap = 24
    cw = (W - 160 - gap * (n - 1)) / n
    for i, (rnd_, gp, win, k) in enumerate(cards):
        st = lstart(sc, i, dur, n) if len(sc.get("_lines", [])) >= n else 0.5 + i * 0.6
        if sc.get("heading", "").startswith("Heartbreak"):
            st = lstart(sc, i + 1, dur, n + 2)
        if sc.get("card_lines"):
            st = lstart(sc, sc["card_lines"][i], dur, n)
        p = eo((t - st) / 0.6)
        if p <= 0:
            continue
        x = 80 + i * (cw + gap)
        y = 190 + 40 * (1 - p)
        rrect(ctx, x, y, cw, 420, 18)
        fill(ctx, CARD, 0.92 * p)
        rrect(ctx, x, y, cw, 8, 4)
        fill(ctx, team_col(k), p)
        text(ctx, f"ROUND {rnd_}", x + 24, y + 48, 16, RED, p, "black", track=2)
        text(ctx, gp.upper(), x + 24, y + 92, 30 if cw > 300 else 24, WHITE, p, "black")
        key = 5000 + rnd_
        if key not in _tracks:
            _tracks[key] = make_track(rnd_ * 31 + 7, (0, 0, 1, 1))
        pts, cum = _tracks[key]
        ctx.save()
        tw_ = min(cw - 60, 200)
        ctx.translate(x + cw / 2 - tw_ / 2, y + 120)
        ctx.scale(tw_, 150)
        ctx.move_to(*pts[0])
        for pt in pts[1:]:
            ctx.line_to(*pt)
        ctx.close_path()
        ctx.restore()
        ctx.set_line_width(5)
        ctx.set_source_rgba(1, 1, 1, 0.45 * p)
        ctx.stroke()
        text(ctx, "WINNER" if ":" not in win else "WHAT HAPPENED", x + 24, y + 330, 13, DIM, p, "semi", track=2)
        lines = wrap(ctx, win, "black", 24, cw - 48)
        for jj, ln in enumerate(lines[:2]):
            text(ctx, ln, x + 24, y + 362 + jj * 28, 24, team_col(k), p, "black")

def sc_rivalry(ctx, t, dur, sc):
    (na, ka, wa, pa), (nb, kb, wb, pb_) = sc["a"], sc["b"]
    ca, cb = team_col(ka), team_col(kb)
    if ka == kb:
        cb = tuple(min(1, c * 0.55 + 0.35) for c in cb)
    ctx.set_source_rgb(*BG0)
    ctx.paint()
    p = eio(t / 0.7)
    for side, col in ((0, ca), (1, cb)):
        ctx.save()
        if side == 0:
            para(ctx, lerp(-700, -100, p), 0, 760, H, 120)
        else:
            para(ctx, lerp(W + 100, 620, p), 0, 760, H, 120)
        g = cairo.LinearGradient(0, 0, W, H)
        g.add_color_stop_rgba(0, *col, 0.55 if side == 0 else 0.25)
        g.add_color_stop_rgba(1, *col, 0.25 if side == 0 else 0.55)
        ctx.set_source(g)
        ctx.fill()
        ctx.restore()
    hp = eo((t - 0.4) / 0.6)
    helmet(ctx, 330 - 80 * (1 - hp), 300, 120, ca, hp)
    ctx.save()
    ctx.translate(950 + 80 * (1 - hp), 300)
    ctx.scale(-1, 1)
    helmet(ctx, 0, 0, 120, cb, hp)
    ctx.restore()
    text(ctx, na.split()[-1].upper(), 330, 480, 56, WHITE, hp, "black", "c", track=1)
    text(ctx, na.split()[0], 330, 425, 24, GREY, hp, "semi", "c")
    text(ctx, nb.split()[-1].upper(), 950, 480, 56, WHITE, hp, "black", "c", track=1)
    text(ctx, nb.split()[0], 950, 425, 24, GREY, hp, "semi", "c")
    vp = clamp((t - 0.7) / 0.3)
    for st, d, _x, cap, _f in sc.get("_lines", []):
        if cap:
            vp *= 1 - clamp((t - st + 0.1) / 0.15) * clamp((st + d + 0.5 - t) / 0.15)
    if vp > 0:
        s_ = lerp(2.2, 1.0, eo(vp)) + 0.03 * math.sin(t * 5)
        ctx.save()
        ctx.translate(W / 2, 320)
        ctx.scale(s_, s_)
        big_caption(ctx, "VS", 0, 0, 400, 110, 1.0, vp, rot=-0.06)
        ctx.restore()
    text(ctx, sc["tag"], W / 2, 90, 26, WHITE, eo((t - 0.3) / 0.5), "black", "c", track=4)
    sp = eo((t - lstart(sc, 1, dur)) / 0.7)
    for i, (lab, va, vb, mx) in enumerate((("WINS", wa, wb, max(wa, wb, 1)), ("POINTS", pa, pb_, max(pa, pb_, 1)))):
        y = 545 + i * 62
        text(ctx, lab, W / 2, y + 22, 16, GREY, sp, "bold", "c", track=3)
        wl = 380 * va / mx * sp
        wr = 380 * vb / mx * sp
        rrect(ctx, W / 2 - 70 - wl, y, max(4, wl), 30, 8)
        fill(ctx, ca, sp)
        rrect(ctx, W / 2 + 70, y, max(4, wr), 30, 8)
        fill(ctx, cb, sp)
        text(ctx, str(int(round(va * sp))), W / 2 - 80 - wl - 8, y + 25, 26, WHITE, sp, "black", "r")
        text(ctx, str(int(round(vb * sp))), W / 2 + 80 + wr + 8, y + 25, 26, WHITE, sp, "black")

def sc_timeline(ctx, t, dur, sc):
    background(ctx, t, RED)
    heading(ctx, t, "The Monaco podium saga", 120, 44)
    steps = sc["steps"]
    l0, l1, l2 = lstart(sc, 0, dur, 4), lstart(sc, 1, dur, 4), lstart(sc, 2, dur, 4)
    d1 = sc["_lines"][1][1] if len(sc.get("_lines", [])) > 1 else 3
    times = [l0 + 1.5, l1 + 0.3, l1 + d1 * 0.55, l2 + 2.0]
    cur = -1
    for i, tt in enumerate(times):
        if t >= tt:
            cur = i
    # alpine car + driver
    helmet(ctx, 250, 330, 110, team_col("ALP"), eo((t - 0.3) / 0.6))
    text(ctx, "PIERRE GASLY", 250, 500, 30, WHITE, eo((t - 0.4) / 0.6), "black", "c", track=1)
    text(ctx, "ALPINE  ·  MONACO GP", 250, 535, 16, GREY, eo((t - 0.4) / 0.6), "semi", "c", track=2)
    if cur >= 0:
        lab, pos, col = steps[cur]
        flip = clamp((t - times[cur]) / 0.25)
        ctx.save()
        ctx.translate(780, 360)
        ctx.scale(1, max(0.05, eo(flip)))
        text(ctx, pos, 0, 90, 240, rgb(col), 1, "black", "c")
        ctx.restore()
        text(ctx, lab, 780, 520, 22, GREY, flip, "bold", "c", track=3)
    # timeline nodes
    x0, x1, y = 120, 1160, 600
    ctx.rectangle(x0, y - 2, x1 - x0, 4)
    fill(ctx, DIM)
    for i, (lab, pos, col) in enumerate(steps):
        x = lerp(x0, x1, i / (len(steps) - 1))
        on = i <= cur
        ctx.arc(x, y, 14 if on else 9, 0, 2 * math.pi)
        fill(ctx, rgb(col) if on else DIM)
        text(ctx, pos, x, y - 26, 20, rgb(col) if on else DIM, 1, "black", "c")
        text(ctx, lab, x, y + 40, 13, GREY if on else DIM, 1, "semi", "c", track=1)

def bez(p0, p1, p2, p3, u):
    a = (1 - u) ** 3
    b = 3 * (1 - u) ** 2 * u
    c = 3 * (1 - u) * u ** 2
    d = u ** 3
    x = a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0]
    y = a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
    dx = 3 * (1 - u) ** 2 * (p1[0] - p0[0]) + 6 * (1 - u) * u * (p2[0] - p1[0]) + 3 * u ** 2 * (p3[0] - p2[0])
    dy = 3 * (1 - u) ** 2 * (p1[1] - p0[1]) + 6 * (1 - u) * u * (p2[1] - p1[1]) + 3 * u ** 2 * (p3[1] - p2[1])
    return x, y, math.atan2(dy, dx)

CURVE = ((-100, 640), (520, 700), (760, 430), (700, -80))

def sc_incident(ctx, t, dur, sc):
    # grass
    ctx.set_source_rgb(0.05, 0.13, 0.08)
    ctx.paint()
    rnd = random.Random(3)
    ctx.set_source_rgba(1, 1, 1, 0.02)
    for i in range(300):
        ctx.rectangle(rnd.uniform(0, W), rnd.uniform(0, H), 3, 3)
    ctx.fill()
    # gravel trap outside the corner
    ctx.move_to(560, 760)
    ctx.curve_to(980, 760, 1180, 420, 1060, -20)
    ctx.line_to(760, -20)
    ctx.curve_to(820, 380, 680, 640, 560, 760)
    ctx.close_path()
    ctx.set_source_rgb(0.42, 0.37, 0.27)
    ctx.fill()
    ctx.set_source_rgba(0, 0, 0, 0.12)
    for i in range(500):
        ctx.rectangle(rnd.uniform(600, 1120), rnd.uniform(0, H), 2, 2)
    ctx.fill()
    # barrier
    ctx.move_to(600, 800)
    ctx.curve_to(1060, 800, 1250, 420, 1110, -40)
    ctx.set_line_width(16)
    ctx.set_source_rgb(0.12, 0.12, 0.14)
    ctx.stroke()
    ctx.move_to(600, 800)
    ctx.curve_to(1060, 800, 1250, 420, 1110, -40)
    ctx.set_line_width(8)
    ctx.set_dash([18, 18], (t * 0) % 36)
    ctx.set_source_rgb(0.9, 0.1, 0.1)
    ctx.stroke()
    ctx.set_dash([])
    # track
    pts = [bez(*CURVE, u / 200) for u in range(201)]
    for wdt, col in ((190, (0.9, 0.9, 0.95)), (176, (0.17, 0.17, 0.2))):
        ctx.move_to(pts[0][0], pts[0][1])
        for x, y, _ in pts[1:]:
            ctx.line_to(x, y)
        ctx.set_line_width(wdt)
        ctx.set_source_rgb(*col)
        ctx.stroke()
    # kerb on outside edge
    for i in range(40, 170, 4):
        x, y, a = pts[i]
        nx, ny = -math.sin(a), math.cos(a)
        ctx.save()
        ctx.translate(x - nx * -92, y - ny * -92)
        ctx.rotate(a)
        ctx.rectangle(-9, -6, 18, 12)
        ctx.set_source_rgb(*(RED if (i // 4) % 2 else WHITE))
        ctx.fill()
        ctx.restore()
    tc = max(3.0, dur * 0.33)
    kind = sc["kind"]
    v = 0.17
    flag = sc.get("flag")
    slow = 0.45 if flag in ("sc", "yellow") else (0.0 if flag == "red" else 1.0)

    def upos(t_spawn):
        # progress along the corner, slowing after the incident under flags
        if t < tc:
            return (t - t_spawn) * v
        return (tc - t_spawn) * v + (t - tc) * v * (slow if flag != "red" else max(0.0, 1 - (t - tc) / 1.5))

    def place(u, lane):
        x, y, a = bez(*CURVE, clamp(u, 0, 1))
        nx, ny = -math.sin(a), math.cos(a)
        x += nx * lane
        y += ny * lane
        if u > 1:
            x += math.cos(a) * (u - 1) * 800
            y += math.sin(a) * (u - 1) * 800
        return x, y, a

    # background traffic
    rnd2 = random.Random(sc["where"])
    keys = [k for k in TEAMS]
    for q in range(14):
        ts = -2.5 + q * 1.6 + rnd2.uniform(-0.3, 0.3)
        if abs(ts - (tc - 0.55 / v)) < 1.0:
            continue
        u = upos(ts)
        if -0.05 < u < 1.3:
            x, y, a = place(u, rnd2.uniform(-40, 40))
            topcar(ctx, x, y, a, team_col(keys[q % len(keys)]), 2.0)
    # the incident cars
    cars = [(sc["car"], 0.0, 0)]
    if kind in ("contact", "multi"):
        cars.append((sc.get("car2", sc["car"]), -0.015, 50))
    if kind == "multi":
        cars.append((sc.get("car3", sc["car"]), -0.07, -35))
    ts0 = tc - 0.55 / v
    for idx, (k, du, lane) in enumerate(cars):
        crash = (kind == "solo" and idx == 0) or (kind != "solo" and idx >= 1)
        if t < tc or not crash:
            u = upos(ts0) + du
            x, y, a = place(u, lane)
            if t >= tc and idx == 0 and kind != "solo":
                a += 0.12 * math.sin((t - tc) * 14) * math.exp(-(t - tc) * 2)
            if u > -0.05:
                topcar(ctx, x, y, a, team_col(k), 2.0)
        else:
            x0, y0, a0 = place(0.55 + du, lane)
            nx, ny = -math.sin(a0), math.cos(a0)
            tau = t - tc
            vel, dec = 420, 300
            tt = min(tau, vel / dec)
            dist = vel * tt - 0.5 * dec * tt * tt
            dx, dy = math.cos(a0) * 0.55 + nx * 0.85, math.sin(a0) * 0.55 + ny * 0.85
            x, y = x0 + dx * dist, y0 + dy * dist
            spin = (2.6 + idx * 0.8) * (1 - math.exp(-tau * 2.0))
            topcar(ctx, x, y, a0 + spin, team_col(k), 2.0)
            if tau < 2.5:
                pr = random.Random(int(t * 20) + idx)
                for q in range(22):
                    ang = pr.uniform(0, 2 * math.pi)
                    rr = pr.uniform(10, 70) * (1 + tau)
                    ctx.arc(x + math.cos(ang) * rr, y + math.sin(ang) * rr, pr.uniform(3, 8), 0, 2 * math.pi)
                    fill(ctx, (0.75, 0.66, 0.5), 0.45 * (1 - tau / 2.5))
            if tau < 0.5:
                pr = random.Random(int(t * 40))
                for q in range(16):
                    ang = pr.uniform(0, 2 * math.pi)
                    ctx.move_to(x, y)
                    ctx.line_to(x + math.cos(ang) * pr.uniform(20, 80), y + math.sin(ang) * pr.uniform(20, 80))
                    ctx.set_line_width(2.5)
                    ctx.set_source_rgba(1, 0.85, 0.3, 1 - tau * 2)
                    ctx.stroke()
    # labels
    p = eo((t - 0.2) / 0.5)
    rrect(ctx, 40, 40, 560, 120, 16)
    fill(ctx, (0, 0, 0), 0.6 * p)
    rrect(ctx, 40, 40, 8, 120, 4)
    fill(ctx, RED, p)
    text(ctx, sc["where"], 70, 88, 26, WHITE, p, "black", track=2)
    text(ctx, sc["who"], 70, 130, 24, GREY, p, "semi")
    fl = sc.get("flag")
    pf = eo((t - tc - 0.6) / 0.4)
    if fl and fl != "none" and pf > 0:
        col, lab = {"red": (RED, "RED FLAG"), "yellow": (YEL, "YELLOW FLAG"), "sc": (YEL, "SAFETY CAR")}[fl]
        blink = 1 if int(t * 3) % 2 == 0 else 0.7
        rrect(ctx, W - 340, 40, 300, 90, 14)
        fill(ctx, (0, 0, 0), 0.65 * pf)
        rrect(ctx, W - 320, 58, 70, 54, 6)
        fill(ctx, col, pf * blink)
        text(ctx, lab, W - 230, 95, 24, col, pf, "black", track=2)
    text(ctx, "ILLUSTRATIVE ANIMATION", W - 40, H - 22, 12, (1, 1, 1), 0.4, "semi", "r", track=1.5)

def sc_meme(ctx, t, dur, sc):
    tc = team_col(sc["team"])
    background(ctx, t, tc)
    heading(ctx, t, sc["heading"], 120, 44)
    p = eo((t - 0.6) / 0.8)
    wob = math.sin(t * 2) * 0.02
    ctx.save()
    ctx.translate(380, 420)
    ctx.rotate(wob)
    text(ctx, sc["big"], 0, 120, 380, tc, p, "black", "c")
    ctx.restore()
    text(ctx, sc["unit"], 380, 600, 30, GREY, p, "black", "c", track=6)
    text(ctx, TEAMS[sc["team"]][0].upper(), 880, 300, 46, WHITE, p, "black", "c", track=2)
    # sad slow car
    x = 640 + (t * 25) % 500
    draw_car(ctx, x, 520, 2.6, tc, WHITE, rot=t * 2)
    if int(t * 2) % 2 == 0:
        text(ctx, "...", x + 280, 470, 40, GREY, p, "black")

def sc_profile(ctx, t, dur, sc):
    tc = team_col(sc["team"])
    background(ctx, t, tc)
    p = eio(t / 0.7)
    para(ctx, lerp(-600, -80, p), 0, 620, H, 100)
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgba(0, *tc, 0.75)
    g.add_color_stop_rgba(1, *tc, 0.25)
    ctx.set_source(g)
    ctx.fill()
    hp = eo((t - 0.3) / 0.6)
    if sc.get("is_team"):
        draw_car(ctx, 30 + 60 * (1 - hp), 430, 4.6, tc, WHITE, rot=t * 3)
    else:
        helmet(ctx, 270, 330, 150 * (0.8 + 0.2 * hp), tc, hp)
    X = 600
    np_ = eo((t - 0.4) / 0.6)
    text(ctx, ("TEAM" if sc.get("is_team") else TEAMS[sc["team"]][0].upper()), X, 160, 20, tc, np_, "black", track=4)
    nm = sc["name"].upper()
    sz = 76 if len(nm) < 14 else 62
    text(ctx, nm, X + 30 * (1 - np_), 240, sz, WHITE, np_, "black", track=1)
    for i, (big, small) in enumerate(sc["stats"]):
        pf = eo((t - 0.9 - i * 0.35) / 0.5)
        x = X + i * 210
        rrect(ctx, x, 290 + 20 * (1 - pf), 195, 120, 14)
        fill(ctx, CARD, 0.9 * pf)
        text(ctx, big, x + 18, 352 + 20 * (1 - pf), 40 if len(big) < 5 else 30, tc, pf, "black")
        lines = wrap(ctx, small.upper(), "semi", 13, 170)
        for j, ln in enumerate(lines[:2]):
            text(ctx, ln, x + 18, 380 + j * 17 + 20 * (1 - pf), 13, GREY, pf, "semi", track=1.5)
    # rating
    rp = eo((t - lstart(sc, len(sc.get("_lines", [1])) - 1, dur) - 0.3) / 0.6)
    if rp > 0:
        text(ctx, "OUR RATING", X, 480, 16, GREY, rp, "semi", track=3)
        r = sc["rating"]
        try:
            val = float(r)
        except ValueError:
            val = None
        rrect(ctx, X, 500, 600, 26, 13)
        fill(ctx, (1, 1, 1), 0.08 * rp)
        if val is not None:
            rrect(ctx, X, 500, 600 * val / 10 * rp, 26, 13)
            fill(ctx, tc, rp)
            text(ctx, f"{r}/10", X + 610, 600, 64, WHITE, rp, "black", "r")
        else:
            text(ctx, "?/10", X + 610, 600, 64, WHITE, rp, "black", "r")

# ======================================================= overlay + driver
RENDERERS = {k[3:]: v for k, v in list(globals().items()) if k.startswith("sc_")}

def punch_times(sc):
    out = []
    for st, d, txt, cap, fx in sc.get("_lines", []):
        if cap and fx:
            out.append(st)
    if sc["type"] == "hype":
        out = [L[0] - 0.25 for L in sc["_lines"]]
    return out

class Composer:
    def __init__(self):
        self.OW, self.OH = int(W * SS), int(H * SS)
        self.sb = cairo.ImageSurface(cairo.FORMAT_RGB24, self.OW, self.OH)
        self.cb = cairo.Context(self.sb)
        self.so = cairo.ImageSurface(cairo.FORMAT_RGB24, self.OW, self.OH)
        self.co = cairo.Context(self.so)

    def frame(self, sc, t, dur, g0, total):
        import numpy as np
        OW, OH, cb, co, sb, so = self.OW, self.OH, self.cb, self.co, self.sb, self.so
        fn = RENDERERS[sc["type"]]
        hype = sc["type"] == "hype"
        cb.save()
        cb.scale(SS, SS)
        fn(cb, t, dur, sc)
        cb.restore()
        sb.flush()
        z, sx, sy, fl, rgbs = 1.0, 0.0, 0.0, 0.0, 0.0
        for pt in punch_times(sc):
            dt = t - pt
            if 0 <= dt < 0.8:
                e = math.exp(-dt * 7)
                z = max(z, 1 + 0.08 * e)
                rr = random.Random(int(t * FPS))
                sx += rr.uniform(-1, 1) * 14 * e
                sy += rr.uniform(-1, 1) * 14 * e
                fl = max(fl, 0.6 * math.exp(-dt * 12))
                rgbs = max(rgbs, 10 * math.exp(-dt * 9))
        co.save()
        co.translate(OW / 2 + sx, OH / 2 + sy)
        co.scale(z, z)
        co.translate(-OW / 2, -OH / 2)
        co.set_source_surface(sb, 0, 0)
        co.paint()
        co.restore()
        co.save()
        co.scale(SS, SS)
        for st, d, txt, cap, fx in sc.get("_lines", []):
            if cap and st - 0.05 <= t <= st + d + 0.35:
                p = t - st
                a = clamp(p / 0.08) * clamp((st + d + 0.35 - t) / 0.2)
                if not hype:
                    co.rectangle(0, 0, W, H)
                    co.set_source_rgba(0, 0, 0, 0.5 * a)
                    co.fill()
                wig = 0.015 * math.sin(t * 9)
                big_caption(co, cap, W / 2, H / 2 + (20 if hype else 0), W - 160, 130 if hype else 112, p, a, rot=-0.045 + wig)
        if sc["type"] not in ("lights", "duel", "credits", "hype", "incident", "rivalry"):
            chrome(co, sc, t, g0 + t, total)
        if sc["type"] != "credits":
            transition(co, t, dur, first=(sc["type"] == "lights"))
        if fl > 0.01:
            co.rectangle(0, 0, W, H)
            co.set_source_rgba(1, 1, 1, fl)
            co.fill()
        co.restore()
        so.flush()
        if rgbs > 1.0:
            arr = np.ndarray((OH, OW, 4), np.uint8, so.get_data())
            k = int(rgbs)
            arr[:, k:, 2] = arr[:, :-k, 2].copy()
            arr[:, :-k, 0] = arr[:, k:, 0].copy()
            so.mark_dirty()
        return so


def render_scene(sc, dur, path, g0, total):
    comp = Composer()
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr0",
                           "-s", f"{comp.OW}x{comp.OH}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "20", "-pix_fmt", "yuv420p", "-threads", "2", path], stdin=subprocess.PIPE)
    for i in range(int(round(dur * FPS))):
        ff.stdin.write(comp.frame(sc, i / FPS, dur, g0, total).get_data())
    ff.stdin.close()
    ff.wait()
    return path
