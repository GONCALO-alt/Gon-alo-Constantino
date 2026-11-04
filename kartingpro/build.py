#!/usr/bin/env python3
"""Junta index.html + src/ num único ficheiro HTML.

Uso:
  python3 build.py                 -> dist/karting-pro.html (ficheiro único, abre em qualquer browser)
  python3 build.py --artifact OUT  -> versão sem <html>/<head>/<body> para publicar como página Claude
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def inline(html: str) -> str:
    def css(m):
        return "<style>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "</style>"

    def js(m):
        code = (ROOT / m.group(1)).read_text(encoding="utf-8")
        return "<script>\n" + code.replace("</script", "<\\/script") + "</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)" data-inline>', css, html)
    html = re.sub(r'<script src="([^"]+)" data-inline></script>', js, html)
    return html


def artifact(html: str) -> str:
    html = re.sub(r"<!--REPO-ONLY-START-->.*?<!--REPO-ONLY-END-->\n", "", html, flags=re.S)
    for tag in ["<!doctype html>\n", '<html lang="pt">\n', "<head>\n", '<meta charset="utf-8">\n',
                "</head>\n", "<body>\n", "</body>\n", "</html>\n"]:
        html = html.replace(tag, "", 1)
    return re.sub(r'<meta name="viewport"[^>]*>\n', "", html)


def main():
    html = inline((ROOT / "index.html").read_text(encoding="utf-8"))
    if len(sys.argv) > 2 and sys.argv[1] == "--artifact":
        out = Path(sys.argv[2])
        out.write_text(artifact(html), encoding="utf-8")
    else:
        out = ROOT / "dist" / "karting-pro.html"
        out.parent.mkdir(exist_ok=True)
        # o ficheiro único não tem o manifesto (os ícones ficam ao lado do index.html)
        out.write_text(re.sub(r"<!--REPO-ONLY-START-->.*?<!--REPO-ONLY-END-->\n", "", html, flags=re.S), encoding="utf-8")
    print(f"{out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
