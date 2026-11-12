import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CalendarDays, ClipboardCheck, FileText, Layers, MessagesSquare, Plus, Settings2, Sparkles, Star, Timer,
} from 'lucide-react';
import { api } from '../api';
import { SubjectIcon } from '../components/SubjectIcon';
import { Button, Empty, IconButton, Modal, PageHead } from '../components/ui';
import { usePlanWeek } from '../planData';
import { invalidate, useApp, useMe, useQuery } from '../state';
import { daysBetween, formatDateShort, formatMinutes, today, WEEKDAYS } from '../../shared/dates';
import { minutesBySubject } from '../../shared/planner';
import { customSubjectId, getSubject, SUBJECT_LIST } from '../../shared/subjects';
import { ACTIVITY_LABELS, type Conversation, type Deck, type MeResponse, type PracticeTest, type Summary } from '../../shared/types';

interface Stats {
  weekSubjects: { subject: string | null; minutes: number }[];
  allSubjects: { subject: string | null; minutes: number }[];
}

function useFavorites() {
  const me = useMe();
  const { setMe } = useApp();
  const favorites = me.profile.favorites;
  return {
    favorites,
    toggle: async (id: string) => {
      const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
      setMe(await api<MeResponse>('/profile/favorites', { method: 'PUT', body: { favorites: next } }));
    },
  };
}

function ManageSubjects({ onClose }: { onClose: () => void }) {
  const me = useMe();
  const { setMe, toast } = useApp();
  const q = me.profile.questionnaire!;
  const [subjects, setSubjects] = useState(q.subjects);
  const [difficult, setDifficult] = useState(q.difficult);
  const [easy, setEasy] = useState(q.easy);
  const [custom, setCustom] = useState(q.customSubjects);
  const [name, setName] = useState('');
  const [regenerate, setRegenerate] = useState(true);
  const [saving, setSaving] = useState(false);
  const ids = [...new Set([...SUBJECT_LIST.map((s) => s.id), ...Object.keys(custom)])];

  function cycle(id: string) {
    if (!subjects.includes(id)) {
      setSubjects([...subjects, id]);
    } else if (!difficult.includes(id) && !easy.includes(id)) {
      setDifficult([...difficult, id]);
    } else if (difficult.includes(id)) {
      setDifficult(difficult.filter((x) => x !== id));
      setEasy([...easy, id]);
    } else {
      setEasy(easy.filter((x) => x !== id));
      setSubjects(subjects.filter((x) => x !== id));
    }
  }

  async function save() {
    if (!subjects.length) return toast('Escolhe pelo menos uma disciplina.', 'error');
    setSaving(true);
    try {
      const r = await api<{ me: MeResponse }>('/profile/questionnaire', {
        method: 'PUT',
        body: { questionnaire: { ...q, subjects, difficult, easy, customSubjects: custom, tests: [] }, regenerate },
      });
      setMe(r.me);
      invalidate('/plan');
      toast(regenerate ? 'Disciplinas guardadas e plano atualizado.' : 'Disciplinas guardadas.');
      onClose();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Gerir disciplinas" wide
      footer={
        <>
          <label className="row small" style={{ marginRight: 'auto', cursor: 'pointer' }}>
            <input type="checkbox" checked={regenerate} onChange={(e) => setRegenerate(e.target.checked)} style={{ accentColor: '#FFD400' }} />
            Atualizar o plano de estudos
          </label>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} loading={saving}>Guardar</Button>
        </>
      }>
      <p className="small muted" style={{ marginBottom: 14 }}>
        Toca para mudar: <span className="badge">Não tenho</span> → <span className="badge yellow">Tenho</span> → <span className="badge red">Difícil</span> → <span className="badge green">Fácil</span>
      </p>
      <div className="row wrap" style={{ gap: 8 }}>
        {ids.map((id) => {
          const on = subjects.includes(id);
          const tag = difficult.includes(id) ? 'red' : easy.includes(id) ? 'green' : on ? 'yellow' : '';
          return (
            <button key={id} type="button" className={`chip ${on ? 'on-soft' : ''}`} onClick={() => cycle(id)}>
              {getSubject(id, custom).name}
              {tag && <span className={`badge ${tag}`} style={{ height: 20 }}>{tag === 'red' ? 'Difícil' : tag === 'green' ? 'Fácil' : '✓'}</span>}
            </button>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 16, maxWidth: 440 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Outra disciplina…" maxLength={40} />
        <Button variant="secondary" icon={<Plus />} onClick={() => {
          if (!name.trim()) return;
          const id = customSubjectId(name);
          setCustom({ ...custom, [id]: name.trim() });
          setSubjects([...new Set([...subjects, id])]);
          setName('');
        }}>Adicionar</Button>
      </div>
    </Modal>
  );
}

export function SubjectsPage() {
  const me = useMe();
  const q = me.profile.questionnaire;
  const custom = q?.customSubjects;
  const { favorites, toggle } = useFavorites();
  const pw = usePlanWeek(today());
  const stats = useQuery<Stats>(`/stats?date=${today()}`);
  const summaries = useQuery<{ summaries: Summary[] }>('/summaries');
  const decks = useQuery<{ decks: Deck[] }>(`/decks?date=${today()}`);
  const [manage, setManage] = useState(false);
  const planned = pw.plan ? minutesBySubject(pw.plan) : new Map<string, number>();
  const now = today();
  const subjects = [...(q?.subjects ?? [])].sort((a, b) => Number(favorites.includes(b)) - Number(favorites.includes(a)));

  return (
    <div>
      <PageHead title="Disciplinas" sub="Todas as tuas disciplinas, com o tempo de estudo, testes, resumos e flashcards de cada uma."
        actions={<Button variant="secondary" icon={<Settings2 />} onClick={() => setManage(true)}>Gerir disciplinas</Button>} />
      <div className="grid-auto">
        {subjects.map((id, i) => {
          const s = getSubject(id, custom);
          const studied = stats.data?.weekSubjects.find((x) => x.subject === id)?.minutes ?? 0;
          const plan = planned.get(id) ?? 0;
          const test = pw.events.find((e) => e.subject === id && e.type === 'teste' && daysBetween(now, e.date) >= 0);
          const nSum = summaries.data?.summaries.filter((x) => x.subject === id).length ?? 0;
          const nDeck = decks.data?.decks.filter((x) => x.subject === id).length ?? 0;
          return (
            <Link key={id} to={`/disciplinas/${id}`} className="card interactive subject-card fade-up" style={{ ['--i' as string]: i }}>
              <IconButton label={favorites.includes(id) ? 'Tirar dos favoritos' : 'Marcar como favorita'} small className="star" active={favorites.includes(id)}
                onClick={(e) => { e.preventDefault(); toggle(id); }}>
                <Star fill={favorites.includes(id) ? 'currentColor' : 'none'} />
              </IconButton>
              <SubjectIcon id={id} custom={custom} size="lg" />
              <div>
                <h3>{s.name}</h3>
                <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                  {q?.difficult.includes(id) && <span className="badge red">Difícil</span>}
                  {q?.easy.includes(id) && <span className="badge green">Fácil</span>}
                  {test && <span className="badge yellow">Teste {formatDateShort(test.date)}</span>}
                </div>
              </div>
              <div className="stack sm small muted" style={{ marginTop: 'auto' }}>
                <span>{plan ? `${formatMinutes(studied)} de ${formatMinutes(plan)} esta semana` : `${formatMinutes(studied)} esta semana`}</span>
                <span className="tiny faint">{nSum} resumos · {nDeck} baralhos de flashcards</span>
              </div>
            </Link>
          );
        })}
      </div>
      {!subjects.length && <Empty icon={<BookOpen />} title="Sem disciplinas" text="Adiciona as tuas disciplinas para começar." action={<Button onClick={() => setManage(true)}>Adicionar disciplinas</Button>} />}
      {manage && <ManageSubjects onClose={() => setManage(false)} />}
    </div>
  );
}

export function SubjectDetailPage() {
  const { id = '' } = useParams();
  const me = useMe();
  const q = me.profile.questionnaire;
  const custom = q?.customSubjects;
  const s = getSubject(id, custom);
  const { favorites, toggle } = useFavorites();
  const pw = usePlanWeek(today());
  const summaries = useQuery<{ summaries: Summary[] }>('/summaries');
  const convs = useQuery<{ conversations: Conversation[] }>('/conversations');
  const tests = useQuery<{ tests: PracticeTest[] }>('/tests');
  const decks = useQuery<{ decks: Deck[] }>(`/decks?date=${today()}`);
  const now = today();
  const events = pw.events.filter((e) => e.subject === id && daysBetween(now, e.date) >= 0);
  const sessions = (pw.plan?.sessions ?? []).filter((x) => x.subject === id).sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
  const mySummaries = (summaries.data?.summaries ?? []).filter((x) => x.subject === id);
  const myConvs = (convs.data?.conversations ?? []).filter((x) => x.subject === id).slice(0, 6);
  const myTests = (tests.data?.tests ?? []).filter((x) => x.subject === id).slice(0, 6);
  const myDecks = (decks.data?.decks ?? []).filter((x) => x.subject === id);

  const actions = [
    { to: `/chat?subject=${id}`, icon: MessagesSquare, label: 'Perguntar à IA' },
    { to: `/resumos?novo=1&subject=${id}`, icon: FileText, label: 'Criar resumo' },
    { to: `/testes?subject=${id}`, icon: ClipboardCheck, label: 'Gerar teste' },
    { to: `/testes/flashcards?subject=${id}`, icon: Layers, label: 'Flashcards' },
    { to: `/estudar?subject=${id}`, icon: Timer, label: 'Modo de estudo' },
  ];

  return (
    <div>
      <Link to="/disciplinas" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}><ArrowLeft /> Disciplinas</Link>
      <div className="card card-glow pad-lg fade-up">
        <div className="row between top wrap">
          <div className="row" style={{ gap: 16 }}>
            <SubjectIcon id={id} custom={custom} size="lg" />
            <div>
              <h1>{s.name}</h1>
              <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                {q?.difficult.includes(id) && <span className="badge red">Tens mais dificuldades</span>}
                {q?.easy.includes(id) && <span className="badge green">Tens facilidade</span>}
                <span className="badge">{sessions.length} sessões por semana</span>
              </div>
            </div>
          </div>
          <IconButton label="Favorita" active={favorites.includes(id)} onClick={() => toggle(id)}>
            <Star fill={favorites.includes(id) ? 'currentColor' : 'none'} />
          </IconButton>
        </div>
        <div className="row wrap" style={{ marginTop: 20 }}>
          {actions.map((a, i) => (
            <Link key={a.label} to={a.to} className={`btn ${i === 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}><a.icon /> {a.label}</Link>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head"><span className="card-title"><CalendarDays /> Próximos testes e trabalhos</span><Link to="/plano/calendario" className="icon-btn sm" aria-label="Calendário"><Plus /></Link></div>
          {events.length ? events.map((e) => (
            <div key={e.id} className="list-item"><span className="badge yellow">{formatDateShort(e.date)}</span><span className="grow">{e.title}</span></div>
          )) : <p className="muted small">Nada marcado.</p>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><Timer /> No plano de estudos</span><Link to="/plano" className="btn btn-ghost btn-sm">Abrir plano</Link></div>
          {sessions.length ? sessions.map((x) => (
            <div key={x.id} className="list-item small"><b style={{ width: 70 }}>{WEEKDAYS[x.weekday]?.slice(0, 3)}</b><span>{x.start}</span><span className="muted grow">{ACTIVITY_LABELS[x.activity]}</span><span className="faint">{x.minutes} min</span></div>
          )) : <p className="muted small">Esta disciplina não tem sessões no plano.</p>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><FileText /> Resumos</span><Link to={`/resumos?novo=1&subject=${id}`} className="icon-btn sm" aria-label="Novo resumo"><Plus /></Link></div>
          {mySummaries.length ? mySummaries.slice(0, 6).map((x) => (
            <Link key={x.id} to={`/resumos/${x.id}`} className="list-item"><FileText size={16} className="yellow" /><span className="grow">{x.title}</span><span className="tiny faint">{x.source === 'ia' ? 'IA' : 'Meu'}</span></Link>
          )) : <p className="muted small">Ainda não tens resumos desta disciplina.</p>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><Sparkles /> Conversas com a IA</span></div>
          {myConvs.length ? myConvs.map((c) => (
            <Link key={c.id} to={`/chat/${c.id}`} className="list-item"><MessagesSquare size={16} className="yellow" /><span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span></Link>
          )) : <p className="muted small">Escolhe esta disciplina no chat para as conversas aparecerem aqui.</p>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><ClipboardCheck /> Testes de preparação</span></div>
          {myTests.length ? myTests.map((t) => (
            <Link key={t.id} to={`/testes/${t.id}`} className="list-item"><span className="grow">{t.title}</span>
              {t.score !== null ? <span className="badge yellow">{Math.round((t.score / t.maxScore) * 100)}%</span> : <span className="badge">Por fazer</span>}</Link>
          )) : <p className="muted small">Gera um teste para treinar.</p>}
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title"><Layers /> Flashcards</span></div>
          {myDecks.length ? myDecks.map((d) => (
            <Link key={d.id} to={`/flashcards/${d.id}`} className="list-item"><span className="grow">{d.title}</span><span className="tiny faint">{d.cardCount} cartões · {d.dueCount} para rever</span></Link>
          )) : <p className="muted small">Sem flashcards desta disciplina.</p>}
        </div>
      </div>
    </div>
  );
}
