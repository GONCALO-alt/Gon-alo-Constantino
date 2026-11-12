// Lembretes no telemóvel: que notificações enviar agora (sessões do plano e véspera dos testes).
// Uma tarefa agendada chama `deliverReminders` a cada 5 minutos para cada estudante com lembretes.

import { addDays, formatMinutes, timeToMinutes } from '../shared/dates';
import { sessionsForDate } from '../shared/planner';
import { getSubject } from '../shared/subjects';
import { ACTIVITY_LABELS } from '../shared/types';
import type { CoreContext } from './api';
import { sendPush, type PushMessage, type PushSubscriptionData, type VapidKeys } from './push';
import type { UserState } from './state';

export interface ReminderSettings {
  /** Avisar antes das sessões do plano. */
  sessions: boolean;
  /** Avisar na véspera dos testes e trabalhos. */
  tests: boolean;
  /** Minutos de antecedência para as sessões (0 = à hora). */
  minutesBefore: number;
  /** Hora do aviso da véspera (HH:MM). */
  testTime: string;
}

export const DEFAULT_REMINDERS: ReminderSettings = { sessions: true, tests: true, minutesBefore: 10, testTime: '19:00' };

export interface StoredSubscription extends PushSubscriptionData {
  /** Endereço da app (para a assinatura VAPID). */
  origin: string;
  createdAt: string;
}

export interface PushState {
  subs: StoredSubscription[];
  settings: ReminderSettings;
  /** Lembretes já enviados (para não repetir). */
  sent: string[];
}

export const pushOf = (s: UserState): PushState => s.push ?? { subs: [], settings: { ...DEFAULT_REMINDERS }, sent: [] };

export function cleanSettings(b: Partial<ReminderSettings> | null | undefined, prev = DEFAULT_REMINDERS): ReminderSettings {
  return {
    sessions: typeof b?.sessions === 'boolean' ? b.sessions : prev.sessions,
    tests: typeof b?.tests === 'boolean' ? b.tests : prev.tests,
    minutesBefore: [0, 5, 10, 15, 30].includes(Number(b?.minutesBefore)) ? Number(b!.minutesBefore) : prev.minutesBefore,
    testTime: typeof b?.testTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(b.testTime) ? b.testTime : prev.testTime,
  };
}

/** Data e minutos do dia no fuso do estudante. */
export function localNow(timeZone: string, now = new Date()): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Lembretes a enviar agora (os que passaram da hora há menos de `windowMin` minutos e ainda não foram enviados). */
export function dueReminders(s: UserState, now: { date: string; minutes: number }, windowMin = 30): { key: string; message: PushMessage }[] {
  const push = pushOf(s);
  if (!push.subs.length) return [];
  const { settings } = push;
  const custom = s.profile.questionnaire?.customSubjects;
  const inWindow = (at: number) => at <= now.minutes && at > now.minutes - windowMin;
  const out: { key: string; message: PushMessage }[] = [];

  if (settings.sessions && s.plan) {
    const done = new Set(s.logs.filter((l) => l.date === now.date && l.sessionKey).map((l) => l.sessionKey));
    for (const x of sessionsForDate(s.plan, now.date, s.events)) {
      const at = timeToMinutes(x.start) - settings.minutesBefore;
      if (!inWindow(at) || done.has(x.key)) continue;
      const name = x.subject ? getSubject(x.subject, custom).name : 'Trabalhos de casa';
      out.push({
        key: `s|${x.key}`,
        message: {
          title: settings.minutesBefore ? `Daqui a ${settings.minutesBefore} min: ${name}` : `Hora de estudar: ${name}`,
          body: `${x.start} · ${ACTIVITY_LABELS[x.activity]} · ${formatMinutes(x.minutes)}. Toca para abrir o plano de hoje.`,
          url: '/',
          tag: 'sessao',
        },
      });
    }
  }

  if (settings.tests && inWindow(timeToMinutes(settings.testTime))) {
    const tomorrow = addDays(now.date, 1);
    for (const e of s.events.filter((ev) => ev.date === tomorrow && (ev.type === 'teste' || ev.type === 'trabalho'))) {
      out.push({
        key: `t|${e.id}|${e.date}`,
        message: {
          title: `Amanhã: ${e.title}`,
          body: e.type === 'teste' ? 'Faz uma revisão rápida e um teste de preparação. Tu consegues! 💪' : 'Confirma que está tudo pronto para entregar amanhã.',
          url: e.type === 'teste' && e.subject ? `/testes?subject=${e.subject}` : '/plano/calendario',
          tag: 'teste',
        },
      });
    }
  }
  const sent = new Set(push.sent);
  return out.filter((r) => !sent.has(r.key));
}

/** Envia uma mensagem a todas as subscrições; devolve quantas receberam e as que deixaram de existir. */
export async function pushToAll(subs: StoredSubscription[], message: PushMessage, vapid: VapidKeys) {
  const results = await Promise.all(subs.map((s) => sendPush(s, message, vapid, s.origin.startsWith('https://') ? s.origin : 'https://localhost')));
  return { sent: results.filter((r) => r === 'ok').length, gone: subs.filter((_, i) => results[i] === 'gone').map((s) => s.endpoint) };
}

/** Envia os lembretes devidos a um estudante e regista-os. `active` = ainda tem lembretes ligados. */
export async function deliverReminders(ctx: CoreContext, vapid: VapidKeys, now: { date: string; minutes: number }): Promise<{ sent: number; active: boolean }> {
  const s = await ctx.state();
  const push = pushOf(s);
  if (!push.subs.length) return { sent: 0, active: false };
  const due = dueReminders(s, now);
  if (!due.length) return { sent: 0, active: true };
  let sent = 0;
  const gone = new Set<string>();
  for (const r of due) {
    const res = await pushToAll(push.subs.filter((x) => !gone.has(x.endpoint)), r.message, vapid);
    sent += res.sent;
    res.gone.forEach((e) => gone.add(e));
  }
  const after = await ctx.commit((st) => {
    const p = pushOf(st);
    st.push = { ...p, subs: p.subs.filter((x) => !gone.has(x.endpoint)), sent: [...p.sent, ...due.map((r) => r.key)].slice(-300) };
    return st;
  });
  return { sent, active: pushOf(after).subs.length > 0 };
}
