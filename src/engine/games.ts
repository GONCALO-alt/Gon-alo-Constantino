/**
 * Mini-jogos com o vocabulário já aprendido. Funções puras: recebem um gerador
 * aleatório (`rnd`) para poderem ser testadas com resultados fixos.
 */
import { normalize } from './answers.ts';
import { shuffle } from './session.ts';

export interface VocabSource {
  id: string;
  nl: string;
  pt: readonly string[];
  pos: string;
  article?: 'de' | 'het';
  lessonId: string;
}

export interface GameWord {
  id: string;
  /** Palavra neerlandesa como se mostra (com artigo nos substantivos). */
  nl: string;
  /** Sem artigo. */
  bare: string;
  article?: 'de' | 'het';
  /** Tradução principal. */
  pt: string;
  /** Todas as traduções normalizadas (para evitar opções com o mesmo significado). */
  ptKeys: string[];
}

/** Sem notas entre parênteses (também as que ficaram por fechar, ex.: «cortar (cabelo»). */
const clean = (s: string) => s.replace(/\s*\([^)]*\)/g, '').replace(/\s*[()].*$/, '').trim();

function toGameWord(v: VocabSource): GameWord | null {
  const bare = clean(v.nl);
  const pt = v.pt.map(clean).find(Boolean);
  // Palavras com variantes («a|b»), notas ou demasiado compridas não servem para jogos rápidos.
  if (!pt || !bare || /[|/…]/.test(bare) || bare.split(' ').length > 3 || pt.length > 28) return null;
  return {
    id: v.id,
    nl: v.article ? `${v.article} ${bare}` : bare,
    bare,
    article: v.article,
    pt,
    ptKeys: v.pt.map((p) => normalize(clean(p))).filter(Boolean),
  };
}

/**
 * Palavras para jogar: as das lições já concluídas. Se forem poucas,
 * completa com as primeiras palavras do curso (pela ordem do curso).
 */
export function gameWords(items: readonly VocabSource[], completed: ReadonlySet<string>, min = 12): GameWord[] {
  const seen = new Set<string>();
  const out: GameWord[] = [];
  const add = (v: VocabSource) => {
    const w = toGameWord(v);
    const k = w && normalize(w.nl);
    if (!w || !k || seen.has(k)) return;
    seen.add(k);
    out.push(w);
  };
  items.filter((v) => completed.has(v.lessonId)).forEach(add);
  for (const v of items) {
    if (out.length >= min) break;
    add(v);
  }
  return out;
}

const sameMeaning = (a: GameWord, b: GameWord) => a.ptKeys.some((k) => b.ptKeys.includes(k));

export interface ChoiceRound {
  word: GameWord;
  /** Opções (a certa incluída), já baralhadas. */
  options: GameWord[];
}

/** Uma ronda de escolha: uma palavra e 3 outras com significado diferente. */
export function choiceRound(words: readonly GameWord[], rnd: () => number, avoid?: string): ChoiceRound | null {
  const pool = words.filter((w) => w.id !== avoid);
  if (pool.length < 4) return null;
  const word = pool[Math.floor(rnd() * pool.length)]!;
  const others = shuffle(words.filter((w) => w.id !== word.id && !sameMeaning(w, word) && normalize(w.bare) !== normalize(word.bare)), rnd);
  const picked: GameWord[] = [];
  for (const w of others) {
    if (picked.some((p) => sameMeaning(p, w) || normalize(p.bare) === normalize(w.bare))) continue;
    picked.push(w);
    if (picked.length === 3) break;
  }
  if (picked.length < 3) return null;
  return { word, options: shuffle([word, ...picked], rnd) };
}

export interface MemoryCard {
  key: string;
  wordId: string;
  side: 'nl' | 'pt';
  text: string;
}

/** Baralho do jogo da memória: `pairs` palavras, cada uma em neerlandês e em português. */
export function memoryDeck(words: readonly GameWord[], rnd: () => number, pairs = 6): MemoryCard[] {
  const chosen: GameWord[] = [];
  for (const w of shuffle(words, rnd)) {
    if (chosen.some((c) => sameMeaning(c, w))) continue;
    chosen.push(w);
    if (chosen.length === pairs) break;
  }
  const cards = chosen.flatMap((w) => [
    { key: `${w.id}-nl`, wordId: w.id, side: 'nl' as const, text: w.nl },
    { key: `${w.id}-pt`, wordId: w.id, side: 'pt' as const, text: w.pt },
  ]);
  return shuffle(cards, rnd);
}

/** Substantivos com artigo, para o jogo «de of het?». */
export function articleWords(words: readonly GameWord[]): GameWord[] {
  return words.filter((w) => w.article && !w.bare.includes(' '));
}

/** Pontos de uma resposta certa na corrida: mais pontos com respostas seguidas. */
export function raceScore(streak: number): number {
  return 10 + Math.min(streak, 5) * 2;
}
