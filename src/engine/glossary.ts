/**
 * Dicionário para tocar numa palavra durante a lição e ver a tradução.
 * Construído a partir do vocabulário do próprio curso (sem serviços externos).
 * Reconhece também formas flexionadas simples: verbos (werkt → werken),
 * adjetivos (grote → groot), plurais (katten → kat) e diminutivos (huisje → huis).
 */

export interface GlossSource {
  nl: string;
  pt: string[];
  article?: 'de' | 'het';
  plural?: string;
  note?: string;
}

export interface GlossEntry {
  /** Forma do dicionário (com artigo, se for substantivo). */
  headword: string;
  pt: string[];
  note?: string;
}

const VOWELS = 'aeiou';
const isVowel = (c: string | undefined) => !!c && VOWELS.includes(c);

/** Limpa pontuação à volta e põe em minúsculas. */
export function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '')
    .replace(/^'+|'+$/g, '');
}

function softenEnding(stem: string): string[] {
  // Em neerlandês, f/s no fim do radical passam a v/z antes de vogal: leef → leven, lees → lezen.
  const out = [stem];
  if (stem.endsWith('f')) out.push(stem.slice(0, -1) + 'v');
  if (stem.endsWith('s')) out.push(stem.slice(0, -1) + 'z');
  return out;
}

function hardenEnding(stem: string): string[] {
  const out = [stem];
  if (stem.endsWith('v')) out.push(stem.slice(0, -1) + 'f');
  if (stem.endsWith('z')) out.push(stem.slice(0, -1) + 's');
  return out;
}

/** Infinitivos possíveis a partir de um radical verbal (werk → werken, woon → wonen, zit → zitten). */
function infinitivesFromStem(stem: string): string[] {
  const out: string[] = [];
  for (const s of softenEnding(stem)) {
    out.push(s + 'en');
    const n = s.length;
    // Vogal longa dupla no radical fica simples no infinitivo: woon → wonen, maak → maken.
    if (n >= 3 && s[n - 2] === s[n - 3] && isVowel(s[n - 2]) && !isVowel(s[n - 1])) {
      out.push(s.slice(0, n - 2) + s[n - 1] + 'en');
    }
    // Vogal curta + consoante: duplica a consoante: zit → zitten, bel → bellen.
    if (n >= 2 && isVowel(s[n - 2]) && !isVowel(s[n - 1]) && !isVowel(s[n - 3])) {
      out.push(s + s[n - 1] + 'en');
    }
  }
  return out;
}

/** Formas base de uma palavra terminada em -e / -en (grote → groot, katten → kat, bomen → boom). */
function basesFromSuffixed(stem: string): string[] {
  const out: string[] = [];
  const n = stem.length;
  if (n < 2) return out;
  for (const s of hardenEnding(stem)) {
    out.push(s);
    const m = s.length;
    // Consoante dobrada: dikk(e) → dik, katt(en) → kat.
    if (m >= 3 && s[m - 1] === s[m - 2] && !isVowel(s[m - 1])) out.push(s.slice(0, -1));
    // Sílaba aberta com vogal simples → vogal dupla: grot(e) → groot, bom(en) → boom.
    if (m >= 3 && !isVowel(s[m - 1]) && isVowel(s[m - 2]) && !isVowel(s[m - 3])) {
      out.push(s.slice(0, m - 1) + s[m - 2] + s[m - 1]);
    }
  }
  return out;
}

/** Candidatos de forma do dicionário para uma palavra tal como aparece no texto. */
export function lemmaCandidates(word: string): string[] {
  const w = normalizeWord(word);
  if (!w) return [];
  const c: string[] = [w];
  if (w.endsWith("'s")) c.push(w.slice(0, -2));
  // Diminutivos: huisje → huis, boompje → boom, kopje → kop.
  for (const suf of ['etje', 'tje', 'pje', 'je']) {
    if (w.endsWith(suf) && w.length > suf.length + 1) c.push(...basesFromSuffixed(w.slice(0, -suf.length)), w.slice(0, -suf.length));
  }
  if (w.endsWith('ën')) c.push(w.slice(0, -2));
  if (w.endsWith('eren')) c.push(w.slice(0, -4));
  if (w.endsWith('en')) c.push(...basesFromSuffixed(w.slice(0, -2)));
  if (w.endsWith('e')) c.push(...basesFromSuffixed(w.slice(0, -1)));
  if (w.endsWith('s') && w.length > 3) c.push(w.slice(0, -1));
  // Verbos: werkt → werk → werken; rijdt → rijd → rijden; e o próprio radical (ik werk).
  if (w.endsWith('dt')) c.push(...infinitivesFromStem(w.slice(0, -1)));
  else if (w.endsWith('t') && w.length > 2) c.push(...infinitivesFromStem(w.slice(0, -1)));
  c.push(...infinitivesFromStem(w));
  // Comparativos regulares: groter → groot, kleiner → klein.
  if (w.endsWith('er') && w.length > 4) c.push(...basesFromSuffixed(w.slice(0, -2)));
  if (w.endsWith('st') && w.length > 4) c.push(...basesFromSuffixed(w.slice(0, -2)), w.slice(0, -2));
  return [...new Set(c)];
}

export interface Glossary {
  lookup(word: string): GlossEntry[];
  size: number;
}

/** Chave de índice para uma entrada do vocabulário (só palavras simples ou «zich + verbo»). */
function keysFor(item: GlossSource): string[] {
  const keys: string[] = [];
  let nl = item.nl.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').trim();
  if (nl.startsWith('zich ')) nl = nl.slice(5);
  if (!/\s/.test(nl) && !/[…/]/.test(nl)) keys.push(normalizeWord(nl));
  if (item.plural) keys.push(normalizeWord(item.plural));
  return keys.filter(Boolean);
}

export function buildGlossary(items: readonly GlossSource[]): Glossary {
  const index = new Map<string, GlossEntry[]>();
  for (const it of items) {
    const entry: GlossEntry = {
      headword: it.article ? `${it.article} ${it.nl}` : it.nl,
      pt: it.pt,
      note: it.note,
    };
    for (const k of keysFor(it)) {
      const list = index.get(k) ?? [];
      // Evita repetir a mesma tradução (a mesma palavra ensinada em várias lições).
      if (!list.some((e) => e.headword === entry.headword && e.pt[0] === entry.pt[0])) list.push(entry);
      index.set(k, list);
    }
  }
  return {
    size: index.size,
    lookup(word: string): GlossEntry[] {
      for (const cand of lemmaCandidates(word)) {
        const hit = index.get(cand);
        if (hit) return hit.slice(0, 3);
      }
      return [];
    },
  };
}
