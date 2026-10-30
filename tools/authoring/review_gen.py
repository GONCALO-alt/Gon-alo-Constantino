"""
Gera lições de REVISÃO e PRÁTICA para cada unidade, a partir do vocabulário e das frases
das lições de núcleo (ordens 1–5) da mesma unidade.

Não copia exercícios: cria exercícios novos (escolha múltipla, artigos, associação,
ditado, ordenar palavras, construir frases, completar) com os mesmos materiais,
para praticar o que já foi apresentado. Determinístico (semente = ID da unidade).

Uso:  python3 tools/authoring/review_gen.py            # todas as unidades
      python3 tools/authoring/review_gen.py s1-u01     # uma unidade
As lições geradas vêm depois das existentes (4 por unidade, 5 na Secção 1). As lições escritas à mão
nunca são alteradas; as geradas (marcadas na proveniência) são substituídas se o script correr de novo.
"""
import json, os, random, re, sys, glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PROV = {"source": "ai", "generator": "gerado automaticamente a partir das lições escritas da unidade (tools/authoring/review_gen.py)", "createdAt": "2026-10-30"}
GEN_TAG = "tools/authoring/review_gen.py"

def is_generated(l):
    return GEN_TAG in (l.get("provenance") or {}).get("generator", "")

def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[.,!?¿¡;:\"«»“”()…]", " ", s.lower())).strip()

def opts(correct, wrongs):
    items = [{"text": correct, "correct": True}] + [{"text": w, "correct": False} for w in wrongs]
    return items

def label(items, rng):
    rng.shuffle(items)
    return [{"id": "abcdef"[i], **it} for i, it in enumerate(items)]

def pick_distinct(pool, k, exclude, rng):
    seen = {norm(x) for x in exclude}
    cand = [p for p in pool if p and norm(p) and norm(p) not in seen]
    rng.shuffle(cand)
    out = []
    for c in cand:
        if norm(c) not in seen:
            out.append(c); seen.add(norm(c))
        if len(out) == k: break
    return out

def clean(s):
    """Tira anotações entre parênteses («toen (conj.)» → «toen»)."""
    return re.sub(r"\s*\([^)]*\)", "", s).strip()

def ptset(v):
    return {norm(clean(p)) for p in v["pt"]} - {""}

def first_pt(v):
    """Primeiro significado utilizável (alguns são só uma nota entre parênteses)."""
    for p in v["pt"]:
        if clean(p): return clean(p)
    return ""

def simple_sentence(s):
    # Frases boas para ditado/ordenar: sem «/», sem parênteses, 3–11 palavras.
    if any(ch in s for ch in "/()[]|…"): return False
    n = len(s.split())
    return 3 <= n <= 11

class Gen:
    def __init__(self, unit_id, lessons):
        self.unit = unit_id
        self.rng = random.Random(unit_id)
        core = [l for l in lessons if not is_generated(l)]
        self.core = core
        self.next_order = max(l["order"] for l in core) + 1
        self.cefr = core[-1]["cefr"]
        self.diff = max(l["difficulty"] for l in core)
        self.vocab = [v for l in core for v in l["newVocabulary"]]
        self.review_ids = [v["id"] for v in self.vocab] + [r for l in core for r in l.get("reviewVocabulary", [])]
        ex = []
        for l in core:
            ex += [(e["nl"], e["pt"]) for e in l["examples"]]
            for g in l.get("grammar", []):
                ex += [(e["nl"], re.sub(r"\s*\(.*\)\s*$", "", e["pt"])) for e in g.get("examples", [])]
        seen, self.examples = set(), []
        for nl, pt in ex:
            if norm(nl) in seen: continue
            seen.add(norm(nl)); self.examples.append((nl, pt))
        self.sentences = [e for e in self.examples if simple_sentence(e[0])]
        self.nouns = [v for v in self.vocab if v.get("article") in ("de", "het") and " " not in clean(v["nl"])]
        # Usos já consumidos, para variar entre lições.
        self.used = {}

    def take(self, kind, pool, k):
        """Escolhe k itens do pool, preferindo os ainda não usados neste tipo."""
        used = self.used.setdefault(kind, set())
        fresh = [p for p in pool if id(p) not in used]
        stale = [p for p in pool if id(p) in used]
        self.rng.shuffle(fresh); self.rng.shuffle(stale)
        chosen = (fresh + stale)[:k]
        for c in chosen: used.add(id(c))
        return chosen

    def vrefs(self, *nls):
        ids = []
        for v in self.vocab:
            if any(norm(v["nl"]) in norm(t) for t in nls if t):
                ids.append(v["id"])
        return ids[:4]

    # --- geradores de exercícios ---
    def others(self, v):
        """Vocabulário que pode servir de distrator: significado e forma diferentes."""
        mine = ptset(v)
        return [w for w in self.vocab if w is not v and not (ptset(w) & mine) and norm(clean(w["nl"])) != norm(clean(v["nl"]))]

    def mc_nl_pt(self, v):
        correct = first_pt(v)
        wrong = pick_distinct([first_pt(w) for w in self.others(v)], 2, [clean(p) for p in v["pt"]], self.rng)
        if len(wrong) < 2 or not correct: return None
        nl = (v["article"] + " " if v.get("article") else "") + clean(v["nl"])
        return {"type": "multipleChoice", "instruction": "Escolha a tradução certa.", "prompt": f"O que significa «{nl}»?",
                "options": label(opts(correct, wrong), self.rng), "explanation": f"«{nl}» = {', '.join(v['pt'])}.", "vocabRefs": [v["id"]]}

    def mc_pt_nl(self, v):
        correct = clean(v["nl"])
        wrong = pick_distinct([clean(w["nl"]) for w in self.others(v)], 2, [correct], self.rng)
        if len(wrong) < 2 or not correct: return None
        pt = first_pt(v)
        if not pt: return None
        return {"type": "multipleChoice", "instruction": "Escolha a palavra certa.", "prompt": f"Como se diz «{pt}» em neerlandês?",
                "options": label(opts(correct, wrong), self.rng), "explanation": f"{pt} = «{correct}».", "vocabRefs": [v["id"]]}

    def article(self, v):
        return {"type": "articleChoice", "instruction": "Escolha o artigo certo.", "noun": clean(v["nl"]), "pt": first_pt(v) or v["pt"][0], "article": v["article"],
                "explanation": f"{v['article']} {clean(v['nl'])}.", "vocabRefs": [v["id"]]}

    def match(self, items):
        pairs, seen_nl, seen_pt = [], set(), set()
        for v in items:
            nl, pt = clean(v["nl"]), first_pt(v)
            a = norm(nl)
            # Evita pares ambíguos: nenhum significado pode repetir-se entre palavras do exercício.
            if not a or not pt or a in seen_nl or (ptset(v) & seen_pt): continue
            seen_nl.add(a); seen_pt |= ptset(v); pairs.append({"nl": nl, "pt": pt})
        if len(pairs) < 3: return None
        return {"type": "match", "instruction": "Associe as palavras.", "pairs": pairs[:5], "explanation": "Revisão do vocabulário da unidade.",
                "vocabRefs": [v["id"] for v in items][:5]}

    def listen(self, nl, pt):
        return {"type": "listening", "instruction": "Ouça e escreva o que ouviu.", "audioText": nl, "answers": [nl], "translation": pt,
                "explanation": f"«{nl}» = {pt}", "vocabRefs": self.vrefs(nl)}

    def word_order(self, nl, pt):
        toks = nl.split()
        if len(toks) < 3: return None
        sh = toks[:]
        for _ in range(5):
            self.rng.shuffle(sh)
            if sh != toks: break
        return {"type": "wordOrder", "instruction": "Ordene as palavras.", "translation": pt, "tokens": sh, "alternatives": [],
                "explanation": f"{nl}", "vocabRefs": self.vrefs(nl)}

    def build(self, nl, pt):
        toks = nl.split()
        others = [w for s, _ in self.sentences if s != nl for w in s.split()]
        extra = pick_distinct(others, 2, toks, self.rng)
        tokens = toks + extra
        self.rng.shuffle(tokens)
        return {"type": "buildSentence", "instruction": "Construa a frase em neerlandês.", "prompt": pt, "tokens": tokens, "answers": [nl],
                "explanation": f"{pt} = {nl}" + (f" (sobram: {', '.join(extra)})" if extra else ""), "vocabRefs": self.vrefs(nl)}

    def fill(self, nl, pt):
        words = [v for v in self.vocab if " " not in clean(v["nl"])]
        toks = nl.split()
        for v in self.rng.sample(words, len(words)):
            hits = [i for i, t in enumerate(toks) if norm(t) == norm(clean(v["nl"]))]
            if len(hits) != 1: continue
            i = hits[0]
            word = re.sub(r"[.,!?;:]+$", "", toks[i])
            tail = toks[i][len(word):]
            sentence = " ".join(toks[:i] + ["___" + tail] + toks[i + 1:])
            wrong = pick_distinct([clean(w["nl"]) for w in self.others(v) if " " not in clean(w["nl"])], 2, [word], self.rng)
            if len(wrong) < 2: continue
            # Mesma forma de maiúsculas para não denunciar a resposta.
            if word[:1].isupper():
                wrong = [w[:1].upper() + w[1:] for w in wrong]
            else:
                wrong = [w[:1].lower() + w[1:] if not w[:1].isupper() or w.lower() != w else w for w in wrong]
            choices = [word] + wrong
            self.rng.shuffle(choices)
            return {"type": "fillBlank", "instruction": "Escolha a palavra que falta.", "sentence": sentence, "translation": pt,
                    "answers": [word], "choices": choices, "explanation": f"{nl}", "vocabRefs": [v["id"]]}
        return None

    def mc_sentence(self, nl, pt):
        wrong = pick_distinct([p for _, p in self.examples if p != pt], 2, [pt], self.rng)
        if len(wrong) < 2: return None
        return {"type": "multipleChoice", "instruction": "Escolha a tradução certa.", "prompt": f"O que significa: «{nl}»?",
                "options": label(opts(pt, wrong), self.rng), "explanation": f"«{nl}» = {pt}", "vocabRefs": self.vrefs(nl)}

    # --- composição de lições ---
    def build_lesson(self, recipe):
        exs = []
        for kind, n in recipe:
            made = 0
            if kind in ("mc_nl_pt", "mc_pt_nl"):
                pool = self.take(kind, self.vocab, n * 2)
                for v in pool:
                    e = getattr(self, kind)(v)
                    if e: exs.append(e); made += 1
                    if made == n: break
            elif kind == "article":
                for v in self.take(kind, self.nouns, n):
                    exs.append(self.article(v))
            elif kind == "match":
                e = self.match(self.take(kind, self.vocab, 6))
                if e: exs.append(e)
            else:
                pool = self.take(kind, self.sentences, n * 3)
                for nl, pt in pool:
                    e = getattr(self, kind)(nl, pt)
                    if e: exs.append(e); made += 1
                    if made == n: break
        return exs

    def top_up(self, exs, target=9):
        """Garante um mínimo de exercícios com tipos de recurso."""
        backups = ["mc_nl_pt", "mc_pt_nl", "listen", "mc_sentence"]
        i = 0
        while len(exs) < target and i < 20:
            kind = backups[i % len(backups)]
            exs += self.build_lesson([(kind, 1)])
            i += 1
        return exs

    def lesson(self, order, title, desc, objective, recipe):
        exs = self.top_up(self.build_lesson(recipe))[:11]
        lid = f"{self.unit}-l{order:03d}"
        for i, e in enumerate(exs, 1):
            e["id"] = f"{lid}-e{i:02d}"
            e["vocabRefs"] = [r for r in e["vocabRefs"] if r]
        examples = [{"nl": nl, "pt": pt} for nl, pt in self.rng.sample(self.examples, min(3, len(self.examples)))]
        return {"id": lid, "unitId": self.unit, "order": order, "title": title, "description": desc, "cefr": self.cefr,
                "objectives": [objective], "newVocabulary": [], "reviewVocabulary": list(dict.fromkeys(self.review_ids)),
                "examples": examples, "grammar": [], "exercises": [{"id": e.pop("id"), **e} for e in exs],
                "difficulty": min(5, self.diff), "estimatedMinutes": 6, "status": "published", "version": 1, "provenance": PROV}

    def all(self, extra):
        L = []
        o = self.next_order
        L.append(self.lesson(o, "Revisão: vocabulário", "Pratique as palavras novas da unidade.", "Rever e consolidar o vocabulário da unidade",
                             [("match", 1), ("mc_nl_pt", 3), ("mc_pt_nl", 2), ("article", 2), ("fill", 2)]))
        L.append(self.lesson(o + 1, "Revisão: frases", "Ouça, ordene e construa as frases da unidade.", "Reconhecer e produzir as frases-chave da unidade",
                             [("listen", 3), ("word_order", 3), ("mc_sentence", 2), ("build", 2)]))
        L.append(self.lesson(o + 2, "Prática mista", "Palavras e frases da unidade, misturadas.", "Usar o vocabulário e as estruturas da unidade em contexto",
                             [("mc_pt_nl", 2), ("fill", 2), ("listen", 2), ("build", 2), ("article", 1), ("mc_sentence", 1)]))
        L.append(self.lesson(o + 3, "Desafio da unidade", "Mais produção e menos escolha: mostre o que já sabe.", "Produzir frases da unidade sem ajuda",
                             [("build", 3), ("listen", 3), ("word_order", 2), ("mc_nl_pt", 2)]))
        if extra:
            L.append(self.lesson(o + 4, "Revisão rápida", "Uma volta rápida por toda a unidade.", "Rever a unidade antes de avançar",
                                 [("match", 1), ("listen", 2), ("mc_nl_pt", 2), ("word_order", 2), ("fill", 1), ("mc_sentence", 1)]))
        return L


def main():
    only = sys.argv[1:]
    for path in sorted(glob.glob(os.path.join(ROOT, "content", "lessons", "*.json"))):
        data = json.load(open(path, encoding="utf-8"))
        uid = data["unitId"]
        if only and uid not in only: continue
        core = [l for l in data["lessons"] if not is_generated(l)]
        if not core: continue
        g = Gen(uid, core)
        new = g.all(extra=uid.startswith("s1-"))
        data["lessons"] = core + new
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
        print(f"{uid}: +{len(new)} lições ({sum(len(l['exercises']) for l in new)} exercícios)", file=sys.stderr)

if __name__ == "__main__":
    main()
