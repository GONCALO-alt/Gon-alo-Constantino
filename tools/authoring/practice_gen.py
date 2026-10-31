"""
Gera uma LIÇÃO DE PRÁTICA a seguir a cada lição escrita: antes de aparecerem palavras novas,
o aluno treina só as palavras e as frases da lição que acabou de fazer (e um pouco da anterior).

  - Nada de novo: todas as palavras mostradas (incluindo as opções erradas) já foram ensinadas.
  - Exercícios novos (não copiados) com os materiais da lição: associar, traduzir, artigos,
    ditado, ordenar, construir e completar frases.
  - A lição de prática fica na posição «ordem + 0,5» (ex.: a lição 3 é seguida da prática 3,5),
    por isso as lições escritas e o progresso dos alunos não mudam.
  - Determinístico (semente = ID da lição) e idempotente: correr outra vez substitui as práticas.

Uso:  python3 tools/authoring/practice_gen.py            # todas as unidades
      python3 tools/authoring/practice_gen.py s1-u01     # uma unidade
Correr depois de escrever ou alterar lições (e depois de review_gen.py).
"""
import glob, json, os, random, re, sys

sys.path.insert(0, os.path.dirname(__file__))
from review_gen import Gen, clean, is_generated, norm, pick_distinct, simple_sentence  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TAG = "tools/authoring/practice_gen.py"
PROV = {"source": "ai", "generator": f"prática gerada automaticamente a partir da lição anterior ({TAG})", "createdAt": "2026-10-31"}
ID_BASE = 500  # IDs das práticas: l501, l502, … (as lições escritas usam números baixos)


def is_practice(l):
    return TAG in (l.get("provenance") or {}).get("generator", "")


def unit_key(uid):
    s, u = uid.split("-")
    return (int(s[1:]), int(u[1:]))


class Practice(Gen):
    """Gerador limitado a uma janela: a lição acabada de fazer (+ a anterior para distratores)."""

    def __init__(self, lesson, window_vocab, known_vocab, sentences_src, review_ids):
        self.unit = lesson["unitId"]
        self.rng = random.Random(lesson["id"])
        self.cefr = lesson["cefr"]
        self.diff = lesson["difficulty"]
        # Palavras com variantes escritas «a|b» (ex.: «wilde|wou») não servem para opções nem enunciados.
        ok = lambda v: "|" not in v["nl"]
        self.vocab = [v for v in window_vocab if ok(v)]   # palavras a treinar
        self.known = [v for v in known_vocab if ok(v)]    # tudo o que já foi ensinado (distratores)
        self.review_ids = review_ids
        seen, self.examples = set(), []
        for nl, pt in sentences_src:
            if norm(nl) in seen or not pt: continue
            seen.add(norm(nl)); self.examples.append((nl, pt))
        # Sem abreviaturas com pontos (z.s.m., i.v.m.): partem-se mal em peças.
        self.sentences = [e for e in self.examples if simple_sentence(e[0]) and not re.search(r"\w\.\w", e[0])]
        self.nouns = [v for v in self.vocab if v.get("article") in ("de", "het") and " " not in clean(v["nl"])]
        self.used = {}

    def others(self, v):
        mine = {norm(clean(p)) for p in v["pt"]} - {""}
        out = []
        for w in self.known[-200:]:
            if w is v or norm(clean(w["nl"])) == norm(clean(v["nl"])): continue
            if ({norm(clean(p)) for p in w["pt"]} & mine): continue
            out.append(w)
        # Distratores da mesma família (palavras recentes) primeiro.
        return out[-60:]

    def vrefs(self, *nls):
        ids = []
        for v in self.known[-300:]:
            if any(re.search(r"(?<!\w)" + re.escape(norm(clean(v["nl"]))) + r"(?!\w)", norm(t)) for t in nls if t) and v["id"] not in ids:
                ids.append(v["id"])
        return ids[-4:]

    def fill(self, nl, pt):
        """Completar a frase. As opções erradas são de outra classe de palavra (nome, verbo, …),
        para que só uma opção faça sentido na frase."""
        words = [v for v in self.known[-120:] if " " not in clean(v["nl"])]
        toks = nl.split()
        for v in self.rng.sample(words, len(words)):
            hits = [i for i, t in enumerate(toks) if norm(t) == norm(clean(v["nl"]))]
            if len(hits) != 1: continue
            i = hits[0]
            word = re.sub(r"[.,!?;:]+$", "", toks[i])
            tail = toks[i][len(word):]
            pool = [clean(w["nl"]) for w in self.others(v) if " " not in clean(w["nl"]) and w.get("pos") != v.get("pos")]
            wrong = pick_distinct(pool, 2, [word], self.rng)
            if len(wrong) < 2: continue
            if word[:1].isupper():
                wrong = [w[:1].upper() + w[1:] for w in wrong]
            choices = [word] + wrong
            self.rng.shuffle(choices)
            sentence = " ".join(toks[:i] + ["___" + tail] + toks[i + 1:])
            return {"type": "fillBlank", "instruction": "Escolha a palavra que falta.", "sentence": sentence, "translation": pt,
                    "answers": [word], "choices": choices, "explanation": f"{nl}", "vocabRefs": [v["id"]]}
        return None


def sentences_of(l):
    out = [(e["nl"], e["pt"]) for e in l["examples"]]
    for g in l.get("grammar", []):
        out += [(e["nl"], re.sub(r"\s*\(.*\)\s*$", "", e["pt"])) for e in g.get("examples", [])]
    return out


def practice_for(lesson, prev, known, num):
    window = list(lesson["newVocabulary"])
    # Poucas palavras novas (lição de gramática): junta as palavras que a lição usa e as da lição anterior.
    ids = {v["id"] for v in window}
    by_id = {v["id"]: v for v in known}
    for r in lesson.get("reviewVocabulary", []) + [r for e in lesson["exercises"] for r in e.get("vocabRefs", [])]:
        if len(window) >= 6: break
        if r in by_id and r not in ids:
            window.append(by_id[r]); ids.add(r)
    if prev:
        for v in prev["newVocabulary"]:
            if len(window) >= 6: break
            if v["id"] not in ids:
                window.append(v); ids.add(v["id"])
    sents = sentences_of(lesson)
    if prev and len([s for s in sents if simple_sentence(s[0])]) < 3:
        sents += sentences_of(prev)
    review_ids = list(dict.fromkeys([v["id"] for v in window]))
    g = Practice(lesson, window, known, sents, review_ids)
    if len(g.vocab) < 2 and len(g.sentences) < 2:
        return None

    recipe = []
    if len(g.vocab) >= 3: recipe.append(("match", 1))
    recipe += [("mc_nl_pt", 2), ("listen", 2), ("mc_pt_nl", 2), ("fill", 1), ("article", 1),
               ("word_order", 1), ("build", 1), ("mc_sentence", 1)]
    exs, seen = [], set()
    for e in g.top_up(g.build_lesson(recipe), target=8):
        key = (e["type"], norm(e.get("audioText") or e.get("prompt") or e.get("sentence") or e.get("noun") or " ".join(e.get("tokens", [])) or json.dumps(e.get("pairs"))))
        if key in seen: continue
        seen.add(key); exs.append(e)
    exs = exs[:10]
    if len(exs) < 6 or len({e["type"] for e in exs}) < 3:
        return None

    lid = f"{lesson['unitId']}-l{ID_BASE + num:03d}"
    exercises = []
    for i, e in enumerate(exs, 1):
        e["vocabRefs"] = [r for r in e["vocabRefs"] if r]
        exercises.append({"id": f"{lid}-e{i:02d}", **e})
    examples = [{"nl": nl, "pt": pt} for nl, pt in g.examples[:3]] or lesson["examples"][:3]
    title = re.sub(r"^(Prática|Revisão):\s*", "", lesson["title"])
    return {
        "id": lid, "unitId": lesson["unitId"], "order": lesson["order"] + 0.5,
        "title": f"Prática: {title}",
        "description": "Treine só o que aprendeu na lição anterior, sem palavras novas.",
        "cefr": lesson["cefr"],
        "objectives": [f"Consolidar a lição «{title}» antes de avançar"],
        "newVocabulary": [], "reviewVocabulary": review_ids,
        "examples": examples, "grammar": [], "exercises": exercises,
        "difficulty": lesson["difficulty"], "estimatedMinutes": 4,
        "status": "published", "version": 1, "provenance": PROV,
    }


def main():
    only = set(sys.argv[1:])
    files = sorted(glob.glob(os.path.join(ROOT, "content", "lessons", "*.json")),
                   key=lambda p: unit_key(os.path.basename(p)[:-5]))
    known = []  # vocabulário já ensinado, pela ordem do curso
    total = 0
    for path in files:
        data = json.load(open(path, encoding="utf-8"))
        uid = data["unitId"]
        base = sorted([l for l in data["lessons"] if not is_practice(l)], key=lambda l: l["order"])
        out, prev, num = [], None, 0
        for l in base:
            out.append(l)
            known.extend(l["newVocabulary"])
            if is_generated(l) or l["status"] != "published":
                continue
            num += 1
            if not only or uid in only:
                p = practice_for(l, prev, known, num)
                if p: out.append(p)
            prev = l
        if only and uid not in only:
            continue
        added = sum(1 for l in out if is_practice(l))
        total += added
        data["lessons"] = out
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
        print(f"{uid}: +{added} práticas", file=sys.stderr)
    print(f"Total: {total} lições de prática", file=sys.stderr)


if __name__ == "__main__":
    main()
