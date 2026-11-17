// IA do Shoalmates — corre no SERVIDOR, com a API da Anthropic.
// A chave (ANTHROPIC_API_KEY) fica só no servidor; o browser nunca a vê.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const MODEL = process.env.AI_MODEL || 'claude-opus-5-5';

// Línguas da app -> nome usado nas instruções à IA
const LANGS = { pt: 'português de Portugal', en: 'English', es: 'español', fr: 'français' };
export const langName = lang => LANGS[lang] ?? LANGS.pt;

const system = lang => `És o explicador da app "Shoalmates", usada por alunos entre os 12 e os 18 anos.
Escreve todo o texto da resposta em ${langName(lang)}, de forma simples, simpática e correta, adequada à idade.
Baseia-te apenas no material que o aluno enviar e no conhecimento escolar normal. Nunca inventes factos.
Se o pedido não tiver a ver com estudo ou contiver algo impróprio para menores, recusa com simpatia.`;

// ---------- formatos de resposta ----------

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('Pergunta curta e clara (máx. 200 caracteres)'),
    options: z.array(z.string()).describe('Exatamente 4 respostas curtas (máx. 80 caracteres cada)'),
    answer: z.number().int().describe('Índice (0 a 3) da resposta certa'),
    topic: z.string().describe('Tema curto, ex.: "Fotossíntese"'),
    difficulty: z.number().int().describe('1 = fácil, 2 = média, 3 = difícil'),
  })),
  subject: z.string().describe('Disciplina do material, ex.: "Ciências Naturais"'),
});

const ExplainSchema = z.object({
  explanation: z.string().describe('Explicação em 2 a 3 frases curtas'),
});

const SummarySchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    points: z.array(z.string()),
  })),
  mustKnow: z.array(z.string()).describe('As 3 a 5 coisas mais importantes para o teste'),
});

const GradeSchema = z.object({
  estimate: z.number().int().describe('Percentagem estimada no teste (0 a 100)'),
  confidence: z.enum(['low', 'medium', 'high']),
  message: z.string().describe('1 frase de incentivo honesta'),
  strengths: z.array(z.string()),
  toImprove: z.array(z.string()),
  plan: z.array(z.string()).describe('Plano curto até ao teste, um passo por dia ou por sessão'),
});

// ---------- cliente ----------

export function aiEnabled() {
  return process.env.AI_MOCK === '1' || !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client = null;
const getClient = () => (client ??= new Anthropic());

export class AIError extends Error {}

async function ask(schema, content, { effort = 'medium', maxTokens = 16000, lang } = {}) {
  let res;
  try {
    res = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: maxTokens,
      system: system(lang),
      output_config: { effort, format: betaZodOutputFormat(schema) },
      // se o modelo recusar por segurança, a API tenta outro modelo automaticamente
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new AIError('ai_key');
    if (e instanceof Anthropic.RateLimitError) throw new AIError('ai_rate');
    if (e instanceof Anthropic.BadRequestError) throw new AIError('ai_unreadable');
    if (e instanceof Anthropic.APIError) throw new AIError('ai_failed');
    throw new AIError('ai_network');
  }
  if (res.stop_reason === 'refusal') throw new AIError('ai_refused');
  if (res.stop_reason === 'max_tokens' || !res.parsed_output) throw new AIError('ai_incomplete');
  return res.parsed_output;
}

// ---------- funções ----------

// Foto ou texto dos apontamentos -> perguntas de escolha múltipla
export async function generateQuestions({ image, text, count = 8, lang }) {
  if (process.env.AI_MOCK === '1') return mock.questions(count);
  const content = [];
  if (image) content.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } });
  content.push({
    type: 'text',
    text: `${text ? `Apontamentos do aluno:\n"""\n${text}\n"""\n\n` : ''}Cria ${count} perguntas de escolha múltipla sobre ${image ? 'o material da imagem' : 'estes apontamentos'}, para um duelo de quiz entre amigos.
Regras: 4 opções por pergunta, só uma certa, opções erradas plausíveis; mistura dificuldades (fácil, média, difícil); perguntas sobre o que é importante para um teste, não sobre pormenores sem interesse.
Se a imagem não tiver matéria escolar legível, devolve "questions" vazio.`,
  });
  const out = await ask(QuestionsSchema, content, { lang });
  const questions = out.questions
    .filter(q => q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length)
    .slice(0, count)
    .map(q => ({ ...q, options: q.options.slice(0, 4), difficulty: Math.min(3, Math.max(1, q.difficulty)) }))
    .filter(q => q.answer < q.options.length);
  return { subject: out.subject, questions };
}

// Explica porque é que a resposta escolhida está errada
export async function explainMistake({ question, options, answer, chosen, lang }) {
  if (process.env.AI_MOCK === '1') return mock.explain(options[answer]);
  const out = await ask(ExplainSchema, `Pergunta: ${question}
Opções: ${options.map((o, i) => `${'ABCD'[i]}) ${o}`).join('  ')}
Resposta certa: ${'ABCD'[answer]}) ${options[answer]}
${chosen == null ? 'O aluno não respondeu a tempo.' : `O aluno escolheu: ${'ABCD'[chosen]}) ${options[chosen]}`}

Explica em 2 a 3 frases curtas, como um bom explicador para alguém de 13 anos, porque é que a resposta certa é a certa${chosen == null ? '' : ' e qual foi o erro'}.`, { effort: 'low', maxTokens: 2000, lang });
  return out;
}

// Junta os apontamentos da sala num resumo de 1 página
export async function summarizeNotes(notes, lang) {
  if (process.env.AI_MOCK === '1') return mock.summary();
  const text = notes.map(n => `### ${n.title} (por ${n.author})\n${n.text}`).join('\n\n');
  return ask(SummarySchema, `Apontamentos da turma:\n"""\n${text}\n"""\n\nFaz um resumo de no máximo 1 página para estudar para o teste. Organiza por secções com pontos curtos. Corrige com cuidado qualquer erro que encontres nos apontamentos, sem inventar matéria nova.`, { lang });
}

// Estima a nota a partir do desempenho nos quizzes
export async function predictGrade({ perf, test, lang }) {
  if (process.env.AI_MOCK === '1') return mock.grade(perf);
  const topics = Object.entries(perf.byTopic).map(([t, v]) => `- ${t}: ${v.right}/${v.total} certas`).join('\n') || '- (sem dados por tema)';
  const wrong = perf.wrong.map(w => `- "${w.question}" (certa: ${w.correct})`).join('\n') || '- nenhuma';
  return ask(GradeSchema, `Dados de estudo de um aluno nesta sala:
- Teste: ${test ? `${test.subject}, daqui a ${test.daysLeft} dia(s)` : 'sem teste marcado'}
- Minutos de foco: ${perf.minutes} em ${perf.sessions} sessões
- Respostas nos quizzes: ${perf.answered} (${perf.accuracy ?? '-'}% certas)
Por tema:
${topics}
Perguntas que errou:
${wrong}

Estima a percentagem que este aluno teria se o teste fosse hoje. Sê honesto: com poucos dados, a confiança é baixa.
Indica pontos fortes, o que melhorar e um plano curto e realista até ao teste.`, { maxTokens: 4000, lang });
}

// ---------- tutor (o chat principal) ----------
// Conversa livre para ajudar a estudar. A resposta chega aos bocados (streaming) para aparecer enquanto é escrita.

const TUTOR_RULES = `Agora és o tutor pessoal do aluno na app: o chat principal do Shoalmates.
Como ajudas:
- Explica passo a passo, com exemplos simples do dia a dia. Respostas curtas (até ~150 palavras), a não ser que o aluno peça mais.
- Nos trabalhos de casa, não dês só a resposta final: guia o aluno com pistas e perguntas, e mostra o raciocínio. Se ele já tentou e pede a solução, mostra-a explicada.
- Podes fazer mini-quizzes, resumos, planos de estudo e truques para memorizar.
- Usa listas e **negrito** com moderação. Para matemática, escreve as contas em texto simples (ex.: 3/4 + 1/2 = 5/4).
- Se a pergunta não tiver nada a ver com estudo, responde numa frase simpática e volta ao estudo.
- Nunca peças dados pessoais (morada, escola, telefone, fotos da cara). Se o aluno os partilhar, diz-lhe com simpatia para não o fazer.
- Se o aluno disser que está muito triste, ansioso, em perigo ou a ser magoado, responde com carinho, sugere falar com um adulto de confiança (pais, professor, psicólogo da escola) e, em Portugal, a linha SOS Criança 116 111.`;

export async function tutorStream({ messages, lang, image, context, onText }) {
  if (process.env.AI_MOCK === '1') return mock.tutor(messages, onText);
  const msgs = messages.map((m, i) => {
    const last = i === messages.length - 1;
    if (last && image) {
      return { role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
        { type: 'text', text: m.content || 'Ajuda-me com isto.' },
      ] };
    }
    return { role: m.role, content: m.content };
  });
  let final;
  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 8000,
      system: `${system(lang)}\n\n${TUTOR_RULES}${context ? `\n\nSobre este aluno: ${context}` : ''}`,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: msgs,
    });
    stream.on('text', delta => onText?.(delta));
    final = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new AIError('ai_key');
    if (e instanceof Anthropic.RateLimitError) throw new AIError('ai_rate');
    if (e instanceof Anthropic.BadRequestError) throw new AIError('ai_unreadable');
    if (e instanceof Anthropic.APIError) throw new AIError('ai_failed');
    throw new AIError('ai_network');
  }
  if (final.stop_reason === 'refusal') throw new AIError('ai_refused');
  return final.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

// ---------- respostas falsas para testar sem chave (AI_MOCK=1) ----------
const mock = {
  questions: n => ({
    subject: 'Ciências (teste)',
    questions: Array.from({ length: n }, (_, i) => ({
      question: `Pergunta de teste ${i + 1}: quanto é ${i + 2} × 2?`,
      options: [`${(i + 2) * 2}`, `${(i + 2) * 2 + 1}`, `${i + 2}`, `${(i + 2) * 3}`],
      answer: 0, topic: i % 2 ? 'Multiplicação' : 'Tabuada', difficulty: (i % 3) + 1,
    })),
  }),
  explain: right => ({ explanation: `(modo de teste) A resposta certa é "${right}". Revê esta parte da matéria.` }),
  summary: () => ({ title: 'Resumo (modo de teste)', sections: [{ heading: 'Ideias principais', points: ['Ponto 1', 'Ponto 2'] }], mustKnow: ['Isto é um resumo de teste.'] }),
  async tutor(messages, onText) {
    const q = messages.at(-1)?.content ?? '';
    const text = `(modo de teste) Boa pergunta! Perguntaste: "${q.slice(0, 80)}". Vamos por partes: 1) lê o enunciado, 2) sublinha o que é pedido, 3) tenta um exemplo simples.`;
    for (const w of text.split(/(?<= )/)) { onText?.(w); await new Promise(r => setTimeout(r, 5)); }
    return text;
  },
  grade: perf => ({
    estimate: perf.accuracy ?? 50, confidence: perf.answered > 20 ? 'medium' : 'low',
    message: '(modo de teste) Continua assim!', strengths: ['Tabuada'], toImprove: ['Multiplicação'], plan: ['Faz mais um duelo hoje.'],
  }),
};
