import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUp, BookOpen, Bookmark, Check, ChevronDown, CircleHelp, ClipboardCheck, Copy, FileText, History, Image as ImageIcon, Info, Lightbulb,
  Lock, Mic, NotebookPen, Paperclip, Pencil, PenLine, Plus, Search, Sigma, Sparkles, Square, Trash2, X,
} from 'lucide-react';
import { api, ApiError, attachmentUrl, streamChat, uploadFile } from '../api';
import { DEMO } from '../env';
import { useVoiceInput } from '../voice';
import { Markdown } from '../components/Markdown';
import { Promo } from '../components/Promo';
import { Button, Confirm, Field, IconButton, Modal } from '../components/ui';
import { invalidate, useApp, useMe, useQuery } from '../state';
import { daysBetween, today, toISODate } from '../../shared/dates';
import { AI_PLANS, FILE_TYPES, IMAGE_TYPES, imagesLeft, MAX_ATTACHMENTS_PER_MESSAGE, questionsLeft } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import type { Attachment, ChatMessage, Conversation } from '../../shared/types';

const QUICK = [
  { icon: BookOpen, title: 'Explicar matéria', desc: 'Explicação simples, adaptada ao teu ano', prompt: 'Explica-me de forma simples: ' },
  { icon: Sigma, title: 'Resolver exercício', desc: 'Resolução passo a passo', prompt: 'Resolve passo a passo, explicando cada passo, este exercício: ' },
  { icon: FileText, title: 'Fazer resumo', desc: 'Os pontos principais da matéria', prompt: 'Faz-me um resumo sobre: ' },
  { icon: NotebookPen, title: 'Ficha de estudo', desc: 'Exercícios com soluções no fim', prompt: 'Cria uma ficha de estudo com exercícios e soluções sobre: ' },
  { icon: ClipboardCheck, title: 'Teste de preparação', desc: 'Um teste para treinares', prompt: 'Cria um teste de preparação com 10 perguntas (com soluções no fim) sobre: ' },
  { icon: PenLine, title: 'Corrigir exercício', desc: 'Explica os erros e a resposta certa', prompt: 'Corrige o meu exercício e explica os erros.\n\nEnunciado: \n\nA minha resposta: ' },
  { icon: Pencil, title: 'Ajuda nos TPC', desc: 'Ensina-te a fazer, sem só dar a resposta', prompt: 'Ajuda-me a fazer este trabalho de casa, explicando como se faz: ' },
  { icon: CircleHelp, title: 'Testar conhecimentos', desc: 'Perguntas, uma de cada vez', prompt: 'Faz-me perguntas, uma de cada vez, para testar o que sei sobre: ' },
  { icon: Lightbulb, title: 'Exemplos práticos', desc: 'A matéria no dia a dia', prompt: 'Dá-me exemplos práticos do dia a dia sobre: ' },
];

interface Pending {
  localId: string;
  file: File;
  preview: string | null;
  attachment?: Attachment;
}

function groupLabel(iso: string): string {
  const n = daysBetween(toISODate(new Date(iso)), today());
  if (n <= 0) return 'Hoje';
  if (n === 1) return 'Ontem';
  if (n < 7) return 'Últimos 7 dias';
  if (n < 30) return 'Últimos 30 dias';
  return 'Mais antigas';
}

function ConversationList({
  list,
  activeId,
  onOpen,
  onNew,
  search,
  setSearch,
}: {
  list: Conversation[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const { toast } = useApp();
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [title, setTitle] = useState('');
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const navigate = useNavigate();
  let last = '';

  async function rename() {
    if (!renaming || !title.trim()) return;
    await api(`/conversations/${renaming.id}`, { method: 'PATCH', body: { title: title.trim() } });
    invalidate('/conversations');
    setRenaming(null);
  }

  async function remove() {
    if (!deleting) return;
    await api(`/conversations/${deleting.id}`, { method: 'DELETE' });
    invalidate('/conversations');
    toast('Conversa apagada.');
    if (deleting.id === activeId) navigate('/chat');
    setDeleting(null);
  }

  return (
    <>
      <div className="chat-side-head">
        <Button onClick={onNew} block icon={<Plus />}>Nova conversa</Button>
        <div className="input-icon">
          <Search />
          <input className="input" style={{ height: 38 }} placeholder="Procurar conversas" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="chat-list">
        {!list.length && <p className="small faint" style={{ padding: 10 }}>{search ? 'Nenhuma conversa encontrada.' : 'As tuas conversas aparecem aqui.'}</p>}
        {list.map((c) => {
          const g = groupLabel(c.updatedAt);
          const head = g !== last ? <div className="chat-group">{g}</div> : null;
          last = g;
          return (
            <div key={c.id}>
              {head}
              <div className={`chat-list-item ${c.id === activeId ? 'active' : ''}`}>
                <button type="button" className="grow" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0, minWidth: 0 }} onClick={() => onOpen(c.id)}>
                  <div className="t">{c.title}</div>
                  {c.preview && <div className="p">{c.preview}</div>}
                </button>
                <span className="acts">
                  <IconButton label="Mudar o nome" small onClick={() => { setRenaming(c); setTitle(c.title); }}><Pencil /></IconButton>
                  <IconButton label="Apagar conversa" small onClick={() => setDeleting(c)}><Trash2 /></IconButton>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Mudar o nome da conversa"
        footer={<><Button variant="ghost" onClick={() => setRenaming(null)}>Cancelar</Button><Button onClick={rename}>Guardar</Button></>}>
        <input className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rename()} />
      </Modal>
      <Confirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} title="Apagar conversa?"
        text="A conversa e os anexos são apagados para sempre." />
    </>
  );
}

export function ChatPage() {
  const me = useMe();
  const { setUsage, toast, refreshMe } = useApp();
  const { id: routeId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = me.profile.questionnaire;
  const custom = q?.customSubjects;
  const plan = AI_PLANS[me.usage.plan];

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);
  const listQ = useQuery<{ conversations: Conversation[] }>(`/conversations${debounced ? `?q=${encodeURIComponent(debounced)}` : ''}`);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [input, setInput] = useState('');
  // Microfone: o que se diz junta-se ao que já estava escrito.
  const voiceBase = useRef('');
  const voice = useVoiceInput({
    serverVoice: !!me.ai.voice,
    onStart: () => {
      voiceBase.current = input;
    },
    onText: (t) => setInput(t ? (voiceBase.current.trim() ? `${voiceBase.current.replace(/\s+$/, '')} ${t}` : t) : voiceBase.current),
    onError: (m) => toast(m, 'error'),
  });
  const showMic = !DEMO && me.ai.configured && voice.supported;
  const [subject, setSubject] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(0);
  const [streaming, setStreaming] = useState<{ text: string } | null>(null);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState<ChatMessage | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const skipLoad = useRef<string | null>(null);
  const bufferRef = useRef('');
  const frameRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pergunta e disciplina vindas de outra página (?q=…&subject=…)
  useEffect(() => {
    const preset = params.get('q');
    const presetSubject = params.get('subject');
    if (preset !== null || presetSubject !== null) {
      if (preset) setInput(preset);
      if (presetSubject) setSubject(presetSubject);
      setParams({}, { replace: true });
      setTimeout(() => {
        const el = textRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 50);
    }
  }, [params, setParams]);

  // Abrir conversa
  useEffect(() => {
    setError('');
    if (!routeId) {
      if (!streaming) {
        setConversation(null);
        setMessages([]);
      }
      return;
    }
    if (skipLoad.current === routeId) {
      skipLoad.current = null;
      return;
    }
    let cancel = false;
    setLoadingConv(true);
    api<{ conversation: Conversation; messages: ChatMessage[] }>(`/conversations/${routeId}`)
      .then((r) => {
        if (cancel) return;
        setConversation(r.conversation);
        setMessages(r.messages);
        setSubject(r.conversation.subject);
        stickRef.current = true;
      })
      .catch((err) => !cancel && setError((err as Error).message))
      .finally(() => !cancel && setLoadingConv(false));
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (stickRef.current && (messages.length || streaming)) scrollToBottom();
  }, [messages, streaming, scrollToBottom]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Altura automática da caixa de texto
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(220, el.scrollHeight)}px`;
  }, [input]);

  const left = questionsLeft(me.usage);
  const imgLeft = imagesLeft(me.usage);
  const limitReached = left === 0;
  const canAttachImages = plan.dailyImages !== 0;
  const canAttachFiles = plan.files;
  const accept = [...(canAttachImages ? IMAGE_TYPES : []), ...(canAttachFiles ? [...FILE_TYPES, '.md', '.csv', '.txt'] : [])].join(',');
  const busy = !!streaming;
  const canSend = me.ai.configured && !busy && !limitReached && uploading === 0 && (input.trim().length > 0 || pending.some((p) => p.attachment));

  function addFiles(files: File[]) {
    if (!files.length) return;
    if (!canAttachImages && !canAttachFiles) {
      toast(`O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'error');
      return;
    }
    let slots = MAX_ATTACHMENTS_PER_MESSAGE - pending.length;
    let imageSlots = imgLeft === null ? Infinity : imgLeft - pending.filter((p) => p.file.type.startsWith('image/')).length;
    for (const file of files) {
      const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type);
      const isFile = !isImage && ((FILE_TYPES as readonly string[]).includes(file.type) || /\.(pdf|txt|md|csv)$/i.test(file.name));
      if (slots <= 0) {
        toast(`Podes enviar até ${MAX_ATTACHMENTS_PER_MESSAGE} anexos por mensagem.`, 'error');
        break;
      }
      if (isImage && !canAttachImages) { toast(`O ${plan.name} não permite imagens.`, 'error'); continue; }
      if (isImage && imageSlots <= 0) { toast(`Já não tens imagens disponíveis hoje no ${plan.name}.`, 'error'); continue; }
      if (isFile && !canAttachFiles) { toast('Só o Cláudio 6 permite carregar ficheiros (PDF, TXT, MD, CSV).', 'error'); continue; }
      if (!isImage && !isFile) { toast(`«${file.name}»: tipo de ficheiro não suportado.`, 'error'); continue; }
      slots--;
      if (isImage) imageSlots--;
      const localId = Math.random().toString(36).slice(2);
      const preview = isImage ? URL.createObjectURL(file) : null;
      setPending((p) => [...p, { localId, file, preview }]);
      setUploading((n) => n + 1);
      uploadFile(file)
        .then((attachment) => setPending((p) => p.map((x) => (x.localId === localId ? { ...x, attachment } : x))))
        .catch((err: Error) => {
          toast(err.message, 'error');
          setPending((p) => p.filter((x) => x.localId !== localId));
        })
        .finally(() => setUploading((n) => n - 1));
    }
  }

  function removePending(p: Pending) {
    if (p.preview) URL.revokeObjectURL(p.preview);
    if (p.attachment) api(`/attachments/${p.attachment.id}`, { method: 'DELETE' }).catch(() => {});
    setPending((list) => list.filter((x) => x.localId !== p.localId));
  }

  const flush = () => {
    frameRef.current = null;
    setStreaming({ text: bufferRef.current });
  };

  async function send() {
    if (!canSend) return;
    voice.cancel();
    const content = input.trim();
    const sentPending = pending;
    const attachments = sentPending.map((p) => p.attachment).filter(Boolean) as Attachment[];
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content,
      attachments,
      plan: me.usage.plan,
      status: 'ok',
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setInput('');
    setPending([]);
    setError('');
    stickRef.current = true;
    bufferRef.current = '';
    setStreaming({ text: '' });
    const controller = new AbortController();
    abortRef.current = controller;
    const isNew = !conversation;
    let conv = conversation;
    let serverUserId: string | null = null;

    await streamChat(
      { conversationId: conversation?.id ?? null, content, attachmentIds: attachments.map((a) => a.id), subject },
      {
        onStart: ({ conversation: c, userMessage }) => {
          conv = c;
          serverUserId = userMessage.id;
          setConversation(c);
          setMessages((m) => m.map((x) => (x.id === optimistic.id ? userMessage : x)));
          if (isNew) {
            skipLoad.current = c.id;
            navigate(`/chat/${c.id}`, { replace: true });
            invalidate('/conversations');
          }
        },
        onDelta: (t) => {
          bufferRef.current += t;
          if (frameRef.current === null) frameRef.current = requestAnimationFrame(flush);
        },
        onDone: ({ message, usage }) => {
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
          setStreaming(null);
          setMessages((m) => [...m, message]);
          setUsage(usage);
          invalidate('/conversations', '/stats');
        },
        onError: (err: ApiError) => {
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
          setStreaming(null);
          setMessages((m) => m.filter((x) => x.id !== optimistic.id && x.id !== serverUserId));
          setInput(content);
          setPending(sentPending);
          setError(err.message);
          if (isNew && conv) {
            skipLoad.current = null;
            setConversation(null);
            setMessages([]);
            navigate('/chat', { replace: true });
          }
        },
      },
      controller.signal,
    );

    if (controller.signal.aborted) {
      // Parado pelo estudante: o servidor guarda o que já foi escrito.
      const partial = bufferRef.current;
      setStreaming(null);
      if (partial.trim()) {
        setMessages((m) => [
          ...m,
          { id: `stopped-${Date.now()}`, role: 'assistant', content: partial, attachments: [], plan: me.usage.plan, status: 'stopped', createdAt: new Date().toISOString() },
        ]);
      }
      setTimeout(() => {
        invalidate('/conversations');
        refreshMe();
        if (conv) {
          api<{ conversation: Conversation; messages: ChatMessage[] }>(`/conversations/${conv.id}`)
            .then((r) => setMessages(r.messages))
            .catch(() => {});
        }
      }, 700);
    }
    abortRef.current = null;
  }

  function stop() {
    abortRef.current?.abort();
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  async function copy(m: ChatMessage) {
    try {
      await navigator.clipboard.writeText(m.content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = m.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1600);
  }

  function applyQuick(prompt: string) {
    setInput(prompt);
    setTimeout(() => {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(prompt.length, prompt.length);
      }
    }, 0);
  }

  function newChat() {
    if (busy) stop();
    setHistoryOpen(false);
    setConversation(null);
    setMessages([]);
    setInput('');
    setError('');
    navigate('/chat');
    setTimeout(() => textRef.current?.focus(), 50);
  }

  async function changeSubject(value: string) {
    const next = value || null;
    setSubject(next);
    if (conversation) {
      await api(`/conversations/${conversation.id}`, { method: 'PATCH', body: { subject: next } }).catch(() => {});
      setConversation({ ...conversation, subject: next });
    }
  }

  const list = useMemo(() => listQ.data?.conversations ?? [], [listQ.data]);
  const empty = !messages.length && !streaming && !loadingConv;
  const firstName = me.user.name.split(' ')[0];

  const listProps = {
    list,
    activeId: conversation?.id ?? null,
    onOpen: (id: string) => {
      setHistoryOpen(false);
      navigate(`/chat/${id}`);
    },
    onNew: newChat,
    search,
    setSearch,
  };

  return (
    <div className="chat" onDragOver={(e) => { e.preventDefault(); if (canAttachImages || canAttachFiles) setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
      <aside className="chat-side">
        <ConversationList {...listProps} />
      </aside>

      <section className="chat-main">
        <header className="chat-head">
          <Link to="/" className="icon-btn mobile-only" aria-label="Voltar ao início" title="Voltar ao início">
            <ArrowLeft />
          </Link>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="title">{conversation?.title ?? 'Nova conversa'}</div>
          </div>
          <label className={`subject-picker ${subject ? 'on' : ''}`} title="Disciplina da conversa">
            <BookOpen />
            {subject ? <span>{getSubject(subject, custom).short}</span> : <><span className="full">Todas as disciplinas</span><span className="short">Disciplina</span></>}
            <ChevronDown className="chev" />
            <select value={subject ?? ''} onChange={(e) => changeSubject(e.target.value)} aria-label="Disciplina da conversa">
              <option value="">Todas as disciplinas</option>
              {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, custom).name}</option>)}
            </select>
          </label>
          <Link to="/planos" className="badge yellow desktop-only" style={{ height: 32, padding: '0 11px' }} title="Escolhe a tua IA">
            <Sparkles />
            <span className="nowrap">{plan.name}{left !== null ? ` · ${left}` : ''}</span>
          </Link>
          <IconButton label="Histórico de conversas" className="mobile-only" onClick={() => setHistoryOpen(true)}>
            <History />
          </IconButton>
          <IconButton label="Nova conversa" onClick={newChat}><Plus /></IconButton>
        </header>

        <div className="chat-scroll" ref={scrollRef} onScroll={(e) => {
          const el = e.currentTarget;
          stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        }}>
          {!me.ai.configured && (
            <div className="chat-banner">
              <div className="notice"><Info /><div><b>A IA ainda não está ligada.</b> {me.ai.message}</div></div>
            </div>
          )}
          {me.ai.configured && limitReached && (
            <div className="chat-banner">
              <div className="notice"><Lock /><div>
                <b>Chegaste ao limite de hoje.</b> Já usaste as {me.usage.questionsLimit} perguntas do {plan.name}. Volta amanhã ou <Link to="/planos" className="yellow">muda de plano</Link>.
              </div></div>
            </div>
          )}

          {empty ? (
            <div className="chat-empty">
              <div className="fade-up">
                <h1>Olá, {firstName}! <span>Em que posso ajudar?</span></h1>
                <p className="muted" style={{ marginTop: 10, fontSize: 16 }}>
                  Pergunta qualquer coisa de qualquer disciplina. As respostas são adaptadas ao {q ? `${q.year === 'superior' ? 'ensino superior' : `${q.year}.º ano`}` : 'teu ano'} e ao plano {plan.name}.
                </p>
              </div>
              <div className="quick-grid">
                {QUICK.map((a, i) => (
                  <button key={a.title} type="button" className="quick fade-up" style={{ ['--i' as string]: i + 1 }} onClick={() => applyQuick(a.prompt)}>
                    <a.icon />
                    <b>{a.title}</b>
                    <span>{a.desc}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 18 }} className="slot-gap"><Promo slot="chat" /></div>
            </div>
          ) : (
            <div className="chat-inner">
              {loadingConv && <div className="row muted small"><span className="spinner" /> A carregar a conversa…</div>}
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="msg user">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '100%' }}>
                      {m.attachments.length > 0 && (
                        <div className="msg-atts">
                          {m.attachments.map((a) => {
                            const url = attachmentUrl(a.id);
                            if (!url)
                              return (
                                <span key={a.id} className="file-pill" title="Os anexos ficam só durante a sessão em que foram enviados">
                                  {a.kind === 'image' ? <ImageIcon /> : <FileText />}<span>{a.name}</span>
                                </span>
                              );
                            return a.kind === 'image' ? (
                              <a key={a.id} href={url} target="_blank" rel="noreferrer">
                                <img className="msg-att-img" src={url} alt={a.name} loading="lazy" />
                              </a>
                            ) : (
                              <a key={a.id} className="file-pill" href={url}><FileText /><span>{a.name}</span></a>
                            );
                          })}
                        </div>
                      )}
                      {m.content && <div className="bubble">{m.content}</div>}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="msg ai">
                    <span className="ai-avatar"><Sparkles /></span>
                    <div className="ai-body">
                      <div className="msg-meta">{m.plan ? AI_PLANS[m.plan].name : 'IA'}{m.status === 'stopped' && <span className="badge">Interrompida</span>}</div>
                      <Markdown text={m.content} />
                      <div className="msg-actions">
                        <Button variant="ghost" size="sm" onClick={() => copy(m)} icon={copied === m.id ? <Check /> : <Copy />}>
                          {copied === m.id ? 'Copiado' : 'Copiar'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSaveMsg(m)} icon={<Bookmark />}>Guardar resumo</Button>
                      </div>
                    </div>
                  </div>
                ),
              )}
              {!streaming && !limitReached && messages.some((m) => m.role === 'assistant') && (
                <Promo slot="chat-resposta" aiAnswers={messages.filter((m) => m.role === 'assistant').length} />
              )}
              {streaming && (
                <div className="msg ai">
                  <span className="ai-avatar"><Sparkles /></span>
                  <div className="ai-body">
                    <div className="msg-meta">{plan.name} · a escrever…</div>
                    {streaming.text ? <Markdown text={streaming.text} streaming /> : <span className="typing"><i /><i /><i /></span>}
                  </div>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="chat-banner" style={{ marginBottom: 16 }}>
              <div className="form-error"><Info /><span>{error}</span></div>
            </div>
          )}
        </div>

        <div className="composer-wrap">
          <div className={`composer ${drag ? 'drag' : ''}`}>
            {pending.length > 0 && (
              <div className="pending-atts">
                {pending.map((p) => (
                  <div key={p.localId} className="pending-att">
                    {p.preview ? <img src={p.preview} alt={p.file.name} /> : <span className="file-pill"><FileText /><span>{p.file.name}</span></span>}
                    {!p.attachment && <span className="loading"><span className="spinner" /></span>}
                    <button type="button" className="x" aria-label="Remover anexo" onClick={() => removePending(p)}><X /></button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              onPaste={onPaste}
              placeholder={me.ai.configured ? 'Escreve a tua pergunta…' : 'A IA não está ligada neste servidor'}
              maxLength={20000}
              aria-label="Mensagem"
            />
            <div className="composer-bar">
              <input ref={fileRef} type="file" hidden multiple accept={accept || undefined} onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
              <IconButton
                label={canAttachImages ? (canAttachFiles ? 'Anexar imagens ou ficheiros' : 'Anexar imagens') : 'Anexos não disponíveis no Cláudio 5'}
                onClick={() => (canAttachImages || canAttachFiles ? fileRef.current?.click() : toast(`O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'error'))}
              >
                {canAttachImages ? (canAttachFiles ? <Paperclip /> : <ImageIcon />) : <Lock />}
              </IconButton>
              {voice.state !== 'idle' ? (
                <span className="tiny grow voice-status" role="status">
                  {voice.state === 'listening'
                    ? 'A ouvir… fala e toca no microfone para parar.'
                    : voice.state === 'recording'
                      ? `A gravar ${Math.floor(voice.seconds / 60)}:${String(voice.seconds % 60).padStart(2, '0')}… toca no microfone para parar.`
                      : 'A transcrever o que disseste…'}
                </span>
              ) : (
              <span className="tiny faint grow">
                {canAttachImages
                  ? imgLeft === null
                    ? canAttachFiles ? 'Imagens e ficheiros ilimitados' : 'Imagens ilimitadas'
                    : `${imgLeft} ${imgLeft === 1 ? 'imagem disponível' : 'imagens disponíveis'} hoje`
                  : 'Sem imagens no Cláudio 5'}
              </span>
              )}
              {showMic && (
                <IconButton
                  label={voice.state === 'idle' ? 'Falar (ditar a pergunta)' : voice.state === 'transcribing' ? 'A transcrever…' : 'Parar de ouvir'}
                  className={`mic-btn ${voice.state === 'listening' || voice.state === 'recording' ? 'on' : ''}`}
                  onClick={voice.toggle}
                  disabled={busy || voice.state === 'transcribing'}
                >
                  {voice.state === 'transcribing' ? <span className="spinner" /> : <Mic />}
                </IconButton>
              )}
              {busy ? (
                <button type="button" className="send-btn" onClick={stop} aria-label="Parar resposta"><Square fill="currentColor" size={15} /></button>
              ) : (
                <button type="button" className="send-btn" onClick={send} disabled={!canSend} aria-label="Enviar"><ArrowUp /></button>
              )}
            </div>
          </div>
          <div className="composer-hint">
            A IA pode cometer erros. Confirma a informação importante com o teu professor ou com o manual.
            {me.ai.configured && me.ai.notice && <> {me.ai.notice}</>}
          </div>
        </div>
      </section>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Conversas">
        <div style={{ margin: '-8px -8px 0' }}>
          <ConversationList {...listProps} />
        </div>
      </Modal>

      <SaveSummaryModal message={saveMsg} onClose={() => setSaveMsg(null)} defaultSubject={subject} />
    </div>
  );
}

function SaveSummaryModal({ message, onClose, defaultSubject }: { message: ChatMessage | null; onClose: () => void; defaultSubject: string | null }) {
  const me = useMe();
  const { toast } = useApp();
  const q = me.profile.questionnaire;
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<string>('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!message) return;
    const heading = message.content.match(/^#{1,3}\s+(.+)$/m)?.[1];
    setTitle((heading ?? message.content.split('\n').find((l) => l.trim()) ?? 'Resumo').replace(/[*_#`$]/g, '').trim().slice(0, 100));
    setSubject(defaultSubject ?? '');
  }, [message, defaultSubject]);

  async function save() {
    if (!message) return;
    setSaving(true);
    try {
      await api('/summaries', {
        method: 'POST',
        body: { title: title.trim() || 'Resumo', subject: subject || null, content: message.content, source: 'ia' },
      });
      invalidate('/summaries', '/stats');
      toast('Guardado nos teus resumos.');
      onClose();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!message} onClose={onClose} title="Guardar nos resumos"
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={save} loading={saving} icon={<Bookmark />}>Guardar</Button></>}>
      <div className="stack">
        <Field label="Título"><input className="input" value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Disciplina">
          <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Sem disciplina</option>
            {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
