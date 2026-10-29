"""
Formato compacto de autoria de lições (gera o JSON de content/lessons/<unidade>.json).

O JSON continua a ser a fonte de verdade; este módulo só poupa escrita.
Uso num script (ver tools/authoring/units/*.py):

    from dsl import *
    U("s1-u03")
    L(1, "Título", "Descrição", obj=["..."], vocab=[V(...)], ex=[("nl", "pt")], exs=[MC(...), ...])
    W()   # funde com o ficheiro existente (substitui lições com o mesmo ID)

Opções de escolha: "*texto" = correta; "texto|feedback" = errada com feedback.
"""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PROV = {"source": "ai", "generator": "claude (redação assistida na sessão de desenvolvimento)", "createdAt": "2026-10-29"}
_unit = None
_lessons = []


def U(unit_id):
    global _unit, _lessons
    _unit, _lessons = unit_id, []


def V(id, nl, pt, pos, article=None, plural=None, note=None):
    d = {"id": id, "nl": nl, "pt": pt.split("|"), "pos": pos}
    if article: d["article"] = article
    if plural: d["plural"] = plural
    if note: d["note"] = note
    return d


def G(id, title, body, examples=(), contrast=None):
    g = {"id": id, "title": title, "body": body, "examples": [{"nl": a, "pt": b} for a, b in examples]}
    if contrast: g["contrastWithPt"] = contrast
    return g


def _opts(items):
    out = []
    for i, it in enumerate(items):
        correct = it.startswith("*")
        text = it[1:] if correct else it
        fb = None
        if "|" in text:
            text, fb = text.split("|", 1)
        o = {"id": "abcdef"[i], "text": text, "correct": correct}
        if fb: o["feedback"] = fb
        out.append(o)
    return out


def _e(type, instruction, expl, refs, **kw):
    d = {"type": type, "instruction": instruction, "explanation": expl, "vocabRefs": list(refs)}
    d.update({k: v for k, v in kw.items() if v is not None})
    return d


def MC(prompt, options, expl, refs=(), ins="Escolha a resposta certa."):
    return _e("multipleChoice", ins, expl, refs, prompt=prompt, options=_opts(options))


def TR(direction, prompt, answers, expl, refs=(), bank=None, ins=None):
    ins = ins or ("Traduza para português." if direction == "nl-pt" else ("Construa a frase em neerlandês." if bank else "Escreva em neerlandês."))
    return _e("translate", ins, expl, refs, direction=direction, prompt=prompt, answers=list(answers), wordBank=bank)


def FB(sentence, answers, expl, refs=(), choices=None, tr=None, ins=None):
    ins = ins or ("Escolha a palavra que falta." if choices else "Escreva a palavra que falta.")
    return _e("fillBlank", ins, expl, refs, sentence=sentence, translation=tr, answers=list(answers), choices=choices)


def BS(prompt, tokens, answers, expl, refs=(), ins="Construa a frase em neerlandês."):
    return _e("buildSentence", ins, expl, refs, prompt=prompt, tokens=list(tokens), answers=list(answers))


def MA(pairs, expl, refs=(), ins="Associe as palavras."):
    return _e("match", ins, expl, refs, pairs=[{"nl": a, "pt": b} for a, b in pairs])


def WO(translation, tokens, expl, refs=(), alt=(), ins="Ordene as palavras."):
    return _e("wordOrder", ins, expl, refs, translation=translation, tokens=list(tokens), alternatives=list(alt))


def FE(tokens, idx, correction, expl, refs=(), ins="Toque na palavra errada."):
    return _e("findError", ins, expl, refs, tokens=list(tokens), errorIndex=idx, correction=correction)


def AR(noun, pt, article, expl, refs=(), ins="Escolha o artigo certo."):
    return _e("articleChoice", ins, expl, refs, noun=noun, pt=pt, article=article)


def CJ(verb, pronoun, sentence, answers, expl, refs=(), tense="presente", ins="Escreva a forma correta do verbo."):
    return _e("conjugation", ins, expl, refs, verb=verb, pronoun=pronoun, tense=tense, sentence=sentence, answers=list(answers))


def DL(lines, options, expl, refs=(), ins="Complete o diálogo."):
    """lines: (orador, nl, pt) — a linha a completar tem nl vazio ("")."""
    ls, blank = [], None
    for i, ln in enumerate(lines):
        sp, nl = ln[0], ln[1]
        d = {"speaker": sp, "nl": nl}
        if len(ln) > 2 and ln[2]: d["pt"] = ln[2]
        if nl == "": blank = i
        ls.append(d)
    return _e("dialogue", ins, expl, refs, lines=ls, blankLine=blank, options=_opts(options))


def CO(kind, title, text, questions, expl, refs=(), ins=None):
    ins = ins or ("Leia o diálogo e responda." if kind == "dialogue" else "Leia o texto e responda.")
    return _e("comprehension", ins, expl, refs, kind=kind, title=title, text=text,
              questions=[{"prompt": q, "options": _opts(o)} for q, o in questions])


def LI(audio_text, answers, translation, expl, refs=(), ins="Ouça e escreva o que ouviu."):
    return _e("listening", ins, expl, refs, audioText=audio_text, answers=list(answers), translation=translation)


def EX(expression, literal, prompt, options, expl, refs=(), ins="Escolha a opção certa."):
    return _e("expression", ins, expl, refs, expression=expression, literal=literal, prompt=prompt, options=_opts(options))


def SW(prompt, refs_answers, checklist, min_words, expl, refs=(), ins="Escreva a sua resposta."):
    return _e("shortWriting", ins, expl, refs, prompt=prompt, referenceAnswers=list(refs_answers), checklist=list(checklist), minWords=min_words)


def L(n, title, desc, obj, exs, vocab=(), ex=(), gram=(), review=(), cefr="A1", diff=1, mins=5, status="published"):
    lid = f"{_unit}-l{n:03d}"
    exercises = []
    for i, e in enumerate(exs, 1):
        exercises.append({"id": f"{lid}-e{i:02d}", **e})
    _lessons.append({
        "id": lid, "unitId": _unit, "order": n, "title": title, "description": desc, "cefr": cefr,
        "objectives": list(obj), "newVocabulary": list(vocab), "reviewVocabulary": list(review),
        "examples": [{"nl": x[0], "pt": x[1], **({"note": x[2]} if len(x) > 2 else {})} for x in ex],
        "grammar": list(gram), "exercises": exercises, "difficulty": diff, "estimatedMinutes": mins,
        "status": status, "version": 1, "provenance": PROV,
    })


def W():
    path = os.path.join(ROOT, "content", "lessons", f"{_unit}.json")
    existing = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            existing = json.load(f)["lessons"]
    new_ids = {l["id"] for l in _lessons}
    merged = [l for l in existing if l["id"] not in new_ids] + _lessons
    merged.sort(key=lambda l: l["order"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"unitId": _unit, "lessons": merged}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{_unit}: {len(_lessons)} lições escritas ({len(merged)} no total, {sum(len(l['exercises']) for l in merged)} exercícios)", file=sys.stderr)
