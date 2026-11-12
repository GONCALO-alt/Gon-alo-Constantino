import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { haptic } from '../pwa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Layers, PartyPopper, Pencil, Play, Plus, RotateCcw, Shuffle, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { Button, Confirm, Empty, Field, IconButton, Modal, Progress, Skeleton } from '../components/ui';
import { invalidate, useApp, useMe, useQuery } from '../state';
import { today } from '../../shared/dates';
import { getSubject } from '../../shared/subjects';
import type { Deck, Flashcard } from '../../shared/types';

function Study({ cards, onExit }: { cards: Flashcard[]; onExit: () => void }) {
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });
  const card = queue[index];
  // Deslizar o cartão (telemóvel): direita = sabia, esquerda = não sabia.
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function answer(known: boolean) {
    if (!card) return;
    haptic(known ? 12 : [10, 40, 10]);
    setStats((s) => ({ known: s.known + (known ? 1 : 0), unknown: s.unknown + (known ? 0 : 1) }));
    api(`/cards/${card.id}/review`, { method: 'POST', body: { known, date: today() } }).catch(() => {});
    if (!known && queue.filter((c) => c.id === card.id).length < 2) setQueue((q) => [...q, card]);
    setFlipped(false);
    setTimeout(() => setIndex((i) => i + 1), 180);
  }

  if (!card) {
    return (
      <div className="card pad-lg center pop" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="empty-icon" style={{ margin: '0 auto 14px', width: 64, height: 64, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'var(--yellow)', color: 'var(--on-yellow)' }}>
          <PartyPopper size={30} />
        </div>
        <h2>Revisão terminada!</h2>
        <p className="muted" style={{ marginTop: 8 }}>Sabias {stats.known} · a rever {stats.unknown}. Os cartões que falhaste voltam mais cedo.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Button onClick={onExit}>Voltar ao baralho</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack lg">
      <div style={{ maxWidth: 620, margin: '0 auto', width: '100%' }}>
        <div className="row between small muted" style={{ marginBottom: 8 }}>
          <span>Cartão {Math.min(index + 1, queue.length)} de {queue.length}</span>
          <Button variant="ghost" size="sm" icon={<X />} onClick={onExit}>Sair</Button>
        </div>
        <Progress value={index} max={queue.length} thin />
      </div>
      <div className={`flip ${flipped ? 'flipped' : ''} ${dx ? 'dragging' : ''}`} role="button" tabIndex={0} aria-label="Virar cartão"
        style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 22}deg)` : undefined, touchAction: 'pan-y' }}
        onKeyDown={(e) => e.key === 'Enter' && setFlipped(!flipped)}
        onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
          drag.current = { x: e.clientX, id: e.pointerId };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
          if (drag.current && flipped) setDx(e.clientX - drag.current.x);
        }}
        onPointerUp={(e: PointerEvent<HTMLDivElement>) => {
          const moved = drag.current ? e.clientX - drag.current.x : 0;
          drag.current = null;
          setDx(0);
          if (flipped && Math.abs(moved) > 90) answer(moved > 0);
          else if (Math.abs(moved) < 8) setFlipped(!flipped);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDx(0);
        }}>
        {dx !== 0 && (
          <span className={`swipe-label ${dx > 0 ? 'yes' : 'no'}`} style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}>
            {dx > 0 ? 'Sabia' : 'Não sabia'}
          </span>
        )}
        <div className="flip-inner">
          <div className="flip-face"><span className="face-label">Pergunta</span><div className="face-text">{card.front}</div><span className="tiny faint" style={{ position: 'absolute', bottom: 16 }}>Toca para ver a resposta</span></div>
          <div className="flip-face back"><span className="face-label">Resposta</span><div className="face-text">{card.back}</div><span className="tiny faint swipe-hint">Desliza para a direita se sabias, para a esquerda se não</span></div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
        {flipped ? (
          <>
            <Button variant="danger" size="lg" icon={<RotateCcw />} onClick={() => answer(false)}>Não sabia</Button>
            <Button size="lg" icon={<Check />} onClick={() => answer(true)}>Sabia</Button>
          </>
        ) : (
          <Button variant="secondary" size="lg" onClick={() => setFlipped(true)}>Ver resposta</Button>
        )}
      </div>
    </div>
  );
}

export function DeckPage() {
  const { id = '' } = useParams();
  const me = useMe();
  const { toast } = useApp();
  const navigate = useNavigate();
  const custom = me.profile.questionnaire?.customSubjects;
  const q = useQuery<{ deck: Deck; cards: Flashcard[] }>(`/decks/${id}?date=${today()}`);
  const [studying, setStudying] = useState<Flashcard[] | null>(null);
  const [editCard, setEditCard] = useState<Flashcard | 'new' | null>(null);
  const [form, setForm] = useState({ front: '', back: '' });
  const [deleting, setDeleting] = useState(false);
  const now = today();
  const due = useMemo(() => (q.data?.cards ?? []).filter((c) => c.due <= now), [q.data, now]);

  if (q.loading) return <Skeleton height={300} />;
  if (!q.data?.deck) return <Empty icon={<Layers />} title="Baralho não encontrado" action={<Link to="/testes/flashcards" className="btn btn-secondary">Voltar</Link>} />;
  const { deck, cards } = q.data;

  if (studying) {
    return <Study cards={studying} onExit={() => { setStudying(null); invalidate('/decks', '/stats'); }} />;
  }

  async function saveCard() {
    if (!form.front.trim() || !form.back.trim()) return;
    if (editCard === 'new') await api(`/decks/${id}/cards`, { method: 'POST', body: form });
    else if (editCard) await api(`/cards/${editCard.id}`, { method: 'PUT', body: form });
    invalidate('/decks');
    setEditCard(null);
  }

  async function deleteCard(c: Flashcard) {
    await api(`/cards/${c.id}`, { method: 'DELETE' });
    invalidate('/decks');
  }

  const shuffle = (list: Flashcard[]) => [...list].sort(() => Math.random() - 0.5);

  return (
    <div style={{ maxWidth: 920 }}>
      <Link to="/testes/flashcards" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}><ArrowLeft /> Flashcards</Link>
      <div className="card card-glow pad-lg fade-up">
        <div className="row between top wrap">
          <div>
            <span className="badge yellow" style={{ marginBottom: 10 }}><Layers /> {deck.subject ? getSubject(deck.subject, custom).name : 'Geral'}</span>
            <h1 style={{ fontSize: 26 }}>{deck.title}</h1>
            <p className="muted small" style={{ marginTop: 6 }}>{deck.cardCount} cartões · {deck.masteredCount} dominados · {deck.dueCount} para rever hoje</p>
          </div>
          <IconButton label="Apagar baralho" onClick={() => setDeleting(true)}><Trash2 /></IconButton>
        </div>
        <div className="row wrap" style={{ marginTop: 18 }}>
          <Button size="lg" icon={<Play />} disabled={!due.length} onClick={() => setStudying(shuffle(due))}>
            {due.length ? `Rever ${due.length} ${due.length === 1 ? 'cartão' : 'cartões'}` : 'Tudo revisto por hoje'}
          </Button>
          <Button variant="secondary" size="lg" icon={<Shuffle />} disabled={!cards.length} onClick={() => setStudying(shuffle(cards))}>Treinar todos</Button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <span className="card-title">Cartões</span>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => { setForm({ front: '', back: '' }); setEditCard('new'); }}>Adicionar</Button>
        </div>
        {cards.map((c) => (
          <div key={c.id} className="list-item top">
            <span className="badge" title="Caixa de revisão">{c.box}/5</span>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>{c.front}</div>
              <div className="small muted">{c.back}</div>
            </div>
            <IconButton label="Editar cartão" small onClick={() => { setForm({ front: c.front, back: c.back }); setEditCard(c); }}><Pencil /></IconButton>
            <IconButton label="Apagar cartão" small onClick={() => deleteCard(c)}><Trash2 /></IconButton>
          </div>
        ))}
        {!cards.length && <p className="muted small">Este baralho ainda não tem cartões.</p>}
      </div>

      <Modal open={!!editCard} onClose={() => setEditCard(null)} title={editCard === 'new' ? 'Novo cartão' : 'Editar cartão'}
        footer={<><Button variant="ghost" onClick={() => setEditCard(null)}>Cancelar</Button><Button onClick={saveCard} disabled={!form.front.trim() || !form.back.trim()}>Guardar</Button></>}>
        <div className="stack">
          <Field label="Frente (pergunta)"><textarea className="textarea" style={{ minHeight: 80 }} maxLength={500} value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} /></Field>
          <Field label="Verso (resposta)"><textarea className="textarea" style={{ minHeight: 100 }} maxLength={2000} value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} /></Field>
        </div>
      </Modal>
      <Confirm open={deleting} onClose={() => setDeleting(false)} title="Apagar baralho?" text="O baralho e todos os cartões são apagados."
        onConfirm={async () => { await api(`/decks/${id}`, { method: 'DELETE' }); invalidate('/decks', '/stats'); toast('Baralho apagado.'); navigate('/testes/flashcards'); }} />
    </div>
  );
}
