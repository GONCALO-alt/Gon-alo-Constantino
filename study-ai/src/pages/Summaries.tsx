import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, FileText, Layers, MessagesSquare, Pencil, PenLine, Plus, Search, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { api } from '../api';
import { DictationModal } from '../components/Dictation';
import { Markdown, plainText } from '../components/Markdown';
import { Promo } from '../components/Promo';
import { SubjectIcon } from '../components/SubjectIcon';
import { Button, Confirm, Empty, Field, FormError, Modal, PageHead, Skeleton, Tabs } from '../components/ui';
import { invalidate, updateCached, useApp, useMe, useQuery } from '../state';
import { formatDayMonth, toISODate } from '../../shared/dates';
import type { UsageSnapshot } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import type { Deck, Summary } from '../../shared/types';

function SubjectSelect({ value, onChange, allLabel = 'Sem disciplina' }: { value: string; onChange: (v: string) => void; allLabel?: string }) {
  const me = useMe();
  const q = me.profile.questionnaire;
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
    </select>
  );
}

function NewSummaryModal({ onClose, initialSubject }: { onClose: () => void; initialSubject: string }) {
  const me = useMe();
  const { toast, setUsage } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ia' | 'manual'>(me.ai.configured ? 'ia' : 'manual');
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const r =
        mode === 'ia'
          ? await api<{ summary: Summary; usage?: UsageSnapshot }>('/summaries/generate', { method: 'POST', body: { subject: subject || null, topic } })
          : await api<{ summary: Summary; usage?: UsageSnapshot }>('/summaries', { method: 'POST', body: { subject: subject || null, title, content, source: 'manual' } });
      if (r.usage) setUsage(r.usage);
      // A página do resumo lê a lista: junta-o já, para não aparecer «não encontrado».
      updateCached<{ summaries: Summary[] }>('/summaries', (d) => ({ summaries: [r.summary, ...d.summaries] }));
      invalidate('/stats');
      toast(mode === 'ia' ? 'Resumo criado pela IA.' : 'Resumo guardado.');
      navigate(`/resumos/${r.summary.id}`);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Novo resumo" wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} loading={loading} disabled={mode === 'ia' ? !me.ai.configured || topic.trim().length < 2 : !title.trim() || !content.trim()} icon={mode === 'ia' ? <WandSparkles /> : <Check />}>
          {mode === 'ia' ? (loading ? 'A IA está a escrever…' : 'Criar com IA') : 'Guardar'}
        </Button></>}>
      <div className="stack">
        <Tabs value={mode} onChange={setMode} items={[{ value: 'ia', label: 'Criar com IA', icon: <Sparkles /> }, { value: 'manual', label: 'Escrever eu', icon: <Pencil /> }]} />
        <Field label="Disciplina"><SubjectSelect value={subject} onChange={setSubject} /></Field>
        {mode === 'ia' ? (
          <>
            <Field label="Matéria do resumo">
              <input className="input" value={topic} maxLength={300} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: A Revolução Francesa; equações do 2.º grau; o ciclo da água" />
            </Field>
            {!me.ai.configured && <p className="small" style={{ color: 'var(--danger)' }}>A IA não está ligada neste servidor. Podes escrever o resumo tu mesmo.</p>}
            <p className="tiny faint">Conta como 1 pergunta do teu plano de IA.</p>
          </>
        ) : (
          <>
            <Field label="Título"><input className="input" value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Resumo (podes usar Markdown: ## título, **negrito**, - listas)">
              <textarea className="textarea" style={{ minHeight: 220 }} value={content} onChange={(e) => setContent(e.target.value)} />
            </Field>
          </>
        )}
        <FormError>{error}</FormError>
      </div>
    </Modal>
  );
}

export function SummariesPage() {
  const me = useMe();
  const custom = me.profile.questionnaire?.customSubjects;
  const [params, setParams] = useSearchParams();
  const list = useQuery<{ summaries: Summary[] }>('/summaries');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (params.get('novo') === '1') {
      setCreating(params.get('subject') ?? '');
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const items = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (list.data?.summaries ?? []).filter(
      (x) => (!subject || x.subject === subject) && (!s || x.title.toLowerCase().includes(s) || x.content.toLowerCase().includes(s)),
    );
  }, [list.data, search, subject]);

  return (
    <div>
      <PageHead title="Resumos" sub="Os resumos que guardaste do chat, os que a IA criou e os que escreveste."
        actions={<Button icon={<Plus />} onClick={() => setCreating('')}>Novo resumo</Button>} />
      <div style={{ marginBottom: 18 }} className="slot-gap"><Promo slot="resumos" /></div>
      <div className="row wrap" style={{ marginBottom: 18 }}>
        <div className="input-icon grow" style={{ minWidth: 220 }}>
          <Search />
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar nos resumos" />
        </div>
        <div style={{ width: 230 }}><SubjectSelect value={subject} onChange={setSubject} allLabel="Todas as disciplinas" /></div>
      </div>
      {list.loading ? (
        <div className="grid-auto"><Skeleton height={170} /><Skeleton height={170} /><Skeleton height={170} /></div>
      ) : items.length ? (
        <div className="grid-auto">
          {items.map((x, i) => (
            <Link key={x.id} to={`/resumos/${x.id}`} className="card interactive summary-card fade-up" style={{ ['--i' as string]: i }}>
              <div className="row between">
                <SubjectIcon id={x.subject} custom={custom} size="sm" />
                <span className={`badge ${x.source === 'ia' ? 'yellow' : ''}`}>{x.source === 'ia' ? <><Sparkles /> IA</> : 'Escrito por mim'}</span>
              </div>
              <h3>{x.title}</h3>
              <p className="excerpt">{plainText(x.content, 220)}</p>
              <span className="tiny faint" style={{ marginTop: 'auto' }}>{x.subject ? getSubject(x.subject, custom).name : 'Geral'} · {formatDayMonth(toISODate(new Date(x.updatedAt)))}</span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty icon={<FileText />} title={search || subject ? 'Nenhum resumo encontrado' : 'Ainda não tens resumos'}
          text="Cria um resumo com a IA, escreve o teu, ou guarda uma resposta do chat com «Guardar resumo»."
          action={<Button icon={<Plus />} onClick={() => setCreating('')}>Novo resumo</Button>} />
      )}
      {creating !== null && <NewSummaryModal onClose={() => setCreating(null)} initialSubject={creating} />}
    </div>
  );
}

export function SummaryPage() {
  const { id = '' } = useParams();
  const me = useMe();
  const { toast, setUsage } = useApp();
  const navigate = useNavigate();
  const custom = me.profile.questionnaire?.customSubjects;
  const all = useQuery<{ summaries: Summary[] }>('/summaries');
  const summary = all.data?.summaries.find((s) => s.id === id);
  const [editing, setEditing] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', content: '' });
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flashLoading, setFlashLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (all.loading) return <Skeleton height={300} />;
  if (!summary) return <Empty icon={<FileText />} title="Resumo não encontrado" action={<Link to="/resumos" className="btn btn-secondary">Voltar aos resumos</Link>} />;

  async function save() {
    setSaving(true);
    try {
      await api(`/summaries/${id}`, { method: 'PUT', body: { title: form.title, subject: form.subject || null, content: form.content } });
      invalidate('/summaries');
      setEditing(false);
      toast('Resumo atualizado.');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    await api(`/summaries/${id}`, { method: 'DELETE' });
    invalidate('/summaries', '/stats');
    toast('Resumo apagado.');
    navigate('/resumos');
  }

  async function makeFlashcards() {
    setFlashLoading(true);
    try {
      const r = await api<{ deck: Deck; usage: UsageSnapshot }>('/decks/generate', { method: 'POST', body: { subject: summary!.subject, summaryId: id, count: 12 } });
      setUsage(r.usage);
      invalidate('/decks', '/stats');
      toast('Flashcards criados a partir do resumo.');
      navigate(`/flashcards/${r.deck.id}`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setFlashLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(summary!.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="reader">
      <Link to="/resumos" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}><ArrowLeft /> Resumos</Link>
      <div className="card pad-lg fade-up">
        <div className="row between top wrap" style={{ marginBottom: 18 }}>
          <div className="row" style={{ gap: 14 }}>
            <SubjectIcon id={summary.subject} custom={custom} />
            <div>
              <h1 style={{ fontSize: 26 }}>{summary.title}</h1>
              <div className="tiny faint" style={{ marginTop: 4 }}>
                {summary.subject ? getSubject(summary.subject, custom).name : 'Geral'} · {summary.source === 'ia' ? 'Criado pela IA' : 'Escrito por ti'} · atualizado a {formatDayMonth(toISODate(new Date(summary.updatedAt)))}
              </div>
            </div>
          </div>
        </div>
        <div className="row wrap" style={{ marginBottom: 22 }}>
          <Button variant="secondary" size="sm" icon={<PenLine />} onClick={() => setDictating(true)}>Ditado</Button>
          <Button variant="secondary" size="sm" icon={copied ? <Check /> : <Copy />} onClick={copy}>{copied ? 'Copiado' : 'Copiar'}</Button>
          <Button variant="secondary" size="sm" icon={<Pencil />} onClick={() => { setForm({ title: summary.title, subject: summary.subject ?? '', content: summary.content }); setEditing(true); }}>Editar</Button>
          <Button variant="secondary" size="sm" icon={<Layers />} loading={flashLoading} disabled={!me.ai.configured} onClick={makeFlashcards} title={me.ai.configured ? '' : 'A IA não está ligada'}>Criar flashcards com IA</Button>
          <Link className="btn btn-secondary btn-sm" to={`/chat?q=${encodeURIComponent(`Tenho este resumo sobre «${summary.title}». Faz-me perguntas para ver se percebi a matéria.`)}${summary.subject ? `&subject=${summary.subject}` : ''}`}>
            <MessagesSquare /> Treinar com a IA
          </Link>
          <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => setDeleting(true)}>Apagar</Button>
        </div>
        <Markdown text={summary.content} />
      </div>
      <DictationModal text={dictating ? summary.content : null} title={summary.title} onClose={() => setDictating(false)} />
      {editing && (
        <Modal open onClose={() => setEditing(false)} title="Editar resumo" wide
          footer={<><Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button><Button onClick={save} loading={saving}>Guardar</Button></>}>
          <div className="stack">
            <Field label="Título"><input className="input" value={form.title} maxLength={140} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Disciplina"><SubjectSelect value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} /></Field>
            <Field label="Conteúdo (Markdown)"><textarea className="textarea" style={{ minHeight: 320, fontFamily: 'ui-monospace, monospace', fontSize: 13.5 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
      <Confirm open={deleting} onClose={() => setDeleting(false)} onConfirm={remove} title="Apagar resumo?" text="O resumo é apagado para sempre." />
    </div>
  );
}
