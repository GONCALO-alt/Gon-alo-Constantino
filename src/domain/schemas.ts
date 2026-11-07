/**
 * Esquemas de CONTEÚDO do curso (secções, unidades, lições, exercícios, vocabulário).
 *
 * São usados em três sítios:
 *  - nas ferramentas de autoria (validação, importação, compilação);
 *  - nos testes;
 *  - na aplicação, ao carregar ficheiros de conteúdo (defesa contra ficheiros corrompidos).
 *
 * O progresso do utilizador NÃO vive aqui (ver `progress.ts`).
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Identificadores estáveis
// ---------------------------------------------------------------------------
// Secção:  s1 … s7
// Unidade: s1-u01
// Lição:   s1-u01-l001  (nunca reutilizar um ID, mesmo que a lição seja apagada)
// Vocabulário: v-<palavra> (ex.: v-huis, v-goedemorgen); único em todo o curso
// Exercício: <lessonId>-e01
export const SectionId = z.string().regex(/^s[1-7]$/, 'ID de secção inválido (esperado s1…s7)');
export const UnitId = z.string().regex(/^s[1-7]-u\d{2}$/, 'ID de unidade inválido (esperado s1-u01)');
export const LessonId = z.string().regex(/^s[1-7]-u\d{2}-l\d{3}$/, 'ID de lição inválido (esperado s1-u01-l001)');
export const VocabId = z.string().regex(/^v-[a-z0-9-]+$/, 'ID de vocabulário inválido (esperado v-palavra)');
export const ExerciseId = z.string().regex(/^s[1-7]-u\d{2}-l\d{3}-e\d{2}$/, 'ID de exercício inválido');

export const Cefr = z.enum(['A1', 'A1-A2', 'A2', 'A2-B1', 'B1', 'B1-B2', 'B2']);
export type Cefr = z.infer<typeof Cefr>;

export const PublicationStatus = z.enum(['draft', 'approved', 'published', 'rejected']);
export type PublicationStatus = z.infer<typeof PublicationStatus>;

const nonEmpty = z.string().trim().min(1);

// ---------------------------------------------------------------------------
// Estrutura do curso
// ---------------------------------------------------------------------------
export const CourseUnitSchema = z.object({
  id: UnitId,
  sectionId: SectionId,
  order: z.number().int().positive(),
  title: nonEmpty,
  description: nonEmpty,
  cefr: Cefr,
  topics: z.array(nonEmpty).min(1),
  /** Unidades que têm de estar concluídas antes. Vazio = depende apenas da ordem. */
  prerequisites: z.array(UnitId).default([]),
  /** Número de lições previsto no plano (não o número já escrito). */
  plannedLessons: z.number().int().positive(),
});
export type CourseUnit = z.infer<typeof CourseUnitSchema>;

export const CourseSectionSchema = z.object({
  id: SectionId,
  order: z.number().int().min(1).max(7),
  title: nonEmpty,
  goal: nonEmpty,
  cefr: Cefr,
  plannedLessons: z.number().int().positive(),
  units: z.array(CourseUnitSchema).min(1),
});
export type CourseSection = z.infer<typeof CourseSectionSchema>;

export const CourseStructureSchema = z.object({
  courseId: z.literal('pt-nl'),
  structureVersion: z.number().int().positive(),
  sections: z.array(CourseSectionSchema).length(7),
});
export type CourseStructure = z.infer<typeof CourseStructureSchema>;

// ---------------------------------------------------------------------------
// Vocabulário e gramática
// ---------------------------------------------------------------------------
export const PartOfSpeech = z.enum([
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction',
  'article', 'numeral', 'interjection', 'expression', 'particle', 'determiner',
]);

export const VocabularyItemSchema = z.object({
  id: VocabId,
  /** Forma em neerlandês, sem artigo (o artigo vai em `article`). */
  nl: nonEmpty,
  /** Traduções aceites em português europeu; a primeira é a principal. */
  pt: z.array(nonEmpty).min(1),
  pos: PartOfSpeech,
  /** Só para substantivos. */
  article: z.enum(['de', 'het']).optional(),
  plural: z.string().optional(),
  /** Registo, notas de uso, falsos amigos, etc. */
  note: z.string().optional(),
  /** Ficheiro de áudio gravado (opcional). Sem ele, usa-se síntese de voz do sistema. */
  audio: z.string().optional(),
});
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;

export const GrammarNoteSchema = z.object({
  id: z.string().regex(/^g-[a-z0-9-]+$/),
  title: nonEmpty,
  /** Texto curto em PT-PT. Suporta **negrito** simples. */
  body: nonEmpty,
  examples: z.array(z.object({ nl: nonEmpty, pt: nonEmpty })).default([]),
  /** Comparação explícita com o português, quando útil. */
  contrastWithPt: z.string().optional(),
});
export type GrammarNote = z.infer<typeof GrammarNoteSchema>;

// ---------------------------------------------------------------------------
// Exercícios (união discriminada por `type`)
// ---------------------------------------------------------------------------
/**
 * Respostas aceites. Cada entrada pode usar uma mini-sintaxe de variantes:
 *   [a|b]  → alternativa obrigatória   ex.: "[Hoi|Hallo], ik ben Ana"
 *   (x)    → segmento opcional         ex.: "(Eu) sou de Portugal"
 * Ver `expandAnswerPattern` em engine/answers.ts.
 */
const Answers = z.array(nonEmpty).min(1);

const base = {
  id: ExerciseId,
  /** Enunciado em PT-PT. */
  instruction: nonEmpty,
  /** Explicação mostrada depois de responder. */
  explanation: nonEmpty,
  /** Vocabulário treinado (para a revisão espaçada). */
  vocabRefs: z.array(VocabId).default([]),
};

export const AnswerOptionSchema = z.object({
  id: z.string().regex(/^[a-z]$/),
  text: nonEmpty,
  correct: z.boolean(),
  /** Feedback específico quando o aluno escolhe esta opção. */
  feedback: z.string().optional(),
});
export type AnswerOption = z.infer<typeof AnswerOptionSchema>;

const Options = z.array(AnswerOptionSchema).min(2).max(6);

export const ExerciseSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('translate'),
    direction: z.enum(['nl-pt', 'pt-nl']),
    prompt: nonEmpty,
    answers: Answers,
    /** Se definido, mostra um banco de palavras em vez de teclado livre. */
    wordBank: z.array(nonEmpty).optional(),
  }),
  z.object({ ...base, type: z.literal('multipleChoice'), prompt: nonEmpty, options: Options }),
  z.object({
    ...base,
    type: z.literal('fillBlank'),
    /** Usa ___ para marcar o espaço. */
    sentence: nonEmpty.refine((s) => s.split('___').length === 2, 'A frase tem de ter exatamente um ___'),
    translation: z.string().optional(),
    answers: Answers,
    /** Opcional: escolher em vez de escrever. */
    choices: z.array(nonEmpty).optional(),
  }),
  z.object({
    ...base,
    type: z.literal('buildSentence'),
    prompt: nonEmpty,
    /** Peças disponíveis (inclui distratores). */
    tokens: z.array(nonEmpty).min(2),
    answers: Answers,
  }),
  z.object({
    ...base,
    type: z.literal('match'),
    pairs: z.array(z.object({ nl: nonEmpty, pt: nonEmpty })).min(3).max(6),
  }),
  z.object({
    ...base,
    type: z.literal('wordOrder'),
    translation: nonEmpty,
    /** Palavras na ordem correta principal. São baralhadas na apresentação. */
    tokens: z.array(nonEmpty).min(2),
    /** Outras ordens corretas (frase completa). */
    alternatives: z.array(nonEmpty).default([]),
  }),
  z.object({
    ...base,
    type: z.literal('findError'),
    tokens: z.array(nonEmpty).min(2),
    errorIndex: z.number().int().nonnegative(),
    correction: nonEmpty,
  }),
  z.object({
    ...base,
    type: z.literal('articleChoice'),
    noun: nonEmpty,
    pt: nonEmpty,
    article: z.enum(['de', 'het']),
  }),
  z.object({
    ...base,
    type: z.literal('conjugation'),
    verb: nonEmpty,
    pronoun: nonEmpty,
    tense: z.enum(['presente', 'passado-perfeito', 'passado-simples', 'futuro', 'imperativo']),
    sentence: z.string().optional(),
    answers: Answers,
  }),
  z.object({
    ...base,
    type: z.literal('dialogue'),
    lines: z.array(z.object({ speaker: nonEmpty, nl: z.string(), pt: z.string().optional() })).min(2),
    /** Índice da linha que o aluno completa (o seu `nl` deve ser vazio). */
    blankLine: z.number().int().nonnegative(),
    options: Options,
  }),
  z.object({
    ...base,
    type: z.literal('comprehension'),
    kind: z.enum(['text', 'dialogue']),
    title: z.string().optional(),
    text: nonEmpty,
    questions: z.array(z.object({ prompt: nonEmpty, options: Options })).min(1).max(5),
  }),
  z.object({
    ...base,
    type: z.literal('listening'),
    /** Texto lido pela síntese de voz (ou transcrição do áudio). */
    audioText: nonEmpty,
    audio: z.string().optional(),
    answers: Answers,
    translation: nonEmpty,
  }),
  z.object({
    ...base,
    type: z.literal('expression'),
    expression: nonEmpty,
    literal: z.string().optional(),
    prompt: nonEmpty,
    options: Options,
  }),
  z.object({
    ...base,
    /** Ler em voz alta: o reconhecimento de voz do navegador verifica se a frase foi percebida. */
    type: z.literal('speaking'),
    text: nonEmpty,
    translation: nonEmpty,
  }),
  z.object({
    ...base,
    type: z.literal('shortWriting'),
    prompt: nonEmpty,
    /** Respostas-modelo. Se o aluno escrever outra coisa, autoavalia com a ajuda das dicas. */
    referenceAnswers: Answers,
    checklist: z.array(nonEmpty).min(1),
    minWords: z.number().int().positive().default(3),
  }),
]);
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise['type'];
export type ExerciseOf<T extends ExerciseType> = Extract<Exercise, { type: T }>;

export const EXERCISE_TYPES = [
  'translate', 'multipleChoice', 'fillBlank', 'buildSentence', 'match', 'wordOrder', 'findError',
  'articleChoice', 'conjugation', 'dialogue', 'comprehension', 'listening', 'expression', 'shortWriting', 'speaking',
] as const satisfies readonly ExerciseType[];

// ---------------------------------------------------------------------------
// Lição
// ---------------------------------------------------------------------------
export const ProvenanceSchema = z.object({
  source: z.enum(['manual', 'ai', 'mixed', 'synthetic']),
  /** Ex.: nome do modelo e versão do prompt, quando gerado por IA. */
  generator: z.string().optional(),
  batchId: z.string().optional(),
  createdAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export const LessonSchema = z.object({
  id: LessonId,
  unitId: UnitId,
  /** Posição na unidade. As lições de prática ficam a meio (ex.: 3.5, a seguir à lição 3). */
  order: z.number().positive().multipleOf(0.5),
  title: nonEmpty,
  description: nonEmpty,
  cefr: Cefr,
  objectives: z.array(nonEmpty).min(1),
  /** Vocabulário NOVO introduzido nesta lição (definido aqui, referenciado noutras). */
  newVocabulary: z.array(VocabularyItemSchema).default([]),
  /** Vocabulário de lições anteriores reutilizado/revisto aqui. */
  reviewVocabulary: z.array(VocabId).default([]),
  examples: z.array(z.object({ nl: nonEmpty, pt: nonEmpty, note: z.string().optional() })).min(1),
  grammar: z.array(GrammarNoteSchema).default([]),
  exercises: z.array(ExerciseSchema).min(4).max(25),
  difficulty: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(2).max(12),
  status: PublicationStatus,
  version: z.number().int().positive(),
  provenance: ProvenanceSchema,
  /** Notas de revisão humana (não mostradas ao aluno). */
  reviewNotes: z.string().optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

/** Ficheiro de autoria: todas as lições de uma unidade. */
export const UnitLessonsFileSchema = z.object({
  unitId: UnitId,
  lessons: z.array(LessonSchema),
});
export type UnitLessonsFile = z.infer<typeof UnitLessonsFileSchema>;

// ---------------------------------------------------------------------------
// Formato COMPILADO servido à aplicação (public/content)
// ---------------------------------------------------------------------------
export const LessonSummarySchema = z.object({
  id: LessonId,
  order: z.number().int(),
  title: z.string(),
  difficulty: z.number().int(),
  estimatedMinutes: z.number().int(),
  version: z.number().int(),
});
export type LessonSummary = z.infer<typeof LessonSummarySchema>;

/** Índice leve: estrutura completa + IDs das lições publicadas (sem exercícios). */
export const CourseIndexSchema = z.object({
  courseId: z.literal('pt-nl'),
  structureVersion: z.number().int(),
  contentHash: z.string(),
  builtAt: z.string(),
  sections: z.array(
    CourseSectionSchema.omit({ units: true }).extend({
      units: z.array(
        CourseUnitSchema.extend({
          lessonIds: z.array(LessonId),
        }),
      ),
    }),
  ),
});
export type CourseIndex = z.infer<typeof CourseIndexSchema>;
export type IndexedUnit = CourseIndex['sections'][number]['units'][number];
export type IndexedSection = CourseIndex['sections'][number];

/** Pacote de uma unidade: carregado apenas quando o aluno abre essa unidade. */
export const UnitBundleSchema = z.object({
  unitId: UnitId,
  contentHash: z.string(),
  lessons: z.array(LessonSchema.omit({ status: true, reviewNotes: true, provenance: true })),
});
export type UnitBundle = z.infer<typeof UnitBundleSchema>;
export type PublishedLesson = UnitBundle['lessons'][number];

/** Vocabulário compacto de uma secção (para a revisão sem carregar todas as unidades). */
export const VocabBundleSchema = z.object({
  sectionId: SectionId,
  items: z.array(VocabularyItemSchema.extend({ lessonId: LessonId })),
});
export type VocabBundle = z.infer<typeof VocabBundleSchema>;
