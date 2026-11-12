import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, ClipboardCheck, NotebookPen, Pencil, StickyNote, Trash2 } from 'lucide-react';
import { api } from '../api';
import { invalidate, useApp, useMe } from '../state';
import { addDays, daysBetween, formatDateLong, isoWeekday, MONTHS, parseISODate, today, toISODate, WEEKDAYS_SHORT } from '../../shared/dates';
import { getSubject } from '../../shared/subjects';
import type { CalendarEvent, EventType } from '../../shared/types';
import { Button, Confirm, Field, FormError, IconButton, Modal } from './ui';

const TYPE_LABEL: Record<EventType, string> = { teste: 'Teste', trabalho: 'Trabalho', outro: 'Outro' };
const TYPE_ICON = { teste: ClipboardCheck, trabalho: NotebookPen, outro: StickyNote };

export function EventEditor({
  open,
  onClose,
  event,
  date,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  date: string;
}) {
  const me = useMe();
  const { toast } = useApp();
  const q = me.profile.questionnaire;
  const [type, setType] = useState<EventType>(event?.type ?? 'teste');
  const [subject, setSubject] = useState<string>(event?.subject ?? q?.subjects[0] ?? '');
  const [title, setTitle] = useState(event?.title ?? '');
  const [when, setWhen] = useState(event?.date ?? date);
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError('');
    const subjName = subject ? getSubject(subject, q?.customSubjects).name : '';
    const body = {
      type,
      subject: subject || null,
      title: title.trim() || `${TYPE_LABEL[type]}${subjName ? ` de ${subjName}` : ''}`,
      date: when,
      notes,
    };
    try {
      if (event) await api(`/events/${event.id}`, { method: 'PUT', body });
      else await api('/events', { method: 'POST', body });
      invalidate('/events');
      toast(event ? 'Evento atualizado.' : type === 'teste' ? 'Teste marcado. O plano já tem as revisões.' : 'Adicionado ao calendário.');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? 'Editar evento' : 'Novo no calendário'}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} loading={saving}>Guardar</Button></>}>
      <div className="stack">
        <div className="row wrap">
          {(['teste', 'trabalho', 'outro'] as EventType[]).map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button key={t} type="button" className={`chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
                <Icon /> {TYPE_LABEL[t]}
              </button>
            );
          })}
        </div>
        <div className="grid-2">
          <Field label="Disciplina">
            <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Sem disciplina</option>
              {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
            </select>
          </Field>
          <Field label="Data">
            <input className="input" type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
          </Field>
        </div>
        <Field label="Título">
          <input className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'teste' ? 'Ex.: Teste de Matemática — Funções' : 'Ex.: Trabalho de grupo sobre a água'} />
        </Field>
        <Field label="Notas (matéria, páginas do manual…)">
          <textarea className="textarea" style={{ minHeight: 80 }} value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {type === 'teste' && <p className="tiny faint">O plano de estudos acrescenta revisões nos 3 dias antes do teste.</p>}
        <FormError>{error}</FormError>
      </div>
    </Modal>
  );
}

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const me = useMe();
  const { toast } = useApp();
  const q = me.profile.questionnaire;
  const now = today();
  const [month, setMonth] = useState(() => now.slice(0, 7));
  const [selected, setSelected] = useState(now);
  const [editor, setEditor] = useState<{ event: CalendarEvent | null; date: string } | null>(null);
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);

  const cells = useMemo(() => {
    const first = `${month}-01`;
    const start = addDays(first, -isoWeekday(first));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [month]);
  const byDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [events]);

  const d = parseISODate(`${month}-01`);
  const shift = (n: number) => {
    const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
    setMonth(toISODate(x).slice(0, 7));
  };
  const dayEvents = byDate.get(selected) ?? [];
  const upcoming = events.filter((e) => daysBetween(now, e.date) >= 0).slice(0, 8);

  async function remove() {
    if (!deleting) return;
    await api(`/events/${deleting.id}`, { method: 'DELETE' });
    invalidate('/events');
    toast('Evento apagado.');
    setDeleting(null);
  }

  const lastRow = cells.slice(35).every((c) => c.slice(0, 7) !== month) ? 35 : 42;

  return (
    <div className="dash" style={{ marginTop: 0 }}>
      <div className="card">
        <div className="card-head">
          <div className="row">
            <IconButton label="Mês anterior" onClick={() => shift(-1)}><ChevronLeft /></IconButton>
            <h2 style={{ textTransform: 'capitalize', minWidth: 150, textAlign: 'center' }}>{MONTHS[d.getMonth()]} {d.getFullYear()}</h2>
            <IconButton label="Mês seguinte" onClick={() => shift(1)}><ChevronRight /></IconButton>
          </div>
          <div className="row">
            <Button variant="ghost" size="sm" onClick={() => { setMonth(now.slice(0, 7)); setSelected(now); }}>Hoje</Button>
            <Button size="sm" icon={<CalendarPlus />} onClick={() => setEditor({ event: null, date: selected })}>Adicionar</Button>
          </div>
        </div>
        <div className="cal-grid">
          {WEEKDAYS_SHORT.map((w) => <div key={w} className="cal-dow">{w}</div>)}
          {cells.slice(0, lastRow).map((c) => {
            const evs = byDate.get(c) ?? [];
            return (
              <button key={c} type="button" onClick={() => setSelected(c)} onDoubleClick={() => setEditor({ event: null, date: c })}
                className={`cal-cell ${c.slice(0, 7) !== month ? 'out' : ''} ${c === now ? 'today' : ''} ${c === selected ? 'sel' : ''}`}>
                <span className="n">{parseISODate(c).getDate()}</span>
                {evs.slice(0, 2).map((e) => <span key={e.id} className={`cal-ev ${e.type}`}>{e.subject ? getSubject(e.subject, q?.customSubjects).short : e.title}</span>)}
                {evs.length > 2 && <span className="tiny faint">+{evs.length - 2}</span>}
                <span className="cal-dots">{evs.slice(0, 3).map((e) => <i key={e.id} className={e.type} />)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack lg">
        <div className="card">
          <div className="card-head">
            <span className="card-title" style={{ textTransform: 'capitalize' }}>{formatDateLong(selected)}</span>
            <IconButton label="Adicionar neste dia" onClick={() => setEditor({ event: null, date: selected })}><CalendarPlus /></IconButton>
          </div>
          {dayEvents.length ? dayEvents.map((e) => <EventRow key={e.id} e={e} onEdit={() => setEditor({ event: e, date: e.date })} onDelete={() => setDeleting(e)} />) : (
            <p className="muted small">Nada marcado neste dia.</p>
          )}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><ClipboardCheck /> Próximos</span></div>
          {upcoming.length ? upcoming.map((e) => <EventRow key={e.id} e={e} showDate onEdit={() => setEditor({ event: e, date: e.date })} onDelete={() => setDeleting(e)} />) : (
            <p className="muted small">Sem testes nem trabalhos marcados.</p>
          )}
        </div>
      </div>

      {editor && <EventEditor open onClose={() => setEditor(null)} event={editor.event} date={editor.date} key={editor.event?.id ?? editor.date} />}
      <Confirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} title="Apagar evento?" text={`«${deleting?.title}» vai ser apagado do calendário.`} />
    </div>
  );
}

function EventRow({ e, onEdit, onDelete, showDate }: { e: CalendarEvent; onEdit: () => void; onDelete: () => void; showDate?: boolean }) {
  const Icon = TYPE_ICON[e.type];
  const n = daysBetween(today(), e.date);
  return (
    <div className="list-item">
      <span className={`event-type ${e.type}`}><Icon /></span>
      <div className="grow">
        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
        <div className="tiny muted">
          {TYPE_LABEL[e.type]}
          {showDate && ` · ${n === 0 ? 'hoje' : n === 1 ? 'amanhã' : `daqui a ${n} dias`}`}
          {e.notes && ` · ${e.notes.slice(0, 60)}`}
        </div>
      </div>
      <IconButton label="Editar" small onClick={onEdit}><Pencil /></IconButton>
      <IconButton label="Apagar" small onClick={onDelete}><Trash2 /></IconButton>
    </div>
  );
}
