"""
Ritmo de palavras novas: nenhuma lição apresenta mais de 3 palavras novas de uma vez.

Antes de cada lição escrita com 4 ou mais palavras novas, cria mini-lições «Palavras novas»
com 2–3 palavras cada. Em cada mini-lição, cada palavra aparece várias vezes (significado,
ouvir e escrever, dizer em neerlandês, associar, artigo) e as palavras da mini-lição
anterior voltam a aparecer. Depois vem a lição original (agora só com palavras conhecidas),
e a seguir a sua prática — ou seja, cada palavra é treinada muitas vezes antes de avançar.

  - Nada de palavras por ensinar: opções erradas e frases só usam palavras já ensinadas.
  - A lição original mantém o ID, os exercícios e o progresso; as palavras novas passam
    para as mini-lições (que ficam logo antes dela: ordem − 0,45, − 0,37, …).
  - IDs das mini-lições: l601, l602, … por unidade de autoria.
  - Determinístico e idempotente: correr outra vez devolve as palavras às lições originais
    e gera tudo de novo.

Uso:  python3 tools/authoring/pacing_gen.py
Correr depois de review_gen.py e practice_gen.py.
"""
import glob, json, math, os, random, re, sys

sys.path.insert(0, os.path.dirname(__file__))
from review_gen import clean, first_pt, is_generated, norm, simple_sentence  # noqa: E402
from practice_gen import Practice, is_practice, sentences_of, unit_key  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TAG = "tools/authoring/pacing_gen.py"
ID_BASE = 600
MAX_NEW = 3       # palavras novas por mini-lição
MIN_TO_SPLIT = 4  # a partir de quantas palavras novas uma lição é dividida


def is_pacing(l):
    return TAG in (l.get("provenance") or {}).get("generator", "")


def target_of(l):
    m = re.search(r"antes de (s\d-u\d+-l\d{3})", (l.get("provenance") or {}).get("generator", ""))
    return m.group(1) if m else None


def chunks_of(words):
    n = math.ceil(len(words) / MAX_NEW)
    if len(words) >= MIN_TO_SPLIT:
        n = max(n, 2)
    size, extra = divmod(len(words), n)
    out, i = [], 0
    for j in range(n):
        k = size + (1 if j < extra else 0)
        out.append(words[i:i + k]); i += k
    return out


def head(v):
    nl = clean(v["nl"])
    return f"{v['article']} {nl}" if v.get("article") in ("de", "het") and " " not in nl else nl


def restore(lessons):
    """Devolve as palavras das mini-lições às lições originais e tira as mini-lições."""
    by_id = {l["id"]: l for l in lessons}
    paced = sorted([l for l in lessons if is_pacing(l)], key=lambda l: l["order"])
    for p in paced:
        t = by_id.get(target_of(p))
        if not t: continue
        t.setdefault("_restored", []).extend(p["newVocabulary"])
    for l in lessons:
        words = l.pop("_restored", None)
        if words:
            ids = {v["id"] for v in words}
            l["newVocabulary"] = words + l["newVocabulary"]
            l["reviewVocabulary"] = [r for r in l.get("reviewVocabulary", []) if r not in ids]
    return [l for l in lessons if not is_pacing(l)]


def mini_lesson(lesson, chunk, before, known, num, part, parts, order):
    window = list(before[-3:]) + list(chunk)
    sents_src = sentences_of(lesson)
    g = Practice(lesson, window, known, sents_src, [v["id"] for v in window])
    g.rng = random.Random(f"{lesson['id']}-{part}")
    # Frases: só as que usam palavras já ensinadas (todas as palavras da frase conhecidas).
    forms = set()
    for v in known:
        for alt in clean(v["nl"]).split("|"):
            forms |= set(norm(alt).split())
        if v.get("article"): forms.add(v["article"])
    ok_sent = lambda s: all(t in forms for t in norm(s).split())
    sents = [(nl, pt) for nl, pt in g.examples if simple_sentence(nl) and ok_sent(nl) and not re.search(r"\w\.\w", nl)]
    sents = [s for s in sents if any(norm(clean(v["nl"])) in norm(s[0]) for v in chunk)]

    words = [v for v in chunk if "|" not in v["nl"] and first_pt(v)]
    exs = []
    add = lambda e: e and exs.append(e)
    for v in words: add(g.mc_nl_pt(v))                                   # 1. reconhecer o significado
    for v in words: add(g.listen(head(v), first_pt(v)))                  # 2. ouvir e escrever
    recent = [w for w in known[:-len(chunk) or None][-12:] if "|" not in w["nl"]]
    add(g.match(words + list(reversed(recent))[:max(0, 5 - len(words))]))  # 3. associar (com palavras já sabidas)
    for v in words: add(g.mc_pt_nl(v))                                   # 4. dizer em neerlandês
    for v in words:
        if v.get("article") in ("de", "het") and " " not in clean(v["nl"]): add(g.article(v))
    for v in [w for w in before[-2:] if "|" not in w["nl"]]: add(g.mc_pt_nl(v))  # 5. voltar à mini-lição anterior
    for nl, pt in sents[:2]:                                             # 6. frases curtas
        add(g.listen(nl, pt) if len(exs) % 2 else g.word_order(nl, pt) or g.listen(nl, pt))
    if len(words) + len(before) >= 3:                                     # 7. fecho: associar outra vez
        add(g.match(words + [w for w in reversed(before) if "|" not in w["nl"]][:3]))
    seen, uniq = set(), []
    for e in exs:
        text = e.get("audioText") or e.get("prompt") or e.get("noun") or " ".join(e.get("tokens", []))
        if e["type"] == "match": text = " ".join(sorted(p["nl"] for p in e["pairs"]))
        key = (e["type"] if e["type"] != "listening" else "x", norm(text))
        if key in seen: continue
        seen.add(key); uniq.append(e)
    exs = uniq[:14]
    if len(exs) < 4:
        return None

    lid = f"{lesson['unitId']}-l{ID_BASE + num:03d}"
    exercises = []
    for i, e in enumerate(exs, 1):
        e["vocabRefs"] = [r for r in e.get("vocabRefs", []) if r]
        exercises.append({"id": f"{lid}-e{i:02d}", **e})
    title = re.sub(r"^(Prática|Revisão):\s*", "", lesson["title"])
    names = ", ".join(clean(v["nl"]).split("|")[0] for v in chunk)
    return {
        "id": lid, "unitId": lesson["unitId"], "order": order,
        "title": f"Palavras novas: {names}",
        "description": f"Aprenda {len(chunk)} palavras novas de «{title}», com calma e muita repetição ({part}/{parts}).",
        "cefr": lesson["cefr"],
        "objectives": [f"Aprender e repetir: {names}"],
        "newVocabulary": chunk,
        "reviewVocabulary": [v["id"] for v in before[-3:]],
        "examples": [{"nl": head(v), "pt": ", ".join(v["pt"][:2])} for v in chunk],
        "grammar": [], "exercises": exercises,
        "difficulty": max(1, lesson["difficulty"] - 1), "estimatedMinutes": 4,
        "status": "published", "version": 1,
        "provenance": {"source": "ai", "generator": f"mini-lição de palavras novas antes de {lesson['id']} ({TAG})", "createdAt": "2026-11-11"},
    }


def main():
    files = sorted(glob.glob(os.path.join(ROOT, "content", "lessons", "*.json")), key=lambda p: unit_key(os.path.basename(p)[:-5]))
    known, total, split = [], 0, 0
    for path in files:
        data = json.load(open(path, encoding="utf-8"))
        lessons = sorted(restore(data["lessons"]), key=lambda l: l["order"])
        out, num = [], 0
        for l in lessons:
            words = l["newVocabulary"]
            eligible = (len(words) >= MIN_TO_SPLIT and l["status"] == "published"
                        and not is_practice(l) and not is_generated(l))
            if eligible:
                made, before, num0 = [], [], num
                parts = chunks_of(words)
                for j, chunk in enumerate(parts):
                    m = mini_lesson(l, chunk, before, known + before + chunk, num + 1, j + 1, len(parts), round(l["order"] - 0.45 + j * 0.08, 2))
                    if not m:
                        made = None; break
                    num += 1; made.append(m); before += chunk
                if made:
                    out += made
                    l["reviewVocabulary"] = list(dict.fromkeys([v["id"] for v in words] + l.get("reviewVocabulary", [])))
                    l["newVocabulary"] = []
                    split += 1; total += len(made)
                else:
                    num = num0
            out.append(l)
            known.extend(words)
        data["lessons"] = sorted(out, key=lambda l: l["order"])
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
        if num: print(f"{data['unitId']}: +{num} mini-lições", file=sys.stderr)
    print(f"Total: {split} lições divididas, {total} mini-lições", file=sys.stderr)


if __name__ == "__main__":
    main()
