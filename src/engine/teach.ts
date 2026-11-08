/**
 * «Ensinar primeiro»: que informação mostrar em cada exercício para o aluno perceber
 * TODAS as palavras antes de responder, sem lhe dar a resposta de bandeja.
 *
 *  - frases em neerlandês do exercício (com tradução quando existe);
 *  - palavras a explicar (todas as palavras neerlandesas visíveis: enunciado, opções, peças…);
 *  - «spoilers»: o que é a própria resposta. Isso fica tapado e só se mostra se o aluno pedir
 *    (e então o exercício volta no fim, para consolidar — como no «Não me lembro»).
 */
import type { Exercise } from '../domain/schemas.ts';
import { buildIntroExercise, type ReviewVocab } from './session.ts';
import { expandAnswerPattern } from './answers.ts';
import { lemmaCandidates, normalizeWord, wordsOf } from './glossary.ts';

export interface HelpSentence {
  nl: string;
  pt?: string;
  /** Que lado é a resposta (fica tapado até o aluno pedir). */
  hide?: 'nl' | 'pt';
}

export interface ExerciseHelp {
  sentences: HelpSentence[];
  /** Palavras neerlandesas a explicar, pela ordem em que aparecem (sem repetir). */
  words: string[];
  /** Palavras cujo significado é a resposta (normalizadas). */
  spoilerWords: Set<string>;
  /** As expressões (várias palavras) também são a resposta (ex.: «O que significa esta expressão?»). */
  spoilerExpressions: boolean;
  /** Não mostrar o artigo (exercícios «de ou het»). */
  hideArticles: boolean;
  /** Tradução literal dada pelo exercício (expressões). */
  literal?: string;
  /** Palavras do curso treinadas neste exercício (IDs); o significado é a resposta se `vocabSpoiler`. */
  vocabIds: string[];
  vocabSpoiler: boolean;
}

const first = (s: string) => expandAnswerPattern(s)[0] ?? s;
const QUOTED = /«([^»]+)»/g;

function splitWords(text: string): string[] {
  return text.split(/\s+/).map((w) => w.trim()).filter((w) => normalizeWord(w) && !/^_+/.test(w));
}

/**
 * @param isDutch diz se um texto é neerlandês (ex.: a maior parte das palavras está no dicionário do curso).
 */
export function exerciseHelp(ex: Exercise, isDutch: (text: string) => boolean): ExerciseHelp {
  const h: ExerciseHelp = {
    sentences: [], words: [], spoilerWords: new Set(), spoilerExpressions: false, hideArticles: false,
    vocabIds: [...new Set(ex.vocabRefs)], vocabSpoiler: false,
  };
  const addWords = (text: string | undefined, spoiler = false) => {
    if (!text) return;
    for (const w of splitWords(text)) {
      if (!h.words.some((x) => normalizeWord(x) === normalizeWord(w))) h.words.push(w);
      if (spoiler) h.spoilerWords.add(normalizeWord(w));
    }
  };
  const sentence = (s: HelpSentence) => h.sentences.push(s);

  switch (ex.type) {
    case 'translate':
      if (ex.direction === 'nl-pt') {
        sentence({ nl: ex.prompt, pt: first(ex.answers[0]!), hide: 'pt' });
        addWords(ex.prompt);
      } else {
        sentence({ nl: first(ex.answers[0]!), pt: ex.prompt, hide: 'nl' });
        addWords((ex.wordBank ?? []).join(' ') || first(ex.answers[0]!));
      }
      break;
    case 'multipleChoice': {
      const quoted = [...ex.prompt.matchAll(QUOTED)].map((m) => m[1]!);
      const dutchQuotes = quoted.filter(isDutch);
      const optionsDutch = ex.options.filter((o) => isDutch(o.text));
      const asksMeaning = /significa|quer dizer|tradução/i.test(ex.prompt);
      for (const q of dutchQuotes) {
        sentence({ nl: q });
        addWords(q, asksMeaning);
      }
      // Pergunta em português e opções em neerlandês (ex.: «Como se diz «café»?»): o significado das opções é a resposta.
      const asksDutchForPt = quoted.length > 0 && dutchQuotes.length === 0 && optionsDutch.length > 0;
      for (const o of optionsDutch) addWords(o.text, asksDutchForPt);
      h.vocabSpoiler = asksMeaning || asksDutchForPt;
      break;
    }
    case 'expression':
      sentence({ nl: ex.expression });
      addWords(ex.expression);
      h.spoilerExpressions = true;
      h.vocabSpoiler = true;
      h.literal = ex.literal;
      for (const o of ex.options) if (isDutch(o.text)) addWords(o.text);
      break;
    case 'fillBlank':
      sentence({ nl: ex.sentence, pt: ex.translation });
      addWords(ex.sentence);
      addWords((ex.choices ?? []).join(' '));
      break;
    case 'buildSentence':
      sentence({ nl: first(ex.answers[0]!), pt: ex.prompt, hide: 'nl' });
      addWords(ex.tokens.join(' '));
      break;
    case 'wordOrder':
      sentence({ nl: ex.tokens.join(' '), pt: ex.translation, hide: 'nl' });
      addWords(ex.tokens.join(' '));
      break;
    case 'match':
      for (const p of ex.pairs) addWords(p.nl, true);
      h.vocabSpoiler = true;
      break;
    case 'findError':
      sentence({ nl: ex.tokens.join(' ') });
      addWords(ex.tokens.join(' '));
      break;
    case 'articleChoice':
      addWords(ex.noun);
      h.hideArticles = true;
      break;
    case 'conjugation':
      if (ex.sentence) sentence({ nl: ex.sentence });
      addWords(ex.verb);
      addWords(ex.sentence);
      break;
    case 'dialogue':
      for (const l of ex.lines) if (l.nl) { sentence({ nl: l.nl, pt: l.pt }); addWords(l.nl); }
      for (const o of ex.options) if (isDutch(o.text)) addWords(o.text);
      break;
    case 'comprehension':
      for (const s of ex.text.split(/(?<=[.!?])\s+/)) if (s.trim()) sentence({ nl: s.trim() });
      addWords(ex.text);
      for (const q of ex.questions) for (const o of q.options) if (isDutch(o.text)) addWords(o.text);
      break;
    case 'listening':
      sentence({ nl: ex.audioText, pt: ex.translation, hide: 'nl' });
      addWords(ex.audioText, true);
      h.vocabSpoiler = true;
      break;
    case 'speaking':
      sentence({ nl: ex.text, pt: ex.translation });
      addWords(ex.text);
      break;
    case 'shortWriting':
      sentence({ nl: first(ex.referenceAnswers[0]!), hide: 'nl' });
      for (const q of [...ex.prompt.matchAll(QUOTED)].map((m) => m[1]!)) if (isDutch(q)) addWords(q);
      break;
  }
  return h;
}

/** Exemplo (da lição) que contém a palavra, para mostrar o uso. */
export function exampleFor<T extends { nl: string; pt: string }>(matches: (word: string) => boolean, examples: readonly T[]): T | null {
  return examples.find((e) => e.nl.split(/\s+/).some((w) => matches(w))) ?? null;
}

// ---------------------------------------------------------------------------
// Pronúncia aproximada para quem fala português europeu.
// É só uma ajuda: o áudio é a referência. Regras simples, letra a letra.
// ---------------------------------------------------------------------------
const RULES: [RegExp, string][] = [
  [/th/g, 't'],
  [/sch/g, 'srr'],
  [/ch/g, 'rr'],
  [/g/g, 'rr'],
  [/ij|ei/g, 'éi'],
  [/ui/g, 'ãui'],
  [/oe/g, 'u'],
  [/ou|au/g, 'áu'],
  [/eeuw/g, 'êu'],
  [/ieuw/g, 'iu'],
  [/eu/g, 'êu'],
  [/ie/g, 'i'],
  [/aa/g, 'á'],
  [/ee/g, 'ê'],
  [/oo/g, 'ô'],
  [/uu/g, 'ü'],
  [/tj/g, 'tch'],
  [/nj/g, 'nh'],
  [/j/g, 'i'],
  [/w/g, 'v'],
  [/y/g, 'i'],
  [/c(?=[eiy])/g, 's'],
  [/c/g, 'k'],
  [/qu/g, 'kv'],
  [/x/g, 'ks'],
];

function approxWord(word: string): string {
  let w = word.toLowerCase().replace(/[^\p{L}']/gu, '');
  if (!w) return '';
  if (w === 'de') return 'de';
  if (w === 'het') return 'ât';
  if (w === 'een') return 'ân';
  // -tie no fim (informatie) soa «-tsi»; -en no fim perde muitas vezes o n.
  w = w.replace(/tie$/, 'tsi').replace(/([^aeiou])en$/, '$1e');
  // «u» sozinho (não ui/uu/eu/ou/au) soa como o «u» francês curto: escreve-se «ü».
  w = w.replace(/(?<![oeau])u(?![iu])/g, (_m, i: number) => (w[i - 1] === 'u' ? 'u' : 'ü'));
  for (const [re, rep] of RULES) w = w.replace(re, rep);
  // d no fim soa a t (goed → «rrut»).
  w = w.replace(/d$/, 't').replace(/r{3,}/g, 'rr');
  return w;
}

/** Ex.: «goed» → «rrut»; «dank je wel» → «dank ie vel»; «huis» → «hãuis». */
export function approxPronunciation(text: string): string {
  return text.split(/\s+/).map(approxWord).filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Palavras novas da lição (ainda não aprendidas): aparecem a roxo nos exercícios.
// ---------------------------------------------------------------------------
export interface NewWordSource {
  id: string;
  nl: string;
  pt: string[];
  article?: 'de' | 'het';
  plural?: string;
  note?: string;
}

const cleanNl = (nl: string) => nl.replace(/\s*\(.*?\)\s*/g, ' ').trim();

/** Diz se uma palavra (em qualquer forma: woont, katten…) é uma das palavras dadas. */
export function makeWordTest(words: readonly NewWordSource[]): (word: string) => boolean {
  const forms = new Set<string>();
  for (const v of words) {
    for (const w of wordsOf(cleanNl(v.nl))) forms.add(w);
    if (v.plural) forms.add(normalizeWord(v.plural));
  }
  return (word: string) => {
    const w = normalizeWord(word);
    // Palavras curtas (het, ik, is…) só pela forma exata: «het» não é uma forma de «heten».
    return !!w && (forms.has(w) || (w.length > 3 && lemmaCandidates(w).some((c) => forms.has(c))));
  };
}

/** Texto neerlandês visível num exercício (para saber que palavras usa). */
export function exerciseDutchText(ex: Exercise): string {
  switch (ex.type) {
    case 'translate': return ex.direction === 'nl-pt' ? ex.prompt : [...ex.answers, ...(ex.wordBank ?? [])].join(' ');
    case 'fillBlank': return [ex.sentence, ...ex.answers, ...(ex.choices ?? [])].join(' ');
    case 'buildSentence': return [...ex.tokens, ...ex.answers].join(' ');
    case 'wordOrder': return ex.tokens.join(' ');
    case 'match': return ex.pairs.map((p) => p.nl).join(' ');
    case 'findError': return [...ex.tokens, ex.correction].join(' ');
    case 'articleChoice': return ex.noun;
    case 'conjugation': return [ex.verb, ex.sentence ?? '', ...ex.answers].join(' ');
    case 'dialogue': return [...ex.lines.map((l) => l.nl), ...ex.options.map((o) => o.text)].join(' ');
    case 'comprehension': return ex.text;
    case 'listening': return ex.audioText;
    case 'expression': return ex.expression;
    case 'speaking': return ex.text;
    case 'multipleChoice': return [ex.prompt, ...ex.options.map((o) => o.text)].join(' ');
    case 'shortWriting': return ex.referenceAnswers.join(' ');
  }
}

/**
 * Palavras que o aluno vê pela PRIMEIRA vez neste exercício (nunca as acertou e ainda não
 * apareceram nesta sessão). O exercício mostra-as com o significado: é aí que se aprendem.
 */
export function wordsToIntroduce(ex: Exercise, unseen: readonly NewWordSource[], introduced: ReadonlySet<string>): NewWordSource[] {
  const text = wordsOf(exerciseDutchText(ex));
  return unseen.filter((v) => {
    if (introduced.has(v.id)) return false;
    if (ex.vocabRefs.includes(v.id)) return true;
    const target = wordsOf(cleanNl(v.nl));
    if (!target.length) return false;
    if (target.length > 1) return text.join(' ').includes(target.join(' '));
    return text.some(makeWordTest([v]));
  });
}

/**
 * Antes do primeiro exercício que usa uma palavra que o aluno nunca acertou, entra um exercício
 * «Palavra nova» com o significado à vista. Assim nenhuma pergunta usa uma palavra que nunca se viu.
 */
export function withIntroExercises(
  exercises: readonly Exercise[], unseen: readonly NewWordSource[],
  pool: readonly Pick<ReviewVocab, 'id' | 'nl' | 'pt' | 'article'>[], rnd: () => number,
): Exercise[] {
  const introduced = new Set<string>();
  const out: Exercise[] = [];
  for (const ex of exercises) {
    for (const w of wordsToIntroduce(ex, unseen, introduced)) {
      introduced.add(w.id);
      if (!ex.id.startsWith('intro-')) out.push(buildIntroExercise(w, pool, rnd));
    }
    out.push(ex);
  }
  return out;
}
