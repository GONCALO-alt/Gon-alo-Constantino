/**
 * Deteção de exercícios/lições demasiado semelhantes, escalável a dezenas de
 * milhares de exercícios (MinHash + LSH em vez de comparar todos os pares).
 */
import { normalize } from '../../src/engine/answers.ts';
import type { Exercise, Lesson } from '../../src/domain/schemas.ts';

/** Texto que identifica o "conteúdo" de um exercício, independentemente do formato. */
export function exerciseKey(ex: Exercise): string {
  switch (ex.type) {
    case 'translate': return `${ex.direction}:${ex.prompt}`;
    case 'multipleChoice': return ex.prompt + ' ' + ex.options.map((o) => o.text).join(' ');
    case 'fillBlank': return ex.sentence;
    case 'buildSentence': return ex.prompt;
    case 'match': return ex.pairs.map((p) => p.nl).sort().join(' ');
    case 'wordOrder': return ex.tokens.join(' ');
    case 'findError': return ex.tokens.join(' ');
    case 'articleChoice': return `art:${ex.noun}`;
    case 'conjugation': return `${ex.verb} ${ex.pronoun} ${ex.tense} ${ex.sentence ?? ''}`;
    case 'dialogue': return ex.lines.map((l) => l.nl).join(' ');
    case 'comprehension': return ex.text;
    case 'listening': return `listen:${ex.audioText}`;
    case 'expression': return `${ex.expression} ${ex.prompt}`;
    case 'shortWriting': return ex.prompt;
  }
}

export type ShingleMode = 'char' | 'word';

/** Trigramas de caracteres (textos curtos) ou palavras + pares de palavras (textos longos). */
export function shingles(text: string, mode: ShingleMode = 'char'): Set<string> {
  const n = normalize(text);
  const out = new Set<string>();
  if (mode === 'word') {
    const w = n.split(' ');
    for (let i = 0; i < w.length; i++) {
      out.add(w[i]!);
      if (i + 1 < w.length) out.add(`${w[i]} ${w[i + 1]}`);
    }
    return out;
  }
  const t = ` ${n} `;
  for (let i = 0; i + 3 <= t.length; i++) out.add(t.slice(i, i + 3));
  return out;
}

export function jaccard<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// FNV-1a 32 bits com semente
function hash(s: string, seed: number): number {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// 6 bandas × 4 linhas: pares com semelhança ≥ 0,85 são candidatos com ~99% de probabilidade;
// pares a 0,5 só ~32% (menos comparações inúteis).
const BANDS = 6;
const ROWS = 4;
const NUM_HASHES = BANDS * ROWS;
const SEEDS = Array.from({ length: NUM_HASHES }, (_, i) => hash(`seed${i}`, 7));

function minhash(sh: ReadonlySet<string>): number[] {
  const sig = new Array<number>(NUM_HASHES).fill(0xffffffff);
  for (const s of sh) {
    const base = hash(s, 0);
    for (let i = 0; i < NUM_HASHES; i++) {
      // mistura barata (estilo murmur3 fmix) com uma semente por função de hash
      let h = (base ^ SEEDS[i]!) >>> 0;
      h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
      h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
      h = (h ^ (h >>> 16)) >>> 0;
      if (h < sig[i]!) sig[i] = h;
    }
  }
  return sig;
}

export interface SimilarPair<T> {
  a: T;
  b: T;
  score: number;
}

/**
 * Encontra pares com similaridade de Jaccard ≥ threshold.
 * `items` = [id, texto]. Complexidade ~O(n) com poucos candidatos por balde.
 */
export function findSimilar<T>(items: readonly { id: T; text: string }[], threshold = 0.85, mode: ShingleMode = 'char'): SimilarPair<T>[] {
  const prepared = items.map((it) => {
    const sh = shingles(it.text, mode);
    return { id: it.id, sh, sig: minhash(sh), norm: normalize(it.text) };
  });
  const buckets = new Map<string, number[]>();
  prepared.forEach((p, idx) => {
    for (let b = 0; b < BANDS; b++) {
      const key = `${b}:${p.sig.slice(b * ROWS, b * ROWS + ROWS).join(',')}`;
      const list = buckets.get(key);
      if (list) list.push(idx);
      else buckets.set(key, [idx]);
    }
  });
  const seen = new Set<string>();
  const out: SimilarPair<T>[] = [];
  for (const list of buckets.values()) {
    if (list.length < 2 || list.length > 500) continue; // baldes gigantes = textos triviais
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const x = list[i]!;
        const y = list[j]!;
        const key = x < y ? `${x}-${y}` : `${y}-${x}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const pa = prepared[x]!;
        const pb = prepared[y]!;
        const score = pa.norm === pb.norm ? 1 : jaccard(pa.sh, pb.sh);
        if (score >= threshold) out.push({ a: pa.id, b: pb.id, score });
      }
    }
  }
  return out;
}

/** Texto representativo de uma lição inteira (para detetar lições quase duplicadas). */
export function lessonKey(l: Lesson): string {
  return [l.title, ...l.exercises.map(exerciseKey)].join(' | ');
}
