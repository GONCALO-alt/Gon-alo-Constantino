import { useMemo, useState } from 'react';
import { api } from './api';
import { haptic } from './pwa';
import { invalidate, useQuery } from './state';
import { addDays, weekStart } from '../shared/dates';
import { sessionsForDate } from '../shared/planner';
import type { CalendarEvent, DaySession, StudyLog, StudyPlan, WeeklyGoal } from '../shared/types';

export interface PlanResponse {
  plan: StudyPlan | null;
  week: string;
  checks: string[];
}

/** Plano + eventos + registos de uma semana, com as operações mais usadas. */
export function usePlanWeek(anyDate: string) {
  const week = weekStart(anyDate);
  const weekEnd = addDays(week, 6);
  const planQ = useQuery<PlanResponse>(`/plan?week=${week}`);
  const eventsQ = useQuery<{ events: CalendarEvent[] }>('/events');
  const logsQ = useQuery<{ logs: StudyLog[] }>(`/logs?from=${week}&to=${weekEnd}`);
  const [busy, setBusy] = useState<string | null>(null);

  const plan = planQ.data?.plan ?? null;
  const events = useMemo(() => eventsQ.data?.events ?? [], [eventsQ.data]);
  const logs = useMemo(() => logsQ.data?.logs ?? [], [logsQ.data]);
  const doneKeys = useMemo(() => new Set(logs.map((l) => l.sessionKey).filter(Boolean) as string[]), [logs]);

  const sessionsFor = (date: string): DaySession[] => (plan ? sessionsForDate(plan, date, events) : []);

  async function toggleDone(s: DaySession, minutes?: number) {
    setBusy(s.key);
    if (!doneKeys.has(s.key)) haptic(15);
    try {
      if (doneKeys.has(s.key)) await api(`/logs?sessionKey=${encodeURIComponent(s.key)}`, { method: 'DELETE' });
      else
        await api('/logs', {
          method: 'POST',
          body: { date: s.date, subject: s.subject || null, minutes: minutes ?? s.minutes, source: 'plano', sessionKey: s.key },
        });
      invalidate('/logs', '/stats');
    } finally {
      setBusy(null);
    }
  }

  async function toggleCheck(goalId: string, done: boolean) {
    await api(`/plan/goals/${encodeURIComponent(goalId)}`, { method: 'PUT', body: { week, done } });
    invalidate('/plan');
  }

  function goalProgress(g: WeeklyGoal): { value: number; target: number; done: boolean } {
    if (g.kind === 'sessions') {
      const value = logs.filter((l) => l.sessionKey && l.date >= week && l.date <= weekEnd).length;
      return { value, target: g.target ?? 1, done: value >= (g.target ?? 1) };
    }
    if (g.kind === 'minutes') {
      const value = logs.filter((l) => l.subject === g.subject && l.date >= week && l.date <= weekEnd).reduce((a, l) => a + l.minutes, 0);
      return { value, target: g.target ?? 1, done: value >= (g.target ?? 1) };
    }
    const done = planQ.data?.checks.includes(g.id) ?? false;
    return { value: done ? 1 : 0, target: 1, done };
  }

  return {
    week,
    weekEnd,
    plan,
    events,
    logs,
    doneKeys,
    loading: planQ.loading || eventsQ.loading,
    busy,
    sessionsFor,
    toggleDone,
    toggleCheck,
    goalProgress,
  };
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Boa noite';
  if (h < 13) return 'Bom dia';
  if (h < 20) return 'Boa tarde';
  return 'Boa noite';
}
