"""YouTube thumbnail (1280x720)."""
import sys, math, cairo
import render as R

out = sys.argv[1]
s = cairo.ImageSurface(cairo.FORMAT_RGB24, 1280, 720)
c = cairo.Context(s)
R.SS = 1.0
R._bg_cache.clear()
_tro = R.trophy
R.trophy = lambda *a, **k: None
R.champ_bg(c, 3.0)
R.trophy = _tro
c.set_source_rgba(0, 0, 0, 0.25)
c.paint()
R.trophy(c, 1010, 400, 1.75, 1.0)
R.helmet(c, 300, 430, 210, R.team_col("MER"))
R.big_caption(c, "20 YEARS OLD", 470, 120, 900, 110, 1.0, rot=-0.05)
R.big_caption(c, "CHAMPION?!", 520, 610, 900, 150, 1.0, rot=-0.05, col=R.YEL, col2=R.YEL)
R.rrect(c, 40, 32, 300, 54, 10)
R.fill(c, R.RED)
R.text(c, "F1 2026 REVIEW", 190, 69, 30, R.WHITE, 1, "black", "c", track=1)
s.write_to_png(out)
