// Instruções e correção dos materiais criados pela IA (flashcards, testes, correções).
// Código sem dependências do Node: usado pelo servidor e pela versão de demonstração (artefacto).

import type { QuestionKind, QuestionResult, TestQuestion } from '../../shared/types.ts';

export const DIFFICULTY_LABEL = { facil: 'fácil', medio: 'médio', dificil: 'difícil' } as const;
export type Difficulty = keyof typeof DIFFICULTY_LABEL;

export interface RawCards {
  title: string;
  cards: { front: string; back: string }[];
}

export interface RawTest {
  title: string;
  questions: {
    kind: QuestionKind;
    prompt: string;
    options: string[];
    correct_option: number;
    model_answer: string;
    explanation: string;
    points: number;
  }[];
}

export interface RawGrades {
  grades: { index: number; score: number; feedback: string }[];
}

/** Formatos JSON pedidos quando não há validação por esquema (versão de demonstração). */
export const JSON_FORMATS = {
  cards: '{"title": string, "cards": [{"front": string, "back": string}]}',
  test: '{"title": string, "questions": [{"kind": "escolha-multipla" | "verdadeiro-falso" | "resposta-curta" | "desenvolvimento", "prompt": string, "options": string[], "correct_option": number, "model_answer": string, "explanation": string, "points": number}]}',
  grades: '{"grades": [{"index": number, "score": number, "feedback": string}]}',
};

export function flashcardsPrompt(o: { count: number; subjectName: string; topic: string; yearLabel: string; source?: string }): string {
  return `Cria ${o.count} flashcards de ${o.subjectName}${o.topic ? ` sobre «${o.topic}»` : ''} para um estudante do ${o.yearLabel}.
Frente: uma pergunta ou conceito curto. Verso: a resposta, clara e curta (no máximo 2 frases). Sem repetições.
"title" é um título curto para o baralho.${o.source ? `\n\nUsa este resumo como base:\n"""\n${o.source.slice(0, 30000)}\n"""` : ''}`;
}

export function testPrompt(o: { subjectName: string; topic: string; yearLabel: string; count: number; difficulty: Difficulty; kinds: QuestionKind[] }): string {
  return `Cria um teste de preparação de ${o.subjectName} sobre «${o.topic}» para um estudante do ${o.yearLabel}.
- ${o.count} perguntas, dificuldade ${DIFFICULTY_LABEL[o.difficulty]}.
- Tipos permitidos (varia entre eles): ${o.kinds.join(', ')}.
- escolha-multipla: 4 opções em "options", só uma certa; "correct_option" é o índice (0 a 3) da opção certa.
- verdadeiro-falso: "options" = ["Verdadeiro", "Falso"]; "correct_option" = 0 ou 1.
- resposta-curta e desenvolvimento: "options" = [] e "correct_option" = -1.
- "model_answer": a resposta certa completa (para as perguntas abertas, os pontos que uma boa resposta deve ter).
- "explanation": porque é que essa é a resposta certa (1 a 3 frases).
- "points": 1 nas perguntas fechadas, 2 nas de resposta curta, 4 nas de desenvolvimento.
- "title": título curto do teste.`;
}

export function gradePrompt(title: string, open: { index: number; question: TestQuestion; answer: string }[]): string {
  return `Corrige as respostas abertas deste teste de preparação («${title}»). Para cada uma, dá uma pontuação entre 0 e a cotação (podes usar meios pontos) e um comentário curto, em «tu»: o que está certo, o que falta ou está errado, e como melhorar.

${open
  .map(
    ({ question, index, answer }) => `## Pergunta ${index} (cotação ${question.points})
${question.prompt}
Resposta-modelo: ${question.modelAnswer}
Resposta do estudante: ${answer.trim() || '(sem resposta)'}`,
  )
  .join('\n\n')}

Em "grades", "index" é o número da pergunta indicado acima.`;
}

const KINDS: QuestionKind[] = ['escolha-multipla', 'verdadeiro-falso', 'resposta-curta', 'desenvolvimento'];
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function normalizeCards(raw: Partial<RawCards> | null | undefined, count: number) {
  const list = Array.isArray(raw?.cards) ? raw!.cards : [];
  return list
    .map((c) => ({ front: str(c?.front).trim().slice(0, 500), back: str(c?.back).trim().slice(0, 2000) }))
    .filter((c) => c.front && c.back)
    .slice(0, count);
}

/** Valida e arruma as perguntas devolvidas pela IA (opções, resposta certa, cotação). */
export function normalizeQuestions(raw: Partial<RawTest> | null | undefined, count: number): TestQuestion[] {
  const list = Array.isArray(raw?.questions) ? raw!.questions : [];
  return list
    .slice(0, count)
    .map((x): TestQuestion => {
      const kind = KINDS.includes(x?.kind) ? x.kind : 'resposta-curta';
      const closed = kind === 'escolha-multipla' || kind === 'verdadeiro-falso';
      const rawOptions = Array.isArray(x?.options) ? x.options.map(str).filter(Boolean) : [];
      const options = kind === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : closed ? rawOptions.slice(0, 6) : [];
      const co = Number(x?.correct_option);
      const correct = closed && Number.isInteger(co) && co >= 0 && co < options.length ? co : closed ? 0 : -1;
      return {
        kind,
        prompt: str(x?.prompt).trim(),
        options,
        correctOption: correct,
        modelAnswer: str(x?.model_answer).trim(),
        explanation: str(x?.explanation).trim(),
        points: Math.min(10, Math.max(1, Math.round(Number(x?.points)) || 1)),
      };
    })
    .filter((x) => x.prompt && (x.kind === 'resposta-curta' || x.kind === 'desenvolvimento' || x.options.length >= 2));
}

/** Corrige as perguntas fechadas; as abertas ficam `null` (IA ou autoavaliação). */
export function gradeClosed(questions: TestQuestion[], answers: (string | number | null)[]): (QuestionResult | null)[] {
  return questions.map((question, i) => {
    if (question.kind === 'escolha-multipla' || question.kind === 'verdadeiro-falso') {
      const ok = answers[i] === question.correctOption;
      return {
        score: ok ? question.points : 0,
        max: question.points,
        correct: ok,
        feedback: ok ? 'Certo!' : `A resposta certa é: ${question.options[question.correctOption] ?? ''}.`,
      };
    }
    return null;
  });
}

export function applyGrades(questions: TestQuestion[], results: (QuestionResult | null)[], open: number[], raw: Partial<RawGrades> | null | undefined) {
  const grades = Array.isArray(raw?.grades) ? raw!.grades : [];
  for (const i of open) {
    const question = questions[i]!;
    const g = grades.find((x) => Number(x?.index) === i);
    const score = Math.min(question.points, Math.max(0, Math.round((Number(g?.score) || 0) * 2) / 2));
    results[i] = { score, max: question.points, correct: score >= question.points * 0.75, feedback: str(g?.feedback).trim() || 'Sem comentário.' };
  }
}
