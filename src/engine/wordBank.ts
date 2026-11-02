/**
 * Peças para os exercícios de tradução: em vez de escrever, o aluno toca nas palavras.
 * As peças são a resposta certa partida em palavras + algumas palavras a mais da própria lição
 * (todas já vistas), baralhadas. Funções puras e determinísticas (semente = ID do exercício).
 */
import type { Exercise, ExerciseOf } from '../domain/schemas.ts';
import { expandAnswerPattern, normalize } from './answers.ts';
import { seededRandom, shuffle } from './session.ts';

export interface WordPools {
  nl: string[];
  pt: string[];
  /** Expressões curtas (1–2 palavras) que aparecem sozinhas, ex.: «tchau», «até logo». */
  shortNl?: ReadonlySet<string>;
  shortPt?: ReadonlySet<string>;
}

/** Textos curtos (1–2 palavras) normalizados: costumam ser sinónimos uns dos outros (saudações, respostas). */
function shortTexts(texts: string[]): Set<string> {
  return new Set(texts.map((t) => normalize(t)).filter((t) => t && t.split(' ').length <= 2));
}

/** Uma palavra sem a pontuação colada (mantém apóstrofos e hífenes: «'s», «bem-vindo»). */
export function bareWord(w: string): string {
  return w.replace(/^[«"“(¿¡]+/, '').replace(/[.,!?;:…»"”)]+$/, '');
}

const words = (s: string | undefined) => (s ?? '').split(/\s+/).map(bareWord).filter((w) => /[\p{L}\p{N}]/u.test(w) && !w.includes('_'));
const isCapitalized = (w: string) => /^\p{Lu}\p{Ll}/u.test(w);

/**
 * Palavras de várias frases, para servirem de peças a mais. A maiúscula de início de frase
 * sai («Ik» → «ik»), mas os nomes próprios (com maiúscula também a meio da frase) ficam.
 */
function poolFrom(texts: string[]): string[] {
  const names = new Set<string>();
  const items: { w: string; initial: boolean }[] = [];
  for (const t of texts) {
    // Início de frase: a primeira palavra (mesmo depois de um «___» inicial) ou a seguir a «.», «!», «?», «:».
    let initial = true;
    for (const raw of t.split(/\s+/)) {
      const w = bareWord(raw);
      if (/[\p{L}\p{N}]/u.test(w) && !w.includes('_')) {
        items.push({ w, initial });
        if (!initial && isCapitalized(w)) names.add(w);
      }
      initial = /[.!?:]["»”)]*$/.test(raw) || (initial && (raw.includes('_') || !/[\p{L}\p{N}]/u.test(raw)));
    }
  }
  return items.map(({ w, initial }) => (initial && isCapitalized(w) && !names.has(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w));
}
const firstVariant = (s: string) => expandAnswerPattern(s)[0] ?? s;

/** Palavras neerlandesas e portuguesas que aparecem numa lição (servem de peças a mais). */
export function buildWordPools(exercises: readonly Exercise[]): WordPools {
  const nl: string[] = [];
  const pt: string[] = [];
  for (const ex of exercises) {
    switch (ex.type) {
      case 'translate':
        if (ex.direction === 'nl-pt') { nl.push(ex.prompt); pt.push(firstVariant(ex.answers[0]!)); }
        else { pt.push(ex.prompt); nl.push(firstVariant(ex.answers[0]!)); }
        break;
      case 'match':
        for (const p of ex.pairs) { nl.push(p.nl); pt.push(p.pt); }
        break;
      case 'listening':
        nl.push(ex.audioText); pt.push(ex.translation);
        break;
      case 'wordOrder':
        nl.push(ex.tokens.join(' ')); pt.push(ex.translation);
        break;
      case 'fillBlank':
        nl.push(ex.sentence); if (ex.translation) pt.push(ex.translation);
        break;
      case 'buildSentence':
        pt.push(ex.prompt); nl.push(firstVariant(ex.answers[0]!));
        break;
      case 'articleChoice':
        nl.push(ex.noun); pt.push(ex.pt);
        break;
      default:
        break;
    }
  }
  return { nl: poolFrom(nl), pt: poolFrom(pt), shortNl: shortTexts(nl), shortPt: shortTexts(pt) };
}

/** A resposta certa (primeira variante) em peças, ou null se tiver notas que não se partem bem. */
export function answerTiles(ex: ExerciseOf<'translate'>): string[] | null {
  const answer = firstVariant(ex.answers[0]!);
  if (/[()[\]/|…]/.test(answer)) return null;
  return words(answer);
}

/** Respostas demasiado longas ou com notas ficam com teclado. */
const MAX_WORDS = 12;

/**
 * Peças para um exercício de tradução, ou null se for melhor escrever
 * (resposta longa, com notas, ou sem palavras suficientes para distratores).
 */
export function translationTiles(ex: ExerciseOf<'translate'>, pools: WordPools): string[] | null {
  if (ex.wordBank) return ex.wordBank;
  const tiles = answerTiles(ex);
  if (!tiles) return null;
  if (tiles.length === 0 || tiles.length > MAX_WORDS) return null;
  // Nenhuma palavra de nenhuma resposta aceite pode ser distrator (evita duas respostas certas).
  const accepted = new Set(ex.answers.flatMap((a) => expandAnswerPattern(a)).flatMap(words).map((w) => normalize(w)));
  const pool = ex.direction === 'nl-pt' ? pools.pt : pools.nl;
  // Resposta curta (ex.: «Adeus»): as outras expressões curtas da lição podem ser sinónimos
  // («tchau», «até logo») e ficariam certas também; não servem de peça a mais.
  const short = tiles.length <= 2 ? (ex.direction === 'nl-pt' ? pools.shortPt : pools.shortNl) : undefined;
  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const w of pool) {
    const k = normalize(w);
    if (!k || accepted.has(k) || seen.has(k) || short?.has(k)) continue;
    seen.add(k);
    candidates.push(w);
  }
  const rnd = seededRandom(seedOf(ex.id));
  const extra = shuffle(candidates, rnd).slice(0, tiles.length <= 3 ? 3 : 4);
  if (extra.length < 2) return null;
  return [...tiles, ...extra];
}

function seedOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
}
