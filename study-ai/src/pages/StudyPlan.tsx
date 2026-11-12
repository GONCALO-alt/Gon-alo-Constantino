import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, CalendarRange, Check, ChevronLeft, ChevronRight, Clock, ListChecks, Pencil, Plus, RefreshCw, Sparkles, Target, Trash2,
} from 'lucide-react';
import { api } from '../api';
import { CalendarView } from '../components/CalendarView';
import { Markdown } from '../components/Markdown';
import { subjectColor } from '../components/SubjectIcon';
import { Button, Confirm, Empty, Field, FormError, Modal, PageHead, Progress, Skeleton, Tabs, Toggle } from '../components/ui';
import { usePlanWeek, type PlanResponse } from '../planData';
import { useMediaQuery } from '../pwa';
import { SessionRow } from '../components/SessionRow';
import { Promo } from '../components/Promo';
import { invalidate, setCached, useApp, useMe } from '../state';
import { addDays, formatDateShort, formatMinutes, today, weekStart, WEEKDAYS } from '../../shared/dates';
import { minutesBySubject } from '../../shared/planner';
import { getSubject } from '../../shared/subjects';
import { ACTIVITY_HINTS, ACTIVITY_LABELS, type ActivityType, type DaySession, type PlanSession, type StudyPlan } from '../../shared/types';

const ACTIVITIES = Object.keys(ACTIVITY_LABELS) as ActivityType[];

function SessionEditor({ session, weekday, onClose }: { session: PlanSession | null; weekday: number; onClose: () => void }) {
  const me = useMe();
  const { toast } = useApp();
  const q = me.profile.questionnaire;
  const [form, setForm] = useState<Omit<PlanSession, 'id'>>(() =>
    session
      ? { weekday: session.weekday, start: session.start, minutes: session.minutes, subject: session.subject, activity: session.activity, note: session.note ?? '' }
      : { weekday, start: q?.startTime ?? '17:30', minutes: 30, subject: q?.subjects[0] ?? '', activity: 'estudo', note: '' },
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const body = { ...form, note: form.note?.trim() || undefined };
      if (session) await api(`/plan/sessions/${session.id}`, { method: 'PUT', body });
      else await api('/plan/sessions', { method: 'POST', body });
      invalidate('/plan');
      toast(session ? 'Sessão atualizada.' : 'Sessão adicionada ao plano.');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!session) return;
    await api(`/plan/sessions/${session.id}`, { method: 'DELETE' });
    invalidate('/plan');
    toast('Sessão removida.');
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={session ? 'Editar sessão' : 'Nova sessão'}
      footer={
        <>
          {session && <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirm(true)} style={{ marginRight: 'auto' }}>Remover</Button>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} loading={saving}>Guardar</Button>
        </>
      }>
      <div className="stack">
        <div className="grid-2">
          <Field label="Dia">
            <select className="select" value={form.weekday} onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}>
              {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </Field>
          <Field label="Disciplina">
            <select className="select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, activity: e.target.value ? form.activity : 'tpc' })}>
              <option value="">Trabalhos de casa (todas)</option>
              {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
            </select>
          </Field>
          <Field label="Hora de início">
            <input className="input" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </Field>
          <Field label="Duração">
            <select className="select" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: Number(e.target.value) })}>
              {[10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].map((m) => <option key={m} value={m}>{formatMinutes(m)}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Atividade">
          <select className="select" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value as ActivityType })}>
            {ACTIVITIES.map((a) => <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>)}
          </select>
        </Field>
        <p className="tiny faint">{ACTIVITY_HINTS[form.activity]}</p>
        <Field label="Nota (opcional)">
          <input className="input" value={form.note ?? ''} maxLength={200} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ex.: capítulo 3 do manual" />
        </Field>
        <FormError>{error}</FormError>
      </div>
      <Confirm open={confirm} onClose={() => setConfirm(false)} onConfirm={remove} title="Remover sessão?" text="Esta sessão deixa de aparecer todas as semanas." confirmLabel="Remover" />
    </Modal>
  );
}

function WeekView() {
  const me = useMe();
  const { toast } = useApp();
  const navigate = useNavigate();
  const q = me.profile.questionnaire;
  const custom = q?.customSubjects;
  const [anchor, setAnchor] = useState(today());
  const phone = useMediaQuery('(max-width: 760px)');
  const [dayIndex, setDayIndex] = useState(() => (new Date().getDay() + 6) % 7);
  const pw = usePlanWeek(anchor);
  const [editing, setEditing] = useState<{ session: PlanSession | null; weekday: number } | null>(null);
  const [viewing, setViewing] = useState<DaySession | null>(null);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const now = today();

  if (pw.loading) return <div className="stack"><Skeleton height={200} /><Skeleton height={140} /></div>;
  const plan = pw.plan;
  if (!plan)
    return <Empty icon={<CalendarDays />} title="Ainda não tens um plano" text="Responde ao questionário para a STUDY AI criar o teu plano." action={<Button onClick={() => navigate('/questionario')}>Responder ao questionário</Button>} />;

  const days = Array.from({ length: 7 }, (_, i) => addDays(pw.week, i));
  const weekSessions = days.flatMap((d) => pw.sessionsFor(d));
  const done = weekSessions.filter((s) => pw.doneKeys.has(s.key)).length;
  const planned = weekSessions.reduce((a, s) => a + s.minutes, 0);
  const bySubject = [...minutesBySubject(plan).entries()].sort((a, b) => b[1] - a[1]);
  const maxMinutes = bySubject[0]?.[1] ?? 1;

  async function regenerate() {
    setRegenLoading(true);
    try {
      const r = await api<{ plan: StudyPlan }>('/plan/generate', { method: 'POST' });
      setCached(`/plan?week=${pw.week}`, { plan: r.plan, week: pw.week, checks: [] } satisfies PlanResponse);
      invalidate('/plan');
      toast('Plano novo criado a partir das tuas respostas.');
      setConfirmRegen(false);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setRegenLoading(false);
    }
  }

  async function askAi() {
    setAiLoading(true);
    try {
      await api('/plan/insights', { method: 'POST' });
      invalidate('/plan');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setAiLoading(false);
    }
  }

  async function setAutoRevisions(v: boolean) {
    await api('/plan/settings', { method: 'PUT', body: { autoRevisions: v } });
    invalidate('/plan');
  }

  const templateOf = (s: DaySession) => plan.sessions.find((x) => x.id === s.id) ?? null;

  return (
    <div className="stack lg">
      <div className="card pad-sm">
        <div className="row between wrap" style={{ gap: 12 }}>
          <div className="row">
            <Button variant="ghost" size="sm" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Semana anterior"><ChevronLeft /></Button>
            <b style={{ minWidth: 130, textAlign: 'center' }}>{formatDateShort(pw.week)} – {formatDateShort(pw.weekEnd)}</b>
            <Button variant="ghost" size="sm" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Semana seguinte"><ChevronRight /></Button>
            {pw.week !== weekStart(now) && <Button variant="ghost" size="sm" onClick={() => setAnchor(now)}>Esta semana</Button>}
          </div>
          <div className="row wrap" style={{ gap: 18 }}>
            <span className="small muted"><b style={{ color: 'var(--text)' }}>{done}</b>/{weekSessions.length} sessões · {formatMinutes(planned)}</span>
            <label className="row small" style={{ gap: 8, cursor: 'pointer' }}>
              <Toggle on={plan.settings.autoRevisions} onChange={setAutoRevisions} label="Revisões automáticas antes dos testes" />
              Revisões antes dos testes
            </label>
          </div>
        </div>
        <div style={{ marginTop: 12 }}><Progress value={done} max={weekSessions.length || 1} thin /></div>
      </div>

      {phone ? (
        <div className="stack">
          <div className="day-strip" role="tablist" aria-label="Dia da semana">
            {days.map((d, i) => {
              const items = pw.sessionsFor(d);
              const allDone = items.length > 0 && items.every((x) => pw.doneKeys.has(x.key));
              return (
                <button key={d} type="button" role="tab" aria-selected={i === dayIndex}
                  className={`day-pill ${i === dayIndex ? 'on' : ''} ${d === now ? 'today' : ''}`} onClick={() => setDayIndex(i)}>
                  <span>{WEEKDAYS[i]?.slice(0, 3)}</span>
                  <b>{d.slice(8)}</b>
                  <i className={items.length ? (allDone ? 'done' : 'has') : ''} />
                </button>
              );
            })}
          </div>
          {(() => {
            const d = days[dayIndex]!;
            const items = pw.sessionsFor(d);
            return (
              <div className="stack fade-in" key={d} style={{ gap: 8 }}>
                <div className="row between small muted">
                  <span>{WEEKDAYS[dayIndex]}, {formatDateShort(d)}</span>
                  <span>{items.length ? formatMinutes(items.reduce((a, x) => a + x.minutes, 0)) : 'Dia livre'}</span>
                </div>
                {items.map((x) => (
                  <SessionRow key={x.key} s={x} custom={custom} done={pw.doneKeys.has(x.key)} busy={pw.busy === x.key}
                    onToggle={() => pw.toggleDone(x)} onOpen={() => setViewing(x)} />
                ))}
                {!items.length && <p className="muted small" style={{ padding: '8px 2px' }}>Sem sessões neste dia.</p>}
                <button type="button" className="week-add" style={{ height: 44 }} onClick={() => setEditing({ session: null, weekday: dayIndex })}><Plus /> Adicionar sessão</button>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="week">
          {days.map((d, i) => {
            const items = pw.sessionsFor(d);
            return (
              <div key={d} className={`week-day ${d === now ? 'today' : ''} fade-up`} style={{ ['--i' as string]: i }}>
                <div className="week-day-head">
                  <b>{WEEKDAYS[i]}</b>
                  <span>{formatDateShort(d)}</span>
                </div>
                {items.map((s) => (
                  <button key={s.key} type="button" className={`wsession ${pw.doneKeys.has(s.key) ? 'done' : ''} ${s.eventId ? 'rev' : ''}`}
                    style={{ ['--c' as string]: subjectColor(s.subject, custom) }} onClick={() => setViewing(s)}>
                    <div className="ws-time">{s.start} · {s.minutes} min {pw.doneKeys.has(s.key) && '✓'}</div>
                    <div className="ws-title">{s.subject ? getSubject(s.subject, custom).short : 'Trabalhos de casa'}</div>
                    <div className="ws-act">{s.eventId ? 'Antes do teste' : ACTIVITY_LABELS[s.activity]}</div>
                  </button>
                ))}
                {!items.length && <span className="tiny faint" style={{ padding: '4px 2px' }}>Dia livre</span>}
                <button type="button" className="week-add" onClick={() => setEditing({ session: null, weekday: i })}><Plus /> Adicionar</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="slot-gap"><Promo slot="plano" /></div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title"><Target /> Objetivos da semana</span></div>
          <div className="stack" style={{ gap: 14 }}>
            {plan.weeklyGoals.map((g) => {
              const p = pw.goalProgress(g);
              return (
                <div key={g.id}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span className="row" style={{ gap: 10 }}>
                      {g.kind === 'check' ? (
                        <button type="button" className={`check round ${p.done ? 'on' : ''}`} onClick={() => pw.toggleCheck(g.id, !p.done)} aria-label="Marcar objetivo"><Check /></button>
                      ) : (
                        <span className={`check round ${p.done ? 'on' : ''}`} aria-hidden><Check /></span>
                      )}
                      <span>{g.text}</span>
                    </span>
                    {g.kind !== 'check' && <span className="tiny muted nowrap">{p.value}/{p.target}{g.kind === 'minutes' ? ' min' : ''}</span>}
                  </div>
                  {g.kind !== 'check' && <Progress value={p.value} max={p.target} thin green={p.done} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><Clock /> Tempo por disciplina (semana)</span></div>
          {bySubject.map(([id, m]) => (
            <div key={id} className="hbar">
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getSubject(id, custom).name}</span>
              <span className="track"><div style={{ width: `${(m / maxMinutes) * 100}%`, background: 'var(--yellow)' }} /></span>
              <span className="v">{formatMinutes(m)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title"><ListChecks /> Porque é que o plano é assim</span></div>
          <ul className="insights">{plan.insights.map((t) => <li key={t}><Check />{t}</li>)}</ul>
        </div>
        <div className="card card-glow">
          <div className="card-head">
            <span className="card-title"><Sparkles /> Análise da IA</span>
            {me.ai.configured && <Button variant="ghost" size="sm" loading={aiLoading} onClick={askAi} icon={<RefreshCw />}>{plan.aiInsights ? 'Atualizar' : 'Pedir análise'}</Button>}
          </div>
          {plan.aiInsights ? (
            <Markdown text={plan.aiInsights} compact />
          ) : me.ai.configured ? (
            <p className="muted small">A IA pode analisar o teu perfil e dar-te conselhos para as disciplinas difíceis. Carrega em «Pedir análise».</p>
          ) : (
            <p className="muted small">A análise por IA fica disponível quando a IA estiver ligada no servidor. O plano acima foi criado pelo motor de planeamento da STUDY AI a partir das tuas respostas.</p>
          )}
        </div>
      </div>

      <div className="row wrap">
        <Button variant="secondary" icon={<RefreshCw />} onClick={() => setConfirmRegen(true)}>Criar plano novo</Button>
        <Link to="/questionario" className="btn btn-ghost"><Pencil /> Alterar respostas do questionário</Link>
      </div>

      {editing && <SessionEditor session={editing.session} weekday={editing.weekday} onClose={() => setEditing(null)} />}
      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.subject ? getSubject(viewing.subject, custom).name : 'Trabalhos de casa'}
          footer={
            <>
              {!viewing.eventId && templateOf(viewing) && (
                <Button variant="ghost" icon={<Pencil />} style={{ marginRight: 'auto' }} onClick={() => { setEditing({ session: templateOf(viewing), weekday: viewing.weekday }); setViewing(null); }}>Editar</Button>
              )}
              <Link to={`/estudar?session=${encodeURIComponent(viewing.key)}&subject=${encodeURIComponent(viewing.subject)}&minutes=${viewing.minutes}&date=${viewing.date}`} className="btn btn-secondary">Começar</Link>
              <Button onClick={async () => { await pw.toggleDone(viewing); setViewing(null); }} icon={<Check />}>
                {pw.doneKeys.has(viewing.key) ? 'Marcar como não feita' : 'Marcar como feita'}
              </Button>
            </>
          }>
          <dl className="kv">
            <dt>Quando</dt><dd>{WEEKDAYS[viewing.weekday]}, {formatDateShort(viewing.date)} · {viewing.start} ({viewing.minutes} min)</dd>
            <dt>Atividade</dt><dd>{ACTIVITY_LABELS[viewing.activity]}</dd>
            {viewing.note && <><dt>Nota</dt><dd>{viewing.note}</dd></>}
          </dl>
          <p className="muted small" style={{ marginTop: 14 }}>{ACTIVITY_HINTS[viewing.activity]}</p>
          {viewing.eventId && <p className="tiny faint" style={{ marginTop: 8 }}>Sessão automática de revisão: substitui uma sessão normal nos 3 dias antes do teste.</p>}
        </Modal>
      )}
      <Confirm open={confirmRegen} onClose={() => setConfirmRegen(false)} onConfirm={regenerate} loading={regenLoading} danger={false} confirmLabel="Criar plano novo"
        title="Criar um plano novo?" text="O plano é criado outra vez a partir das respostas do questionário. As alterações que fizeste à mão são substituídas." />
    </div>
  );
}

export function StudyPlanPage({ tab = 'semana' }: { tab?: 'semana' | 'calendario' }) {
  const navigate = useNavigate();
  const pw = usePlanWeek(today());
  return (
    <div>
      <PageHead
        title="Plano de estudos"
        sub="O teu horário semanal, criado a partir do questionário. Toca numa sessão para a editar ou marcar como feita."
        actions={
          <Tabs value={tab} onChange={(v) => navigate(v === 'semana' ? '/plano' : '/plano/calendario')}
            items={[{ value: 'semana', label: 'Semana', icon: <CalendarRange /> }, { value: 'calendario', label: 'Calendário escolar', icon: <CalendarDays /> }]} />
        }
      />
      {tab === 'semana' ? <WeekView /> : <CalendarView events={pw.events} />}
    </div>
  );
}
