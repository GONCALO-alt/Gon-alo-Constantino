/**
 * Sessão de lição: fila de exercícios em que os errados voltam no fim
 * (uma vez), para o aluno terminar com a resposta certa na memória.
 * Só a PRIMEIRA tentativa de cada exercício conta para a precisão e para o XP.
 */
import type { Exercise, VocabularyItem } from '../domain/schemas.ts';
import type { Verdict } from './answers.ts';

export interface SessionState {
  queue: Exercise[];
  position: number;
  firstVerdicts: Map<string, Verdict>;
  retried: Set<string>;
}

export function startSession(exercises: readonly Exercise[]): SessionState {
  return { queue: [...exercises], position: 0, firstVerdicts: new Map(), retried: new Set() };
}

export function currentExercise(s: SessionState): Exercise | undefined {
  return s.queue[s.position];
}

/** Regista a resposta ao exercício atual e devolve o novo estado (sem avançar). */
/**
 * Regista a resposta ao exercício atual. Um exercício errado volta no fim (uma vez).
 * `forceRetry`: volta no fim mesmo estando certo (ex.: o aluno pediu para ver a resposta na ajuda),
 * sem contar como erro.
 */
export function answer(s: SessionState, verdict: Verdict, maxRetries = 4, forceRetry = false): SessionState {
  const ex = currentExercise(s);
  if (!ex) return s;
  const firstVerdicts = new Map(s.firstVerdicts);
  if (!firstVerdicts.has(ex.id)) firstVerdicts.set(ex.id, verdict);
  let queue = s.queue;
  const retried = new Set(s.retried);
  if ((verdict === 'incorrect' || forceRetry) && !retried.has(ex.id) && retried.size < maxRetries) {
    retried.add(ex.id);
    queue = [...queue, ex];
  }
  return { ...s, queue, firstVerdicts, retried };
}

export function advance(s: SessionState): SessionState {
  return { ...s, position: s.position + 1 };
}

export function isFinished(s: SessionState): boolean {
  return s.position >= s.queue.length;
}

export function progressFraction(s: SessionState): number {
  return s.queue.length ? Math.min(1, s.position / s.queue.length) : 1;
}

export function summary(s: SessionState): { correct: number; total: number; accuracy: number } {
  const verdicts = [...s.firstVerdicts.values()];
  const correct = verdicts.filter((v) => v !== 'incorrect').length;
  return { correct, total: verdicts.length, accuracy: verdicts.length ? correct / verdicts.length : 1 };
}

// ---------------------------------------------------------------------------
// Exercícios gerados para a revisão de vocabulário
// ---------------------------------------------------------------------------
export type ReviewVocab = VocabularyItem & { lessonId: string };

/** Gerador pseudoaleatório determinístico (testável). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(xs: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const withArticle = (v: VocabularyItem) => (v.article ? `${v.article} ${v.nl}` : v.nl);
/** Aceita a palavra com ou sem artigo (o artigo é treinado à parte). */
const nlAnswers = (v: VocabularyItem) => (v.article ? [`(${v.article} )${v.nl}`] : [v.nl]);

/**
 * Cria um exercício de revisão para um item. Alterna entre formatos para
 * treinar reconhecimento (escolha múltipla) e produção (escrever).
 */
/** Tradução para mostrar numa opção: sem notas entre parênteses nem alternativas («vá lá / bom… (Flandres)» → «vá lá»). */
export function cleanPt(pt: string): string {
  return pt.replace(/\s*\([^)]*\)/g, '').replace(/\s*\(.*$/, '').split(' / ')[0]!.trim() || pt;
}

/**
 * Palavras que podem servir de opções erradas: só as que o aluno já conhece (mais as da lição atual).
 * Com poucas palavras conhecidas, completa com as primeiras palavras do curso (as mais simples).
 */
export function knownPool(all: readonly ReviewVocab[], known: ReadonlySet<string>, min = 12): ReviewVocab[] {
  const out = all.filter((v) => known.has(v.id));
  const ids = new Set(out.map((v) => v.id));
  for (const v of all) {
    if (out.length >= min) break;
    if (!ids.has(v.id)) { out.push(v); ids.add(v.id); }
  }
  return out;
}

export function buildReviewExercise(item: ReviewVocab, pool: readonly ReviewVocab[], rnd: () => number, box = 0): Exercise {
  const id = `review-${item.id}`;
  // Distratores não podem partilhar nenhuma tradução com o item (seriam também certos).
  const overlaps = (p: ReviewVocab) => p.pt.some((t) => item.pt.includes(t));
  const candidates = pool.filter((p) => p.id !== item.id && !overlaps(p));
  const distractors = shuffle(candidates.filter((p) => p.pos === item.pos), rnd).slice(0, 3);
  const fallbackDistractors = distractors.length >= 2 ? distractors : shuffle(candidates, rnd).slice(0, 3);
  const roll = rnd();
  const explanation = `${withArticle(item)} = ${item.pt.join(' / ')}${item.note ? `. ${item.note}` : ''}`;
  const base = { id, explanation, vocabRefs: [item.id] };

  if (item.article && roll < 0.2) {
    return { ...base, type: 'articleChoice', instruction: 'Escolha o artigo certo.', noun: item.nl, pt: item.pt[0]!, article: item.article };
  }
  // Itens novos (caixa baixa): reconhecimento. Itens mais consolidados: produção.
  if (box <= 1 && fallbackDistractors.length >= 2 && roll < 0.65) {
    const opts = shuffle([{ text: cleanPt(item.pt[0]!), correct: true }, ...fallbackDistractors.map((d) => ({ text: cleanPt(d.pt[0]!), correct: false }))], rnd);
    return {
      ...base, type: 'multipleChoice', instruction: 'Escolha a tradução certa.', prompt: `O que significa «${withArticle(item)}»?`,
      options: opts.map((o, i) => ({ id: 'abcdef'[i]!, ...o })),
    };
  }
  if (roll < 0.8) {
    return { ...base, type: 'translate', direction: 'nl-pt', instruction: 'Traduza para português.', prompt: withArticle(item), answers: item.pt };
  }
  // Sinónimos: qualquer palavra conhecida com a mesma tradução também é aceite (ex.: «olá» = hallo, hoi, dag).
  const synonyms = pool.filter((p) => p.pt.includes(item.pt[0]!)).flatMap(nlAnswers);
  return { ...base, type: 'translate', direction: 'pt-nl', instruction: 'Escreva em neerlandês.', prompt: item.pt[0]!, answers: [...new Set([...nlAnswers(item), ...synonyms])] };
}

/**
 * Exercício de apresentação, antes do primeiro exercício que usa a palavra: traduzir a palavra
 * para português. A palavra aparece sublinhada a pontilhado — tocando nela vê-se o significado —
 * por isso o aluno nunca tem de adivinhar uma palavra que ainda não viu.
 */
export function buildIntroExercise(item: Pick<ReviewVocab, 'id' | 'nl' | 'pt' | 'article' | 'note'>): Exercise {
  const head = item.article ? `${item.article} ${item.nl}` : item.nl;
  // Traduções sem notas (algumas traduções têm notas partidas entre elementos: «cortar (cabelo», «com tesoura)»).
  const answers = [...new Set(item.pt.map(cleanPt).filter((a) => a && !/[()]/.test(a)))];
  if (!answers.length) answers.push(cleanPt(item.pt[0]!).replace(/[()]/g, ''));
  return {
    id: `intro-${item.id}`,
    type: 'translate',
    direction: 'nl-pt',
    instruction: 'Traduza para português.',
    prompt: head.charAt(0).toUpperCase() + head.slice(1),
    answers,
    explanation: `${head} = ${answers.join(', ')}${item.note ? `. ${item.note}` : ''}`,
    vocabRefs: [item.id],
  };
}
