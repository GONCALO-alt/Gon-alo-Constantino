/**
 * Correção de respostas escritas.
 *
 * Princípios:
 *  - Nunca comparar texto de forma rígida: ignora maiúsculas, espaços repetidos,
 *    pontuação final e variantes tipográficas de apóstrofos/aspas.
 *  - As respostas aceites suportam variantes: "[a|b]" (alternativas) e "(x)" (opcional).
 *  - Pequenas gralhas são aceites com aviso (nunca em palavras muito curtas, onde
 *    uma letra muda o sentido, ex.: "de"/"het", "een"/"en").
 *  - Acentos em falta podem ser aceites com aviso (configurável), exceto quando a
 *    forma sem acento é outra palavra listada como errada.
 */

export type Verdict = 'correct' | 'almost' | 'incorrect';

export interface GradeResult {
  verdict: Verdict;
  /** A resposta aceite mais próxima (para mostrar ao aluno). */
  bestMatch: string;
  /** Aviso opcional (gralha, acento, etc.). */
  note?: string;
}

export interface GradeOptions {
  lenientAccents?: boolean;
  /** Permite gralhas (distância de edição) — desligado em exercícios de forma (conjugação, artigos). */
  allowTypos?: boolean;
}

const MAX_EXPANSIONS = 256;

/** Expande "[Hoi|Hallo] (Ana)" em ["Hoi Ana", "Hoi", "Hallo Ana", "Hallo"]. */
export function expandAnswerPattern(pattern: string): string[] {
  // Encontra o primeiro grupo [..] ou (..) de nível superior.
  const m = /\[([^\[\]()]*)\]|\(([^\[\]()]*)\)/.exec(pattern);
  if (!m) return [collapse(pattern)];
  const before = pattern.slice(0, m.index);
  const after = pattern.slice(m.index + m[0].length);
  const choices = m[1] !== undefined ? m[1].split('|') : [m[2] ?? '', ''];
  const out: string[] = [];
  for (const c of choices) {
    for (const rest of expandAnswerPattern(before + c + after)) {
      out.push(rest);
      if (out.length >= MAX_EXPANSIONS) return dedupe(out);
    }
  }
  return dedupe(out);
}

function collapse(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}
function dedupe(xs: string[]): string[] {
  return [...new Set(xs.filter((x) => x.length > 0))];
}

/** Normalização para comparação. */
export function normalize(s: string, opts: { stripAccents?: boolean } = {}): string {
  let t = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‘’‛`´]/g, "'") // apóstrofos
    .replace(/[“”„«»]/g, '"')
    .replace(/[‐‑‒–—]/g, '-')
    // pontuação que não muda o sentido
    .replace(/[.,!?¿¡;:"…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (opts.stripAccents) t = stripAccents(t);
  return t;
}

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** Distância de Levenshtein (limitada por `max` para eficiência). */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

/** Quantas gralhas toleramos para uma resposta deste tamanho. */
function typoBudget(len: number): number {
  if (len < 5) return 0;
  if (len < 14) return 1;
  return 2;
}

/**
 * Verifica se existe alguma palavra curta (≤ 3 letras) diferente entre as duas frases.
 * Palavras curtas como "de/het", "een/en", "is/in" mudam o sentido: não são gralhas.
 */
function shortWordChanged(a: string, b: string): boolean {
  const wa = a.split(' ');
  const wb = b.split(' ');
  if (wa.length !== wb.length) return true;
  return wa.some((w, i) => w !== wb[i] && (w.length <= 3 || (wb[i] ?? '').length <= 3));
}

export function gradeText(input: string, accepted: readonly string[], options: GradeOptions = {}): GradeResult {
  const { lenientAccents = true, allowTypos = true } = options;
  const variants = accepted.flatMap(expandAnswerPattern);
  const primary = variants[0] ?? '';
  const userN = normalize(input);
  if (!userN) return { verdict: 'incorrect', bestMatch: primary };

  // 1) Correspondência exata (normalizada)
  for (const v of variants) {
    if (normalize(v) === userN) return { verdict: 'correct', bestMatch: v };
  }

  // 2) Só faltam/sobram acentos
  if (lenientAccents) {
    const userS = stripAccents(userN);
    for (const v of variants) {
      if (stripAccents(normalize(v)) === userS) {
        return { verdict: 'almost', bestMatch: v, note: `Atenção aos acentos: «${v}».` };
      }
    }
  }

  // 3) Pequena gralha
  if (allowTypos) {
    let best: { v: string; d: number } | null = null;
    for (const v of variants) {
      const vn = normalize(v);
      const budget = typoBudget(vn.length);
      if (budget === 0) continue;
      const d = levenshtein(stripAccents(userN), stripAccents(vn), budget);
      if (d <= budget && !shortWordChanged(userN, vn) && (!best || d < best.d)) best = { v, d };
    }
    if (best) return { verdict: 'almost', bestMatch: best.v, note: `Quase! Tinha uma pequena gralha: «${best.v}».` };
  }

  // 4) Errado: devolve a variante mais próxima para mostrar
  let closest = primary;
  let closestD = Infinity;
  for (const v of variants) {
    const d = levenshtein(userN, normalize(v), 60);
    if (d < closestD) {
      closestD = d;
      closest = v;
    }
  }
  return { verdict: 'incorrect', bestMatch: closest };
}

/** Uma resposta "almost" conta como certa para progresso, mas é sinalizada. */
export function isAccepted(v: Verdict): boolean {
  return v !== 'incorrect';
}

/** Junta peças de um banco de palavras numa frase (sem espaço antes de pontuação). */
export function joinTokens(tokens: readonly string[]): string {
  return collapse(tokens.join(' '));
}

/** Conta palavras (para exercícios de escrita). */
export function wordCount(s: string): number {
  const n = normalize(s);
  return n ? n.split(' ').length : 0;
}
