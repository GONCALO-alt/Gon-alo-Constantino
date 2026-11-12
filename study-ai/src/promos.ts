// Anúncios da própria STUDY AI (sem publicidade de terceiros).
// Cada anúncio tem lugares onde pode aparecer, uma condição («quando faz sentido»)
// e uma prioridade. Regras para não incomodar:
//  - no máximo um anúncio por lugar (e cada página tem no máximo um lugar visível);
//  - fechar um anúncio esconde-o durante `cooldownDays` dias;
//  - cada anúncio aparece no máximo em `maxDays` dias diferentes;
//  - a escolha é estável durante o dia (não muda a cada visita à página).
// Este ficheiro não depende do React, para poder ser testado.

import { AI_PLANS, type AiPlanId } from '../shared/plans';

export type PromoSlot = 'inicio' | 'chat' | 'chat-resposta' | 'plano' | 'testes' | 'teste-resultado' | 'resumos' | 'progresso';

export type PromoAction =
  | { kind: 'link'; to: string }
  | { kind: 'plan'; plan: AiPlanId }
  | { kind: 'install' };

export interface PromoView {
  id: string;
  icon: 'crown' | 'camera' | 'sparkles' | 'clipboard' | 'layers' | 'timer' | 'smartphone' | 'calendar' | 'message' | 'trophy';
  title: string;
  text: string;
  cta: string;
  action: PromoAction;
  featured?: boolean;
}

export interface PromoContext {
  today: string;
  plan: AiPlanId;
  aiConfigured: boolean;
  questionsLeft: number | null;
  /** Dias até ao próximo teste (null = nenhum marcado). */
  nextTest: { days: number; subject: string | null; subjectName: string; title: string } | null;
  eventsCount: number;
  conversations: number;
  aiAnswersInConversation: number;
  cardsTotal: number;
  timerMinutes: number;
  installed: boolean;
  phone: boolean;
  /** Resultado do teste aberto (para o lugar «teste-resultado»). */
  testResult: { pct: number; subject: string | null; subjectName: string } | null;
}

interface PromoDef {
  id: string;
  slots: PromoSlot[];
  priority: number;
  cooldownDays?: number;
  maxDays?: number;
  when: (c: PromoContext) => boolean;
  view: (c: PromoContext) => Omit<PromoView, 'id'>;
}

const FREE = 'Grátis nesta versão de demonstração.';

export const PROMOS: PromoDef[] = [
  {
    id: 'limite-cl6',
    slots: ['chat', 'chat-resposta', 'inicio'],
    priority: 100,
    cooldownDays: 1,
    maxDays: 30,
    when: (c) => c.aiConfigured && c.questionsLeft !== null && c.questionsLeft <= 3,
    view: (c) => ({
      icon: 'crown',
      featured: true,
      title: c.questionsLeft === 0 ? 'Acabaram as perguntas de hoje?' : `Só te restam ${c.questionsLeft} perguntas hoje`,
      text: `Com o Cláudio 6 não há limite de perguntas, as imagens são ilimitadas e podes enviar PDFs. ${FREE}`,
      cta: 'Mudar para o Cláudio 6',
      action: { kind: 'plan', plan: 'claudio-6' },
    }),
  },
  {
    id: 'teste-proximo',
    slots: ['inicio', 'plano'],
    priority: 90,
    cooldownDays: 1,
    maxDays: 10,
    when: (c) => c.aiConfigured && !!c.nextTest && c.nextTest.days >= 1 && c.nextTest.days <= 5,
    view: (c) => ({
      icon: 'clipboard',
      title: `${c.nextTest!.title} ${c.nextTest!.days === 1 ? 'é amanhã' : `daqui a ${c.nextTest!.days} dias`}`,
      text: 'Gera um teste de preparação com correção automática e descobre o que ainda tens de rever.',
      cta: 'Gerar teste de preparação',
      action: { kind: 'link', to: `/testes${c.nextTest!.subject ? `?subject=${c.nextTest!.subject}` : ''}` },
    }),
  },
  {
    id: 'nota-baixa',
    slots: ['teste-resultado'],
    priority: 80,
    cooldownDays: 1,
    maxDays: 60,
    when: (c) => !!c.testResult && c.testResult.pct < 50,
    view: (c) => ({
      icon: 'layers',
      title: 'Vamos subir esta nota',
      text: `Cria flashcards de ${c.testResult!.subjectName} para memorizar o que falhou e repete o teste daqui a 2 dias.`,
      cta: 'Criar flashcards',
      action: { kind: 'link', to: `/testes/flashcards${c.testResult!.subject ? `?subject=${c.testResult!.subject}` : ''}` },
    }),
  },
  {
    id: 'nota-alta',
    slots: ['teste-resultado'],
    priority: 75,
    cooldownDays: 1,
    maxDays: 60,
    when: (c) => c.aiConfigured && !!c.testResult && c.testResult.pct >= 80,
    view: (c) => ({
      icon: 'trophy',
      title: 'Excelente resultado!',
      text: `Estás pronto para mais: gera um teste difícil de ${c.testResult!.subjectName}.`,
      cta: 'Teste mais difícil',
      action: { kind: 'link', to: `/testes${c.testResult!.subject ? `?subject=${c.testResult!.subject}` : ''}` },
    }),
  },
  {
    id: 'instalar',
    slots: ['inicio'],
    priority: 70,
    cooldownDays: 14,
    maxDays: 6,
    when: (c) => c.phone && !c.installed,
    view: () => ({
      icon: 'smartphone',
      title: 'Instala a STUDY AI no telemóvel',
      text: 'Abre como uma aplicação, em ecrã inteiro, com o ícone no ecrã principal.',
      cta: 'Instalar aplicação',
      action: { kind: 'install' },
    }),
  },
  {
    id: 'primeira-pergunta',
    slots: ['inicio', 'plano', 'progresso'],
    priority: 65,
    maxDays: 4,
    when: (c) => c.aiConfigured && c.conversations === 0,
    view: () => ({
      icon: 'message',
      title: 'Ainda não falaste com a IA',
      text: 'Pergunta qualquer dúvida de qualquer disciplina: a IA explica passo a passo, ao nível do teu ano.',
      cta: 'Fazer uma pergunta',
      action: { kind: 'link', to: '/chat' },
    }),
  },
  {
    id: 'fotos-cl55',
    slots: ['chat', 'inicio'],
    priority: 60,
    maxDays: 4,
    when: (c) => c.aiConfigured && c.plan === 'claudio-5',
    view: () => ({
      icon: 'camera',
      featured: true,
      title: 'Tira uma foto ao exercício',
      text: `Com o ${AI_PLANS['claudio-5-5'].name}, a IA analisa fotografias das tuas fichas e explica passo a passo. ${FREE}`,
      cta: `Experimentar o ${AI_PLANS['claudio-5-5'].name}`,
      action: { kind: 'plan', plan: 'claudio-5-5' },
    }),
  },
  {
    id: 'calendario',
    slots: ['inicio', 'plano'],
    priority: 55,
    maxDays: 4,
    when: (c) => c.eventsCount === 0,
    view: () => ({
      icon: 'calendar',
      title: 'Marca os teus testes',
      text: 'Quando marcas um teste no calendário, o plano acrescenta revisões nos 3 dias anteriores.',
      cta: 'Abrir calendário',
      action: { kind: 'link', to: '/plano/calendario' },
    }),
  },
  {
    id: 'aprofundar-cl6',
    slots: ['chat-resposta'],
    priority: 50,
    cooldownDays: 7,
    maxDays: 3,
    when: (c) => c.aiConfigured && c.plan !== 'claudio-6' && c.aiAnswersInConversation >= 3,
    view: () => ({
      icon: 'crown',
      featured: true,
      title: 'Queres explicações mais aprofundadas?',
      text: `O Cláudio 6 explica o porquê de cada passo, dá mais exemplos e analisa documentos. ${FREE}`,
      cta: 'Experimentar o Cláudio 6',
      action: { kind: 'plan', plan: 'claudio-6' },
    }),
  },
  {
    id: 'flashcards',
    slots: ['inicio', 'resumos', 'testes', 'progresso'],
    priority: 40,
    maxDays: 5,
    when: (c) => c.cardsTotal === 0,
    view: (c) => ({
      icon: 'layers',
      title: 'Memoriza mais depressa com flashcards',
      text: c.aiConfigured
        ? 'A IA cria os cartões a partir de uma matéria ou de um resumo, e a revisão espaçada mostra cada um na altura certa.'
        : 'Escreve os teus cartões e a revisão espaçada mostra cada um na altura certa.',
      cta: 'Criar flashcards',
      action: { kind: 'link', to: '/testes/flashcards' },
    }),
  },
  {
    id: 'modo-estudo',
    slots: ['inicio', 'plano', 'progresso', 'testes'],
    priority: 30,
    maxDays: 5,
    when: (c) => c.timerMinutes === 0,
    view: () => ({
      icon: 'timer',
      title: 'Experimenta o Modo de estudo',
      text: '25 minutos de foco e 5 de pausa. O tempo entra nas tuas estatísticas de progresso.',
      cta: 'Começar agora',
      action: { kind: 'link', to: '/estudar' },
    }),
  },
];

/** Memória local (neste dispositivo) dos anúncios vistos e fechados. */
export interface PromoRecord {
  /** Dia em que foi fechado. */
  dismissed?: string;
  /** Dias em que apareceu. */
  days?: string[];
}

export interface PromoStore {
  records: Record<string, PromoRecord>;
  /** Escolha do dia por lugar, para a página não mudar a cada visita. */
  picks: Record<string, { day: string; id: string }>;
}

export const emptyStore = (): PromoStore => ({ records: {}, picks: {} });

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function isEligible(def: PromoDef, slot: PromoSlot, ctx: PromoContext, store: PromoStore): boolean {
  if (!def.slots.includes(slot) || !def.when(ctx)) return false;
  const rec = store.records[def.id] ?? {};
  if (rec.dismissed && daysBetween(rec.dismissed, ctx.today) < (def.cooldownDays ?? 7)) return false;
  const days = rec.days ?? [];
  if (days.length >= (def.maxDays ?? 5) && !days.includes(ctx.today)) return false;
  return true;
}

/** Escolhe o anúncio para um lugar (ou nenhum). Não altera `store`. */
export function pickPromo(slot: PromoSlot, ctx: PromoContext, store: PromoStore): PromoView | null {
  const eligible = PROMOS.filter((p) => isEligible(p, slot, ctx, store)).sort((a, b) => b.priority - a.priority);
  const best = eligible[0];
  if (!best) return null;
  const previous = store.picks[slot];
  // Mantém a escolha de hoje, a não ser que apareça algo bem mais importante.
  const kept = previous?.day === ctx.today ? eligible.find((p) => p.id === previous.id) : undefined;
  const chosen = kept && kept.priority >= best.priority - 20 ? kept : best;
  return { id: chosen.id, ...chosen.view(ctx) };
}

/** Regista que o anúncio foi mostrado hoje neste lugar. */
export function recordShown(store: PromoStore, slot: PromoSlot, id: string, today: string): PromoStore {
  const rec = store.records[id] ?? {};
  const days = rec.days ?? [];
  return {
    records: { ...store.records, [id]: { ...rec, days: days.includes(today) ? days : [...days, today].slice(-60) } },
    picks: { ...store.picks, [slot]: { day: today, id } },
  };
}

export function recordDismissed(store: PromoStore, id: string, today: string): PromoStore {
  return { ...store, records: { ...store.records, [id]: { ...(store.records[id] ?? {}), dismissed: today } } };
}
