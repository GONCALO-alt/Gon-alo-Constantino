/**
 * Pesquisa no vocabulário do curso e dicionário pessoal (palavras guardadas com ☆).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { contentRepo } from '../../data/contentRepo.ts';
import { searchVocab, type SearchItem } from '../../engine/search.ts';
import { useApp, useAppData } from '../AppState.tsx';
import { EmptyState, Icon, SpeakButton } from '../components/common.tsx';
import { href } from '../router.ts';

const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

/** Vocabulário de todo o curso, pela ordem do curso. */
export function useAllVocab(): SearchItem[] | null {
  const [items, setItems] = useState<SearchItem[] | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(SECTIONS.map((s) => contentRepo.loadVocab(s).catch(() => null)))
      .then((bundles) => { if (alive) setItems(bundles.flatMap((b) => b?.items ?? [])); });
    return () => { alive = false; };
  }, []);
  return items;
}

/** «Secção 1 · Unidade 2: Apresentar-se» para a lição onde a palavra é ensinada. */
function useWhere() {
  const { index } = useAppData();
  return useMemo(() => {
    const map = new Map<string, { section: number; unit: number; title: string; sectionId: string }>();
    for (const s of index.sections) for (const u of s.units) for (const l of u.lessonIds) map.set(l, { section: s.order, unit: u.order, title: u.title, sectionId: s.id });
    return (lessonId: string) => map.get(lessonId);
  }, [index]);
}

function WordRow({ w, learned }: { w: SearchItem; learned: boolean }) {
  const { settings, savedWords } = useAppData();
  const { toggleSaved } = useApp();
  const where = useWhere()(w.lessonId);
  const head = w.article ? `${w.article} ${w.nl}` : w.nl;
  const on = savedWords.has(w.id);
  return (
    <li className="word-row">
      {settings.audioEnabled && <SpeakButton text={head} rate={settings.speechRate} />}
      <div className="word-row-text">
        <p><strong lang="nl">{head}</strong> — {w.pt.slice(0, 3).join(', ')}</p>
        {w.note && <p className="muted small">{w.note}</p>}
        {where && (
          <p className="small muted">
            {learned ? <span className="learned-tag">✓ Já aprendida</span> : null}{' '}
            <a href={href.course(where.sectionId)}>Secção {where.section} · Unidade {where.unit}: {where.title}</a>
          </p>
        )}
      </div>
      <button type="button" className={`save-star big ${on ? 'on' : ''}`} aria-pressed={on}
        aria-label={on ? `Tirar «${head}» do meu dicionário` : `Guardar «${head}» no meu dicionário`}
        onClick={() => void toggleSaved(w.id)}>{on ? '★' : '☆'}</button>
    </li>
  );
}

export function SearchScreen() {
  const { completed, savedWords } = useAppData();
  const vocab = useAllVocab();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  const results = useMemo(() => (vocab ? searchVocab(vocab, q) : []), [vocab, q]);
  return (
    <div className="page search">
      <div className="search-head">
        <h1>Pesquisar</h1>
        <a className="btn btn-secondary" href={href.dictionary()}>★ O meu dicionário ({savedWords.size})</a>
      </div>
      <label className="search-box">
        <Icon name="search" size={20} />
        <input ref={input} type="search" className="text-input" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Palavra em português ou neerlandês" aria-label="Pesquisar palavras" autoComplete="off" autoCapitalize="off" spellCheck={false} />
      </label>
      {!vocab ? <p className="loading" aria-busy="true">A carregar o dicionário…</p>
        : q.trim().length < 2 ? <p className="muted">Escreva pelo menos duas letras. Funciona também com formas conjugadas (ex.: «werkt», «grote»).</p>
        : results.length === 0 ? <p className="muted">Nenhuma palavra encontrada para «{q}».</p>
        : (
          <>
            <p className="muted small" role="status">{results.length === 40 ? '40 primeiros resultados' : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}</p>
            <ul className="word-rows">{results.map((w) => <WordRow key={w.id} w={w} learned={completed.has(w.lessonId)} />)}</ul>
          </>
        )}
    </div>
  );
}

export function DictionaryScreen() {
  const { completed, savedWords } = useAppData();
  const vocab = useAllVocab();
  const byId = useMemo(() => new Map((vocab ?? []).map((v) => [v.id, v])), [vocab]);
  const [order] = useState(() => [...savedWords]); // mantém a ordem enquanto o ecrã está aberto
  const words = order.map((id) => byId.get(id)).filter((w): w is SearchItem => !!w);
  return (
    <div className="page dictionary">
      <div className="search-head">
        <h1>O meu dicionário</h1>
        <a className="btn btn-secondary" href={href.search()}><Icon name="search" size={18} /> Pesquisar</a>
      </div>
      {!vocab ? <p className="loading" aria-busy="true">A carregar…</p>
        : savedWords.size === 0 ? (
          <EmptyState title="Ainda não guardou palavras.">
            <p className="muted">Durante as lições, toque numa palavra neerlandesa e depois na estrela ☆. Também pode guardar palavras a partir da pesquisa.</p>
            <a className="btn btn-primary" href={href.search()}>Pesquisar palavras</a>
          </EmptyState>
        ) : (
          <>
            <p className="muted">{savedWords.size} {savedWords.size === 1 ? 'palavra guardada' : 'palavras guardadas'}.</p>
            {savedWords.size >= 2 && (
              <a className="btn btn-go btn-wide" href={href.reviewSession('saved')}>Treinar as minhas palavras</a>
            )}
            <ul className="word-rows">{words.map((w) => <WordRow key={w.id} w={w} learned={completed.has(w.lessonId)} />)}</ul>
          </>
        )}
    </div>
  );
}
