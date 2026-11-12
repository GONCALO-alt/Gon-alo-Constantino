// Instruções para a IA e validação das respostas das funções com fotos e da correção de redações.
// Sem dependências de servidor, para ser usado por todas as versões do núcleo (e testado).

import { addDays, isISODate } from '../shared/dates';
import {
  ESSAY_KIND_LABELS, type CalendarProposal, type EssayError, type EssayErrorType, type EssayKind, type EssayReview, type EventType,
} from '../shared/types';

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v));

// ---------- fotos da matéria ----------

export const JSON_NOTES = '{"readable": boolean, "title": string, "topic": string, "content": string}';
export type RawNotes = { readable?: unknown; title?: unknown; topic?: unknown; content?: unknown };

export function photoNotesPrompt(o: { subjectName: string; yearLabel: string }): string {
  return `Estas fotografias são páginas de um livro, caderno ou ficha de ${o.subjectName} de um estudante do ${o.yearLabel}.
Lê com atenção todo o texto, as fórmulas e os esquemas e transforma a matéria num resumo de estudo em português de Portugal:
- "content": Markdown com títulos (##), listas e **negrito** nos conceitos importantes; fórmulas em LaTeX entre $...$. Fiel ao que está nas fotos, completo, sem inventar matéria que não está lá. Se houver exercícios, explica o método em vez de os resolver todos.
- "title": título curto do resumo. "topic": o tema principal, em poucas palavras.
- "readable": false se as fotos não tiverem matéria legível (desfocadas, escuras ou sem texto); nesse caso "content" fica vazio.`;
}

export function normalizeNotes(raw: RawNotes | null | undefined): { title: string; topic: string; content: string } | null {
  const content = str(raw?.content, 40000);
  if (raw?.readable === false || content.length < 40) return null;
  const topic = str(raw?.topic, 200) || str(raw?.title, 200) || 'Matéria das fotografias';
  return { title: str(raw?.title, 140) || topic, topic, content };
}

// ---------- calendário de testes ----------

export const JSON_CALENDAR =
  '{"events": [{"date": "AAAA-MM-DD", "subject": string | null, "type": "teste" | "trabalho" | "outro", "title": string, "notes": string}]}';
export type RawCalendar = { events?: unknown };

export function calendarPrompt(o: { today: string; subjects: { id: string; name: string }[] }): string {
  const year = Number(o.today.slice(0, 4));
  const schoolStart = Number(o.today.slice(5, 7)) >= 8 ? year : year - 1;
  return `Esta fotografia mostra um calendário, uma lista ou um horário com datas de testes, fichas ou trabalhos de um estudante.
Hoje é ${o.today}. As datas sem ano são do ano letivo de setembro de ${schoolStart} a julho de ${schoolStart + 1}.
Encontra todas as avaliações e devolve uma entrada por cada:
- "date": a data no formato AAAA-MM-DD.
- "subject": o identificador da disciplina, escolhido desta lista (ou null se não corresponder a nenhuma): ${o.subjects.map((s) => `${s.id} = ${s.name}`).join('; ')}.
- "type": "teste" (testes, fichas de avaliação, exames, questões-aula), "trabalho" (trabalhos, apresentações, entregas) ou "outro".
- "title": curto, por exemplo «Teste de Matemática» ou «Apresentação de História».
- "notes": a matéria ou outras indicações que apareçam (ou "").
Não inventes datas: se não houver nenhuma avaliação legível, devolve "events": [].`;
}

export function normalizeCalendar(raw: RawCalendar | null | undefined, subjectIds: string[], today: string): CalendarProposal[] {
  const list = Array.isArray(raw?.events) ? (raw!.events as Record<string, unknown>[]) : [];
  const types: EventType[] = ['teste', 'trabalho', 'outro'];
  const min = addDays(today, -30);
  const max = addDays(today, 400);
  const seen = new Set<string>();
  const out: CalendarProposal[] = [];
  for (const e of list.slice(0, 60)) {
    const date = str(e?.date, 10);
    if (!isISODate(date) || date < min || date > max) continue;
    const subject = typeof e?.subject === 'string' && subjectIds.includes(e.subject) ? e.subject : null;
    const type = types.includes(e?.type as EventType) ? (e.type as EventType) : 'teste';
    const title = str(e?.title, 120) || (type === 'teste' ? 'Teste' : type === 'trabalho' ? 'Trabalho' : 'Avaliação');
    const key = `${date}|${subject}|${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ date, subject, type, title, notes: str(e?.notes, 500) });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- correção de redações ----------

export const ESSAY_KINDS = Object.keys(ESSAY_KIND_LABELS) as EssayKind[];

export const JSON_ESSAY =
  '{"transcription": string, "title": string, "grade": number, "level": string, "summary": string, ' +
  '"criteria": [{"name": string, "score": number, "max": number, "comment": string}], ' +
  '"errors": [{"original": string, "correction": string, "explanation": string, "type": "ortografia" | "acentuação" | "pontuação" | "gramática" | "vocabulário" | "estrutura"}], ' +
  '"strengths": string[], "improvements": string[], "improved": string}';
export type RawEssay = Record<string, unknown>;

export function essayPrompt(o: { kind: EssayKind; theme: string; yearLabel: string; text: string; fromPhoto: boolean }): string {
  return `És um professor de Português (de Portugal) experiente, justo e encorajador. Corrige esta redação de um estudante do ${o.yearLabel}.
Tipo de texto pedido: ${ESSAY_KIND_LABELS[o.kind]}.${o.theme ? `\nTema / enunciado: ${o.theme}` : ''}
Segue o Acordo Ortográfico de 1990 e o português europeu (não o do Brasil). Adapta a exigência ao ano escolar.
${o.fromPhoto ? 'A redação está nas fotografias (escrita à mão ou impressa): primeiro transcreve-a exatamente em "transcription", sem corrigir nada.' : '"transcription": "" (o texto já está escrito abaixo).'}
Avalia com estes critérios (a soma dos máximos é 20):
1. Tema e tipo de texto (adequação ao tema e às características do tipo pedido) — 5 pontos
2. Estrutura e coesão (introdução, desenvolvimento, conclusão, parágrafos, conectores) — 5 pontos
3. Correção linguística (ortografia, acentuação, pontuação, concordâncias) — 5 pontos
4. Vocabulário e expressividade (riqueza, adequação, repetições) — 3 pontos
5. Ideias e argumentação (ou criatividade, num texto narrativo) — 2 pontos
- "grade": a soma (0 a 20, pode ter meio ponto). "level": «Insuficiente» (<10), «Suficiente» (10–13), «Bom» (14–16) ou «Muito bom» (17–20).
- "summary": apreciação geral em 2–3 frases, dirigida ao estudante (tu).
- "errors": os erros mais importantes (no máximo 20), com "original" copiado exatamente do texto, a "correction" e uma "explanation" curta e simples.
- "strengths": 2–4 pontos fortes. "improvements": 2–5 conselhos concretos para a próxima redação.
- "improved": uma versão melhorada da redação em Markdown, que mantém as ideias e a voz do estudante (não escrevas um texto novo).
- "title": título curto (o da redação ou um que resuma o tema).
${o.fromPhoto ? '' : `\nRedação:\n"""\n${o.text.slice(0, 12000)}\n"""`}`;
}

const ERROR_TYPES: EssayErrorType[] = ['ortografia', 'acentuação', 'pontuação', 'gramática', 'vocabulário', 'estrutura'];
const levelOf = (g: number) => (g < 10 ? 'Insuficiente' : g < 14 ? 'Suficiente' : g < 17 ? 'Bom' : 'Muito bom');
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function normalizeEssay(raw: RawEssay | null | undefined, text: string): { review: EssayReview; title: string; transcription: string } {
  const r = raw ?? {};
  const transcription = str(r.transcription, 20000);
  const body = text || transcription;
  const criteria = (Array.isArray(r.criteria) ? r.criteria : []).slice(0, 8).map((c: Record<string, unknown>) => {
    const max = Math.max(1, Math.min(20, num(c?.max) || 4));
    return { name: str(c?.name, 80) || 'Critério', max, score: Math.max(0, Math.min(max, Math.round((num(c?.score) || 0) * 2) / 2)), comment: str(c?.comment, 600) };
  });
  const fromCriteria = criteria.reduce((a, c) => a + c.score, 0);
  let grade = num(r.grade);
  if (!Number.isFinite(grade)) grade = fromCriteria;
  grade = Math.max(0, Math.min(20, Math.round(grade * 2) / 2));
  const errors: EssayError[] = (Array.isArray(r.errors) ? r.errors : [])
    .slice(0, 20)
    .map((e: Record<string, unknown>) => ({
      original: str(e?.original, 300),
      correction: str(e?.correction, 300),
      explanation: str(e?.explanation, 400),
      type: ERROR_TYPES.includes(e?.type as EssayErrorType) ? (e.type as EssayErrorType) : 'gramática',
    }))
    .filter((e) => e.original && e.correction && e.original !== e.correction);
  const list = (v: unknown, n: number) => (Array.isArray(v) ? v.map((x) => str(x, 400)).filter(Boolean).slice(0, n) : []);
  return {
    title: str(r.title, 120) || 'Redação',
    transcription,
    review: {
      grade,
      level: levelOf(grade),
      summary: str(r.summary, 1200),
      criteria,
      errors,
      strengths: list(r.strengths, 5),
      improvements: list(r.improvements, 6),
      improved: str(r.improved, 20000),
      wordCount: countWords(body),
    },
  };
}
