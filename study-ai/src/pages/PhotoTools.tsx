// Fotos da matéria → resumo, flashcards e teste; correção de redações.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Camera, ClipboardCheck, FileText, Layers, PenLine, Sparkles, Trash2, Type } from 'lucide-react';
import { api } from '../api';
import { DictationModal } from '../components/Dictation';
import { Markdown } from '../components/Markdown';
import { PhotoPicker, photoIds, photosReady, type PickedPhoto } from '../components/PhotoPicker';
import { Button, Confirm, Empty, Field, FormError, Progress, Skeleton, Tabs } from '../components/ui';
import { invalidate, useApp, useMe, useQuery } from '../state';
import { formatDayMonth } from '../../shared/dates';
import type { UsageSnapshot } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import { ESSAY_KIND_LABELS, type Deck, type Essay, type EssayKind, type PracticeTest, type Summary } from '../../shared/types';

/** A versão tem esta funcionalidade? (a versão com servidor Node não tem as funções com fotos). */
export const hasFeature = (features: string[] | undefined, f: string) => !!features?.includes(f);

function SubjectSelect({ value, onChange, optional = true }: { value: string; onChange: (v: string) => void; optional?: boolean }) {
  const me = useMe();
  const q = me.profile.questionnaire;
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {optional && <option value="">Sem disciplina</option>}
      {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
    </select>
  );
}

// ---------- fotos da matéria ----------

export function PhotoMaterials() {
  const me = useMe();
  const { setUsage, toast } = useApp();
  const q = me.profile.questionnaire;
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [subject, setSubject] = useState(q?.difficult[0] ?? q?.subjects[0] ?? '');
  const [make, setMake] = useState<'both' | 'flashcards' | 'test'>('both');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ summary: Summary; deck: Deck | null; test: PracticeTest | null } | null>(null);

  async function create() {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ summary: Summary; deck: Deck | null; test: PracticeTest | null; usage: UsageSnapshot }>('/photos/materials', {
        method: 'POST',
        body: { attachmentIds: photoIds(photos), subject: subject || null, make },
      });
      setUsage(r.usage);
      invalidate('/summaries', '/decks', '/tests', '/stats');
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setResult(r);
      toast('Pronto! A matéria das fotos já está nos teus resumos.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (result)
    return (
      <section className="card pad-lg fade-up">
        <div className="card-head"><span className="card-title"><Sparkles /> Feito a partir das tuas fotos</span></div>
        <div className="stack">
          <Link to={`/resumos/${result.summary.id}`} className="tool-result"><FileText /><span className="grow"><b>Resumo</b><span className="tiny faint">{result.summary.title} · podes usar o «Ditado» para o passar para o caderno</span></span></Link>
          {result.deck && <Link to={`/flashcards/${result.deck.id}`} className="tool-result"><Layers /><span className="grow"><b>Flashcards</b><span className="tiny faint">{result.deck.cardCount} cartões para memorizar</span></span></Link>}
          {result.test && <Link to={`/testes/${result.test.id}`} className="tool-result"><ClipboardCheck /><span className="grow"><b>Teste de preparação</b><span className="tiny faint">{result.test.questions.length} perguntas sobre esta matéria</span></span></Link>}
          <Button variant="secondary" icon={<Camera />} onClick={() => setResult(null)}>Fotografar outra matéria</Button>
        </div>
      </section>
    );

  return (
    <section className="card pad-lg">
      <div className="card-head"><span className="card-title"><Camera /> Fotografa a matéria</span></div>
      <p className="muted small" style={{ marginBottom: 14 }}>
        Tira fotografias a páginas do livro, do caderno ou de uma ficha. A IA lê a matéria, faz um resumo e cria flashcards e um teste de preparação só sobre isso.
      </p>
      <div className="stack">
        <PhotoPicker photos={photos} onChange={setPhotos} />
        <div className="grid-2" style={{ gap: 10 }}>
          <Field label="Disciplina"><SubjectSelect value={subject} onChange={setSubject} /></Field>
          <Field label="Criar">
            <div className="seg">
              <button type="button" className={make === 'both' ? 'on' : ''} onClick={() => setMake('both')}>Os dois</button>
              <button type="button" className={make === 'flashcards' ? 'on' : ''} onClick={() => setMake('flashcards')}>Flashcards</button>
              <button type="button" className={make === 'test' ? 'on' : ''} onClick={() => setMake('test')}>Teste</button>
            </div>
          </Field>
        </div>
        <FormError>{error}</FormError>
        <Button size="lg" icon={<Sparkles />} loading={busy} disabled={!photosReady(photos)} onClick={create}>
          {busy ? 'A ler as fotos e a preparar…' : 'Criar a partir das fotos'}
        </Button>
        {busy && <p className="tiny faint center">Pode demorar até um minuto. Conta como 1 pergunta.</p>}
      </div>
    </section>
  );
}

// ---------- redações ----------

type EssayListItem = { id: string; title: string; kind: EssayKind; grade: number; level: string; createdAt: string };

export function EssaysTab() {
  const me = useMe();
  const navigate = useNavigate();
  const { setUsage } = useApp();
  const list = useQuery<{ essays: EssayListItem[] }>('/essays');
  const canPhoto = hasFeature(me.features, 'photos');
  const [mode, setMode] = useState<'texto' | 'foto'>('texto');
  const [text, setText] = useState('');
  const [kind, setKind] = useState<EssayKind>('opiniao');
  const [theme, setTheme] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ready = mode === 'texto' ? words >= 30 : photosReady(photos);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ essay: Essay; usage: UsageSnapshot }>('/essays/review', {
        method: 'POST',
        body: { kind, theme, ...(mode === 'texto' ? { text } : { attachmentIds: photoIds(photos) }) },
      });
      setUsage(r.usage);
      invalidate('/essays', '/stats');
      navigate(`/testes/redacoes/${r.essay.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack lg">
      <form className="card pad-lg stack" onSubmit={submit} noValidate>
        <div className="card-head"><span className="card-title"><PenLine /> Corrigir uma redação</span></div>
        <p className="muted small">A IA corrige como um professor de Português: dá uma nota de 0 a 20, mostra os erros com a explicação e sugere uma versão melhorada.</p>
        <div className="grid-2" style={{ gap: 10 }}>
          <Field label="Tipo de texto">
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value as EssayKind)}>
              {(Object.keys(ESSAY_KIND_LABELS) as EssayKind[]).map((k) => <option key={k} value={k}>{ESSAY_KIND_LABELS[k]}</option>)}
            </select>
          </Field>
          <Field label="Tema ou enunciado (opcional)"><input className="input" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex.: Os telemóveis na escola" maxLength={300} /></Field>
        </div>
        {canPhoto && (
          <Tabs value={mode} onChange={setMode} items={[{ value: 'texto', label: 'Escrever', icon: <Type /> }, { value: 'foto', label: 'Fotografar', icon: <Camera /> }]} />
        )}
        {mode === 'texto' ? (
          <Field label={`A tua redação · ${words} ${words === 1 ? 'palavra' : 'palavras'}`}>
            <textarea className="input" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreve ou cola aqui a tua redação (pelo menos 30 palavras)…" maxLength={12000} />
          </Field>
        ) : (
          <PhotoPicker photos={photos} onChange={setPhotos} label="Fotografar a redação" />
        )}
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" icon={<Sparkles />} loading={busy} disabled={!ready}>{busy ? 'A corrigir…' : 'Corrigir a redação'}</Button>
      </form>

      <section className="card">
        <div className="card-head"><span className="card-title"><BookOpen /> As minhas redações</span></div>
        {list.loading ? (
          <Skeleton height={60} />
        ) : list.data?.essays.length ? (
          <div className="stack" style={{ gap: 8 }}>
            {list.data.essays.map((e) => (
              <Link key={e.id} to={`/testes/redacoes/${e.id}`} className="tool-result">
                <span className={`grade-pill ${gradeClass(e.grade)}`}>{e.grade}</span>
                <span className="grow" style={{ minWidth: 0 }}>
                  <b>{e.title}</b>
                  <span className="tiny faint">{ESSAY_KIND_LABELS[e.kind]} · {e.level} · {formatDayMonth(e.createdAt.slice(0, 10))}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty icon={<PenLine />} title="Ainda sem redações" text="Corrige a primeira e acompanha a tua evolução aqui." />
        )}
      </section>
    </div>
  );
}

const gradeClass = (g: number) => (g < 10 ? 'low' : g < 14 ? 'mid' : 'high');
const ERROR_LABEL: Record<string, string> = {
  ortografia: 'Ortografia', 'acentuação': 'Acentuação', 'pontuação': 'Pontuação', 'gramática': 'Gramática', 'vocabulário': 'Vocabulário', estrutura: 'Estrutura',
};

export function EssayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useApp();
  const r = useQuery<{ essay: Essay }>(`/essays/${id}`);
  const [deleting, setDeleting] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [view, setView] = useState<'correcao' | 'melhorada' | 'original'>('correcao');
  if (r.loading) return <div className="stack"><Skeleton height={120} /><Skeleton height={300} /></div>;
  const e = r.data?.essay;
  if (!e) return <Empty icon={<PenLine />} title="Redação não encontrada" text="Pode ter sido apagada." action={<Link to="/testes/redacoes" className="btn btn-secondary btn-sm">Voltar</Link>} />;
  const rv = e.review;

  async function remove() {
    await api(`/essays/${id}`, { method: 'DELETE' });
    invalidate('/essays');
    toast('Redação apagada.');
    navigate('/testes/redacoes');
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/testes/redacoes" className="btn btn-ghost btn-sm" style={{ marginBottom: 10 }}><ArrowLeft /> Redações</Link>
      <section className="card pad-lg">
        <div className="essay-head">
          <div className={`essay-grade ${gradeClass(rv.grade)}`}>
            <b>{rv.grade}</b>
            <span>/20</span>
          </div>
          <div className="grow" style={{ minWidth: 0 }}>
            <h1 className="essay-title">{e.title}</h1>
            <div className="small muted">{ESSAY_KIND_LABELS[e.kind]} · {rv.level} · {rv.wordCount} palavras{e.fromPhoto ? ' · fotografada' : ''}</div>
            {rv.summary && <p style={{ marginTop: 10 }}>{rv.summary}</p>}
          </div>
        </div>

        <div className="stack" style={{ gap: 10, marginTop: 18 }}>
          {rv.criteria.map((c) => (
            <div key={c.name}>
              <div className="row between small"><b>{c.name}</b><span className="faint">{c.score}/{c.max}</span></div>
              <Progress value={c.score} max={c.max} thin green={c.score / c.max >= 0.7} />
              {c.comment && <div className="tiny faint" style={{ marginTop: 4 }}>{c.comment}</div>}
            </div>
          ))}
        </div>

        {(rv.strengths.length > 0 || rv.improvements.length > 0) && (
          <div className="grid-2" style={{ gap: 12, marginTop: 18 }}>
            {rv.strengths.length > 0 && (
              <div className="essay-box good">
                <b>👍 Pontos fortes</b>
                <ul>{rv.strengths.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
            {rv.improvements.length > 0 && (
              <div className="essay-box">
                <b>🎯 Para a próxima</b>
                <ul>{rv.improvements.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card pad-lg" style={{ marginTop: 18 }}>
        <Tabs value={view} onChange={setView} items={[
          { value: 'correcao', label: `Erros (${rv.errors.length})` },
          { value: 'melhorada', label: 'Versão melhorada' },
          { value: 'original', label: 'O meu texto' },
        ]} />
        <div style={{ marginTop: 16 }}>
          {view === 'correcao' && (
            rv.errors.length ? (
              <div className="stack" style={{ gap: 10 }}>
                {rv.errors.map((x, i) => (
                  <div key={i} className="essay-error">
                    <span className="badge">{ERROR_LABEL[x.type] ?? x.type}</span>
                    <div className="essay-fix"><s>{x.original}</s> → <b>{x.correction}</b></div>
                    <div className="small muted">{x.explanation}</div>
                  </div>
                ))}
              </div>
            ) : <p className="muted">Não foram encontrados erros importantes. Muito bem! 🎉</p>
          )}
          {view === 'melhorada' && (
            <>
              <div className="row wrap" style={{ marginBottom: 12 }}>
                <Button variant="secondary" size="sm" icon={<PenLine />} onClick={() => setDictating(true)}>Ditado da versão melhorada</Button>
              </div>
              <Markdown text={rv.improved || '_Sem versão melhorada._'} />
            </>
          )}
          {view === 'original' && <div className="essay-original">{e.text}</div>}
        </div>
      </section>

      <div className="row" style={{ marginTop: 14 }}>
        <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => setDeleting(true)}>Apagar</Button>
      </div>
      <DictationModal text={dictating ? rv.improved : null} title={e.title} onClose={() => setDictating(false)} />
      <Confirm open={deleting} title="Apagar esta redação?" text="A correção também é apagada." confirmLabel="Apagar" danger onConfirm={remove} onClose={() => setDeleting(false)} />
    </div>
  );
}
