/**
 * Validação de conteúdo. Função pura: recebe a estrutura e os ficheiros de lições
 * (já lidos do disco) e devolve erros e avisos com localização.
 *
 * Erros bloqueiam a importação/publicação. Avisos exigem atenção humana.
 * IMPORTANTE: passar na validação NÃO significa que o neerlandês ou o português
 * estão corretos — isso exige revisão humana (ver docs/REVISAO_CONTEUDO.md).
 */
import {
  CourseStructureSchema, UnitLessonsFileSchema,
  type CourseStructure, type Exercise, type Lesson, type UnitLessonsFile,
} from '../../src/domain/schemas.ts';
import { expandAnswerPattern, joinTokens, normalize } from '../../src/engine/answers.ts';
import { exerciseKey, findSimilar, lessonKey } from './similarity.ts';

export interface Issue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

export interface ValidationReport {
  errors: Issue[];
  warnings: Issue[];
  stats: { lessons: number; exercises: number; vocabulary: number; byStatus: Record<string, number> };
}

export interface ValidateOptions {
  /** Desativa a análise de semelhança (mais rápida). */
  skipSimilarity?: boolean;
  similarityThreshold?: number;
}

/** "A1-A2" é compatível com A1, A2 e A1-A2; "A2" é compatível com A1-A2 e A2-B1. */
export function cefrCompatible(lesson: string, unit: string): boolean {
  const a = new Set(lesson.split('-'));
  return unit.split('-').some((x) => a.has(x));
}

function zodIssues(where: string, err: { issues: { path: PropertyKey[]; message: string }[] }): Issue[] {
  return err.issues.slice(0, 20).map((i) => ({ level: 'error', where: `${where}${i.path.length ? ' → ' + i.path.map(String).join('.') : ''}`, message: i.message }));
}

export function validateStructure(raw: unknown): { structure?: CourseStructure; issues: Issue[] } {
  const parsed = CourseStructureSchema.safeParse(raw);
  if (!parsed.success) return { issues: zodIssues('course.json', parsed.error) };
  const s = parsed.data;
  const issues: Issue[] = [];
  const unitIds = new Set<string>();
  const order: string[] = [];
  s.sections.forEach((sec, i) => {
    if (sec.id !== `s${i + 1}` || sec.order !== i + 1) issues.push({ level: 'error', where: sec.id, message: 'Secções têm de estar por ordem s1…s7.' });
    const planned = sec.units.reduce((n, u) => n + u.plannedLessons, 0);
    if (planned !== sec.plannedLessons) issues.push({ level: 'warning', where: sec.id, message: `Soma das unidades (${planned}) ≠ plannedLessons da secção (${sec.plannedLessons}).` });
    sec.units.forEach((u, j) => {
      if (u.sectionId !== sec.id) issues.push({ level: 'error', where: u.id, message: `sectionId "${u.sectionId}" não corresponde à secção ${sec.id}.` });
      if (!u.id.startsWith(sec.id + '-')) issues.push({ level: 'error', where: u.id, message: 'O ID da unidade tem de começar pelo ID da secção.' });
      if (u.order !== j + 1) issues.push({ level: 'error', where: u.id, message: `Ordem ${u.order} inesperada (esperado ${j + 1}).` });
      if (unitIds.has(u.id)) issues.push({ level: 'error', where: u.id, message: 'ID de unidade duplicado.' });
      for (const p of u.prerequisites) {
        if (!unitIds.has(p)) issues.push({ level: 'error', where: u.id, message: `Pré-requisito "${p}" não existe ou não vem antes desta unidade.` });
      }
      unitIds.add(u.id);
      order.push(u.id);
    });
  });
  return { structure: s, issues };
}

/** Verificações internas de um exercício (coerência das respostas). */
export function checkExercise(ex: Exercise): string[] {
  const p: string[] = [];
  const checkOptions = (opts: readonly { id: string; text: string; correct: boolean }[], label = 'opções') => {
    if (!opts.some((o) => o.correct)) p.push(`Nenhuma das ${label} está marcada como correta.`);
    if (new Set(opts.map((o) => o.id)).size !== opts.length) p.push(`IDs de ${label} repetidos.`);
    if (new Set(opts.map((o) => normalize(o.text))).size !== opts.length) p.push(`Textos de ${label} repetidos.`);
  };
  const answersOk = (answers: readonly string[]) => {
    for (const a of answers) {
      if ((a.match(/\[/g) ?? []).length !== (a.match(/\]/g) ?? []).length || (a.match(/\(/g) ?? []).length !== (a.match(/\)/g) ?? []).length) {
        p.push(`Resposta com parênteses desequilibrados: "${a}".`);
      }
      if (expandAnswerPattern(a).length === 0) p.push(`Resposta vazia depois de expandir: "${a}".`);
    }
  };
  /** As peças disponíveis permitem construir pelo menos uma resposta aceite? */
  const tokensCover = (tokens: readonly string[], answers: readonly string[]) => {
    const bag = new Map<string, number>();
    for (const t of tokens) bag.set(normalize(t), (bag.get(normalize(t)) ?? 0) + 1);
    const ok = answers.flatMap(expandAnswerPattern).some((ans) => {
      const need = new Map<string, number>();
      for (const w of normalize(ans).split(' ')) need.set(w, (need.get(w) ?? 0) + 1);
      return [...need].every(([w, n]) => (bag.get(w) ?? 0) >= n);
    });
    if (!ok) p.push('As peças disponíveis não permitem construir nenhuma resposta aceite.');
  };

  switch (ex.type) {
    case 'translate':
      answersOk(ex.answers);
      if (ex.wordBank) tokensCover(ex.wordBank, ex.answers);
      if (ex.answers.some((a) => normalize(a) === normalize(ex.prompt))) p.push('A resposta é igual ao enunciado.');
      break;
    case 'listening':
    case 'conjugation':
      answersOk(ex.answers);
      break;
    case 'fillBlank':
      answersOk(ex.answers);
      if (ex.choices) {
        const choices = ex.choices.map((c) => normalize(c));
        if (!ex.answers.flatMap(expandAnswerPattern).some((a) => choices.includes(normalize(a)))) p.push('Nenhuma das escolhas é uma resposta aceite.');
        if (new Set(choices).size !== choices.length) p.push('Escolhas repetidas.');
      }
      break;
    case 'buildSentence':
      answersOk(ex.answers);
      tokensCover(ex.tokens, ex.answers);
      break;
    case 'wordOrder': {
      const shuffledSame = new Set(ex.tokens.map((t) => normalize(t)));
      if (shuffledSame.size < 2) p.push('A ordenação precisa de pelo menos duas palavras diferentes.');
      for (const alt of ex.alternatives) {
        const a = normalize(alt).split(' ').sort().join(' ');
        const b = normalize(joinTokens(ex.tokens)).split(' ').sort().join(' ');
        if (a !== b) p.push(`A alternativa "${alt}" não usa exatamente as mesmas palavras.`);
      }
      break;
    }
    case 'findError':
      if (ex.errorIndex >= ex.tokens.length) p.push('errorIndex fora do intervalo.');
      else if (normalize(ex.tokens[ex.errorIndex]!) === normalize(ex.correction)) p.push('A correção é igual à palavra errada.');
      break;
    case 'match':
      if (new Set(ex.pairs.map((x) => normalize(x.nl))).size !== ex.pairs.length) p.push('Palavras neerlandesas repetidas nos pares.');
      if (new Set(ex.pairs.map((x) => normalize(x.pt))).size !== ex.pairs.length) p.push('Traduções repetidas nos pares (associação ambígua).');
      break;
    case 'multipleChoice':
    case 'expression':
      checkOptions(ex.options);
      break;
    case 'dialogue':
      checkOptions(ex.options);
      if (ex.blankLine >= ex.lines.length) p.push('blankLine fora do intervalo.');
      else if (ex.lines[ex.blankLine]!.nl.trim() !== '') p.push('A linha a completar deve ter "nl" vazio.');
      ex.lines.forEach((l, i) => { if (i !== ex.blankLine && !l.nl.trim()) p.push(`Linha ${i} do diálogo está vazia.`); });
      break;
    case 'comprehension':
      ex.questions.forEach((q, i) => checkOptions(q.options, `opções da pergunta ${i + 1}`));
      break;
    case 'shortWriting':
      answersOk(ex.referenceAnswers);
      break;
    case 'articleChoice':
      break;
  }
  return p;
}

/**
 * Valida a estrutura e todas as lições.
 * `files` = conteúdo bruto de cada content/lessons/<unitId>.json, com o nome do ficheiro.
 */
export function validateContent(
  structureRaw: unknown,
  files: readonly { name: string; data: unknown }[],
  opts: ValidateOptions = {},
): ValidationReport {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const push = (i: Issue) => (i.level === 'error' ? errors : warnings).push(i);

  const { structure, issues } = validateStructure(structureRaw);
  issues.forEach(push);
  const units = new Map(structure?.sections.flatMap((s) => s.units.map((u) => [u.id, u] as const)) ?? []);
  const unitOrder = new Map([...units.keys()].map((id, i) => [id, i]));

  const parsedFiles: UnitLessonsFile[] = [];
  for (const f of files) {
    const r = UnitLessonsFileSchema.safeParse(f.data);
    if (!r.success) {
      zodIssues(f.name, r.error).forEach(push);
      continue;
    }
    if (f.name.replace(/\.json$/, '').split('/').pop() !== r.data.unitId) push({ level: 'error', where: f.name, message: `O nome do ficheiro deve ser ${r.data.unitId}.json.` });
    if (structure && !units.has(r.data.unitId)) push({ level: 'error', where: f.name, message: `Unidade "${r.data.unitId}" não existe em course.json.` });
    parsedFiles.push(r.data);
  }

  // Ordem global (unidade, ordem) para verificar que o vocabulário é introduzido antes de ser usado.
  const allLessons = parsedFiles
    .flatMap((f) => f.lessons.map((l) => ({ l, file: f.unitId })))
    .sort((a, b) => (unitOrder.get(a.l.unitId) ?? 0) - (unitOrder.get(b.l.unitId) ?? 0) || a.l.order - b.l.order);

  const lessonIds = new Map<string, string>();
  const vocabDefs = new Map<string, { lessonId: string; pos: number; nl: string; status: string }>();
  const byStatus: Record<string, number> = {};
  let exerciseCount = 0;

  allLessons.forEach(({ l, file }, pos) => {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    exerciseCount += l.exercises.length;
    const where = l.id;
    if (lessonIds.has(l.id)) push({ level: 'error', where, message: `ID de lição duplicado (também em ${lessonIds.get(l.id)}).` });
    lessonIds.set(l.id, file);
    if (l.unitId !== file) push({ level: 'error', where, message: `A lição diz pertencer a ${l.unitId} mas está no ficheiro ${file}.` });
    if (!l.id.startsWith(l.unitId + '-')) push({ level: 'error', where, message: 'O ID da lição tem de começar pelo ID da unidade.' });
    const unit = units.get(l.unitId);
    if (unit && !cefrCompatible(l.cefr, unit.cefr)) {
      push({ level: 'warning', where, message: `Nível ${l.cefr} pouco compatível com a unidade (${unit.cefr}).` });
    }
    const totalTime = l.estimatedMinutes;
    if (l.exercises.length > 18 || totalTime > 8) push({ level: 'warning', where, message: 'Lição possivelmente demasiado longa (alvo: 3–8 minutos).' });

    for (const v of l.newVocabulary) {
      const prev = vocabDefs.get(v.id);
      if (prev) push({ level: 'error', where, message: `Vocabulário "${v.id}" já foi definido em ${prev.lessonId}. Use reviewVocabulary.` });
      else vocabDefs.set(v.id, { lessonId: l.id, pos, nl: v.nl, status: l.status });
      if (v.pos === 'noun' && !v.article && !/^[A-Z]/.test(v.nl) && !v.note?.includes('sem artigo')) push({ level: 'warning', where, message: `Substantivo "${v.nl}" sem artigo (de/het).` });
    }

    const exIds = new Set<string>();
    const keys = new Map<string, string>();
    l.exercises.forEach((ex, i) => {
      const w = `${where} → exercício ${i + 1} (${ex.type})`;
      if (!ex.id.startsWith(l.id + '-')) push({ level: 'error', where: w, message: 'O ID do exercício tem de começar pelo ID da lição.' });
      if (exIds.has(ex.id)) push({ level: 'error', where: w, message: `ID de exercício duplicado: ${ex.id}.` });
      exIds.add(ex.id);
      const k = normalize(`${ex.type}|${exerciseKey(ex)}`);
      if (keys.has(k)) push({ level: 'error', where: w, message: `Exercício repetido dentro da lição (igual a ${keys.get(k)}).` });
      keys.set(k, ex.id);
      for (const msg of checkExercise(ex)) push({ level: 'error', where: w, message: msg });
    });
    const types = new Set(l.exercises.map((e) => e.type));
    if (types.size < 3) push({ level: 'warning', where, message: 'Pouca variedade de exercícios (menos de 3 tipos).' });
  });

  // Referências de vocabulário (depois de conhecer todas as definições).
  allLessons.forEach(({ l }, pos) => {
    const refs = new Set([...l.reviewVocabulary, ...l.exercises.flatMap((e) => e.vocabRefs)]);
    for (const ref of refs) {
      const def = vocabDefs.get(ref);
      if (!def) push({ level: 'error', where: l.id, message: `Vocabulário "${ref}" não está definido em nenhuma lição.` });
      else if (def.pos > pos) push({ level: 'warning', where: l.id, message: `Usa "${ref}" antes de ser introduzido (em ${def.lessonId}).` });
      else if (l.status === 'published' && def.status !== 'published') push({ level: 'error', where: l.id, message: `Lição publicada depende de "${ref}", definido numa lição não publicada (${def.lessonId}).` });
    }
  });

  // Ordem das lições dentro de cada unidade.
  for (const f of parsedFiles) {
    const orders = f.lessons.map((l) => l.order);
    if (new Set(orders).size !== orders.length) push({ level: 'error', where: f.unitId, message: 'Há lições com a mesma posição (order) na unidade.' });
    const unit = units.get(f.unitId);
    const active = f.lessons.filter((l) => l.status !== 'rejected').length;
    if (unit && active > unit.plannedLessons) push({ level: 'warning', where: f.unitId, message: `A unidade tem ${active} lições, acima do previsto (${unit.plannedLessons}).` });
  }

  // Semelhança: lições inteiras (todo o curso) e exercícios dentro da mesma unidade.
  // Repetir um exercício noutra unidade pode ser revisão intencional, por isso não é sinalizado.
  if (!opts.skipSimilarity) {
    const active = allLessons.map((x) => x.l).filter((l) => l.status !== 'rejected');
    for (const pair of findSimilar(active.map((l) => ({ id: l.id, text: lessonKey(l) })), opts.similarityThreshold ?? 0.8, 'word')) {
      push({ level: 'warning', where: pair.a, message: `Lição muito semelhante a ${pair.b} (${Math.round(pair.score * 100)}%).` });
    }
    const byUnit = new Map<string, { id: string; text: string }[]>();
    for (const l of active) {
      const list = byUnit.get(l.unitId) ?? [];
      for (const e of l.exercises) if (e.type !== 'articleChoice' && e.type !== 'match') list.push({ id: e.id, text: `${e.type}|${exerciseKey(e)}` });
      byUnit.set(l.unitId, list);
    }
    for (const list of byUnit.values()) {
      for (const pair of findSimilar(list, opts.similarityThreshold ?? 0.92)) {
        if (pair.a.slice(0, 11) === pair.b.slice(0, 11)) continue; // mesma lição: já verificado acima
        push({ level: 'warning', where: pair.a, message: `Exercício muito semelhante a ${pair.b} (${Math.round(pair.score * 100)}%).` });
      }
    }
  }

  return { errors, warnings, stats: { lessons: allLessons.length, exercises: exerciseCount, vocabulary: vocabDefs.size, byStatus } };
}

/** Ajuda para ferramentas: todas as lições de todos os ficheiros. */
export function flattenLessons(files: readonly UnitLessonsFile[]): Lesson[] {
  return files.flatMap((f) => f.lessons);
}
