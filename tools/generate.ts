/**
 * Geração de RASCUNHOS de lições com IA (Claude, através da API da Anthropic).
 *
 *   node tools/generate.ts --unit s1-u03 --from 1 --count 5 [--topic "…"] [--prompt-only]
 *
 * Garantias:
 *  - Corre só na máquina do autor (Node). A chave ANTHROPIC_API_KEY vem do ambiente
 *    e nunca entra no frontend, no repositório nem no pacote distribuído.
 *  - Retomável: cada lição gerada é gravada de imediato no ficheiro do lote
 *    (content/drafts/<lote>.json). Correr outra vez salta as que já existem.
 *  - Nada é publicado: o lote é importado como "draft" (npm run content:import)
 *    e tem de ser revisto, aprovado e publicado por uma pessoa.
 *  - --prompt-only não chama a API (custo zero): escreve os pedidos em ficheiros
 *    de texto para usar manualmente noutra ferramenta.
 */
import Anthropic from '@anthropic-ai/sdk';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CourseStructureSchema, LessonSchema, type Lesson } from '../src/domain/schemas.ts';
import { PATHS, readJson, readLessonFiles, writeJson } from './lib/io.ts';
import { checkExercise } from './lib/validate.ts';

const PROMPT_VERSION = 'gen-v1';
// Preços por milhão de tokens (Claude Opus 5.5, outubro de 2026). Confirmar em anthropic.com/pricing.
const PRICE = { input: 4, output: 20 };

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const flag = (n: string) => args.includes(`--${n}`);

const unitId = opt('unit');
const from = Number(opt('from') ?? 1);
const count = Math.min(25, Number(opt('count') ?? 5));
const topic = opt('topic');
const promptOnly = flag('prompt-only');
const model = process.env.DUTCHPATH_GEN_MODEL || 'claude-opus-5-5';
const effort = (process.env.DUTCHPATH_GEN_EFFORT || 'high') as 'low' | 'medium' | 'high' | 'xhigh' | 'max';

if (!unitId) {
  console.log(readFileHeader());
  process.exit(1);
}

const structure = CourseStructureSchema.parse(readJson(PATHS.structure));
const section = structure.sections.find((s) => s.units.some((u) => u.id === unitId));
const unit = section?.units.find((u) => u.id === unitId);
if (!section || !unit) throw new Error(`Unidade ${unitId} não existe em content/course.json.`);

const existingFiles = readLessonFiles();
const existingLessons = [...existingFiles.values()].flatMap((f) => f.lessons).filter((l) => l.status !== 'rejected');
const batchId = `${unitId}-l${String(from).padStart(3, '0')}-${String(from + count - 1).padStart(3, '0')}`;
const batchPath = join(PATHS.drafts, `${batchId}.json`);
const batch: { batchId: string; createdAt: string; generator: string; lessons: Lesson[]; failures: { id: string; errors: string[] }[] } =
  existsSync(batchPath)
    ? (readJson(batchPath) as never)
    : { batchId, createdAt: new Date().toISOString(), generator: `${model} · ${PROMPT_VERSION} · effort ${effort}`, lessons: [], failures: [] };

// ---------------------------------------------------------------------------
// Contexto partilhado (estável → beneficia de cache de prompt)
// ---------------------------------------------------------------------------
const styleExample = existingLessons.find((l) => l.id === 's1-u01-l004') ?? existingLessons[0];

const SYSTEM = `És um autor sénior de materiais para ensinar neerlandês (padrão dos Países Baixos) a falantes de português europeu (Portugal).
Escreves lições curtas (3–8 minutos) para a aplicação DutchPath.

Regras de conteúdo:
- Português europeu natural (ex.: «autocarro», «comboio», «telemóvel», «estás», «chamo-me»), nunca brasileiro.
- Neerlandês padrão dos Países Baixos, frases naturais e realistas, registo adequado (je/u).
- Não inventes regras gramaticais. Se uma regra tem exceções, diz que existem.
- Explica diferenças relevantes face ao português (contrastWithPt).
- Reutiliza vocabulário já ensinado (reviewVocabulary) e introduz poucas palavras novas (4–9).
- Nunca redefinas um ID de vocabulário existente; para rever, usa reviewVocabulary/vocabRefs.
- Respostas aceites: lista todas as variantes corretas. Mini-sintaxe: [a|b] alternativas, (x) opcional.
- Em exercícios de escrita (shortWriting) dá respostas-modelo e uma checklist objetiva.
- 9 a 12 exercícios por lição, de pelo menos 5 tipos diferentes; inclui pelo menos um de produção (translate pt-nl ou shortWriting).
- Opções erradas devem ser plausíveis e ter "feedback" a explicar porquê.

Formato: responde APENAS com um objeto JSON de uma lição, sem texto antes ou depois, sem blocos de código.
O objeto segue exatamente o esquema do exemplo abaixo (mesmos nomes de campos e tipos de exercício).
Tipos de exercício permitidos: translate, multipleChoice, fillBlank, buildSentence, match, wordOrder, findError, articleChoice, conjugation, dialogue, comprehension, listening, expression, shortWriting.
IDs: lição "<unidade>-lNNN"; exercícios "<lição>-eNN"; vocabulário "v-palavra-em-minusculas".
Campos fixos: "status": "draft", "version": 1, "provenance": {"source": "ai"}.

Exemplo de lição completa (referência de estilo e de esquema):
${JSON.stringify(styleExample, null, 1)}`;

function lessonPrompt(order: number, known: Lesson[]): string {
  const vocab = known.flatMap((l) => l.newVocabulary.map((v) => `${v.id} = ${v.article ? v.article + ' ' : ''}${v.nl} (${v.pt[0]})`));
  const inUnit = known.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
  return `Secção ${section!.order} — ${section!.title} (${section!.cefr}). Objetivo: ${section!.goal}
Unidade ${unit!.order} — ${unit!.title}: ${unit!.description}
Temas da unidade: ${unit!.topics.join(', ')}. Nível: ${unit!.cefr}.
${topic ? `Tema pedido para esta lição: ${topic}\n` : ''}
Lições já existentes nesta unidade (não repitas o conteúdo):
${inUnit.map((l) => `- ${l.id}: ${l.title} — ${l.description}`).join('\n') || '(nenhuma)'}

Vocabulário já ensinado no curso (usa os IDs para rever; não os redefinas):
${vocab.slice(-250).join('\n') || '(nenhum)'}

Escreve a lição ${unitId}-l${String(order).padStart(3, '0')} (order ${order}), unitId "${unitId}", cefr compatível com ${unit!.cefr}.`;
}

function problemsOf(raw: unknown, expectedId: string, known: Lesson[]): string[] {
  const parsed = LessonSchema.safeParse(raw);
  if (!parsed.success) return parsed.error.issues.slice(0, 15).map((i) => `${i.path.join('.')}: ${i.message}`);
  const l = parsed.data;
  const p: string[] = [];
  if (l.id !== expectedId) p.push(`id deve ser ${expectedId}`);
  if (l.unitId !== unitId) p.push(`unitId deve ser ${unitId}`);
  const knownVocab = new Set(known.flatMap((k) => k.newVocabulary.map((v) => v.id)));
  for (const v of l.newVocabulary) if (knownVocab.has(v.id)) p.push(`vocabulário ${v.id} já existe: usa reviewVocabulary`);
  const defined = new Set([...knownVocab, ...l.newVocabulary.map((v) => v.id)]);
  for (const ref of [...l.reviewVocabulary, ...l.exercises.flatMap((e) => e.vocabRefs)]) if (!defined.has(ref)) p.push(`vocabRef ${ref} não existe`);
  l.exercises.forEach((e, i) => {
    if (!e.id.startsWith(`${l.id}-e`)) p.push(`exercício ${i + 1}: id deve começar por ${l.id}-e`);
    for (const m of checkExercise(e)) p.push(`exercício ${e.id}: ${m}`);
  });
  if (new Set(l.exercises.map((e) => e.type)).size < 4) p.push('usa pelo menos 4 tipos de exercício diferentes');
  return p;
}

function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('A resposta não contém JSON.');
  return JSON.parse(text.slice(start, end + 1));
}

function readFileHeader(): string {
  return `Uso: node tools/generate.ts --unit s1-u03 --from 1 --count 5 [--topic "…"] [--prompt-only]
Variáveis: ANTHROPIC_API_KEY (obrigatória sem --prompt-only), DUTCHPATH_GEN_MODEL (omissão: claude-opus-5-5), DUTCHPATH_GEN_EFFORT (omissão: high).`;
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------
const known: Lesson[] = [...existingLessons, ...batch.lessons];
let inTok = 0;
let outTok = 0;
const client = promptOnly ? null : new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

for (let order = from; order < from + count; order++) {
  const id = `${unitId}-l${String(order).padStart(3, '0')}`;
  if (known.some((l) => l.id === id)) {
    console.log(`↷ ${id} já existe (no curso ou neste lote) — a saltar.`);
    continue;
  }
  const prompt = lessonPrompt(order, known);
  if (promptOnly) {
    mkdirSync(join(PATHS.drafts, 'prompts'), { recursive: true });
    const f = join(PATHS.drafts, 'prompts', `${id}.txt`);
    writeFileSync(f, `=== SISTEMA ===\n${SYSTEM}\n\n=== PEDIDO ===\n${prompt}\n`);
    console.log(`✎ Pedido escrito em ${f}`);
    continue;
  }

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }];
  let lesson: Lesson | null = null;
  let lastProblems: string[] = [];
  for (let attempt = 1; attempt <= 2 && !lesson; attempt++) {
    try {
      const stream = client!.messages.stream({
        model,
        max_tokens: 32000,
        output_config: { effort },
        // Sistema estável com cache: os pedidos seguintes do lote pagam ~10% por esta parte.
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages,
      });
      const res = await stream.finalMessage();
      inTok += res.usage.input_tokens + (res.usage.cache_creation_input_tokens ?? 0) + (res.usage.cache_read_input_tokens ?? 0) * 0.1;
      outTok += res.usage.output_tokens;
      if (res.stop_reason === 'refusal') throw new Error('O modelo recusou o pedido.');
      if (res.stop_reason === 'max_tokens') throw new Error('Resposta cortada (max_tokens).');
      const text = res.content.filter((b) => b.type === 'text').map((b) => (b as Anthropic.TextBlock).text).join('');
      let raw: unknown;
      try { raw = extractJson(text); } catch (e) { lastProblems = [(e as Error).message]; raw = null; }
      if (raw) lastProblems = problemsOf(raw, id, known);
      if (raw && lastProblems.length === 0) {
        const parsed = LessonSchema.parse(raw);
        lesson = { ...parsed, status: 'draft', version: 1, provenance: { source: 'ai', generator: batch.generator, batchId, createdAt: new Date().toISOString() } };
        break;
      }
      // Ronda de correção: devolve os problemas ao modelo.
      messages.push({ role: 'assistant', content: res.content });
      messages.push({ role: 'user', content: `A lição tem estes problemas. Corrige-os e devolve o JSON completo da lição:\n- ${lastProblems.join('\n- ')}` });
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || /authentication method/i.test((e as Error).message)) {
        console.error('Sem credenciais válidas para a API da Anthropic. Defina ANTHROPIC_API_KEY no ambiente (nunca no repositório) ou use --prompt-only.');
        process.exit(1);
      }
      if (e instanceof Anthropic.RateLimitError) {
        console.warn('Limite de pedidos atingido: o lote fica guardado; volte a correr mais tarde para continuar.');
        break;
      }
      lastProblems = [(e as Error).message];
    }
  }

  if (lesson) {
    batch.lessons.push(lesson);
    batch.failures = batch.failures.filter((f) => f.id !== id);
    known.push(lesson);
    console.log(`✓ ${id}: ${lesson.title} (${lesson.exercises.length} exercícios)`);
  } else {
    batch.failures = [...batch.failures.filter((f) => f.id !== id), { id, errors: lastProblems }];
    console.warn(`✗ ${id}: não passou na validação — ${lastProblems.slice(0, 3).join('; ')}`);
  }
  writeJson(batchPath, batch); // grava após cada lição (retomável)
}

if (!promptOnly) {
  const cost = (inTok * PRICE.input + outTok * PRICE.output) / 1e6;
  console.log(`\nLote: ${batchPath}\nTokens ≈ ${Math.round(inTok)} entrada / ${outTok} saída · custo estimado ≈ US$ ${cost.toFixed(2)}`);
  if (batch.lessons.length) console.log(`Próximo passo: npm run content:import -- ${batchPath}   (entra como rascunho para revisão)`);
  if (batch.failures.length) console.log(`${batch.failures.length} lição(ões) falharam a validação; volte a correr o mesmo comando para tentar só essas.`);
}
