import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen, CalendarDays, ChartColumn, ClipboardCheck, FileText, House, LayoutGrid, LogOut, MessagesSquare, Settings, Sparkles,
} from 'lucide-react';
import { AI_PLANS, questionsLeft } from '../../shared/plans';
import { useApp, useMe } from '../state';
import { Logo } from './Logo';
import { IconButton, Modal, Progress } from './ui';

export const NAV = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/chat', label: 'Chat IA', icon: MessagesSquare },
  { to: '/plano', label: 'Plano de estudos', icon: CalendarDays },
  { to: '/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { to: '/resumos', label: 'Resumos', icon: FileText },
  { to: '/testes', label: 'Testes e exercícios', icon: ClipboardCheck },
  { to: '/progresso', label: 'Progresso', icon: ChartColumn },
  { to: '/definicoes', label: 'Definições', icon: Settings },
];

export function UsageMini() {
  const me = useMe();
  const plan = AI_PLANS[me.usage.plan];
  const left = questionsLeft(me.usage);
  return (
    <Link to="/planos" className="plan-mini" title="Escolhe a tua IA">
      <div className="row between">
        <span className="row" style={{ gap: 8 }}>
          <Sparkles size={16} color="var(--yellow)" />
          <b style={{ fontSize: 14 }}>{plan.name}</b>
        </span>
        <span className="badge yellow">{plan.price}</span>
      </div>
      <div className="tiny muted" style={{ marginTop: 8 }}>
        {left === null ? 'Perguntas ilimitadas' : `${left} de ${me.usage.questionsLimit} perguntas hoje`}
      </div>
      {left !== null && (
        <div style={{ marginTop: 8 }}>
          <Progress value={left} max={me.usage.questionsLimit ?? 1} thin />
        </div>
      )}
      {!me.ai.configured && (
        <div className="tiny" style={{ marginTop: 8, color: 'var(--danger)' }}>
          IA não ligada
        </div>
      )}
    </Link>
  );
}

export function Layout({ children, full }: { children: ReactNode; full?: boolean }) {
  const me = useMe();
  const { logout } = useApp();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  const initial = (me.user.name || '?').trim().charAt(0).toUpperCase();
  const inChat = location.pathname.startsWith('/chat');

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/" aria-label="Início">
          <Logo />
        </Link>
        <nav className="nav" aria-label="Menu principal">
          {NAV.map((n, i) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <n.icon />
              <span>{n.label}</span>
              <span className="nav-num">{i + 1}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <UsageMini />
          <div className="user-mini">
            <span className="avatar">{initial}</span>
            <div className="grow">
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.user.name}</div>
              <div className="tiny faint" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.user.email}</div>
            </div>
            <IconButton label="Terminar sessão" small onClick={logout}>
              <LogOut />
            </IconButton>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link to="/" aria-label="Início">
            <Logo />
          </Link>
          <Link to="/planos" className="badge yellow" style={{ height: 30, padding: '0 12px' }}>
            <Sparkles />
            {AI_PLANS[me.usage.plan].name}
          </Link>
        </header>
        <main className={`content ${full ? 'full' : ''}`}>
          <Suspense fallback={<div className="row muted small" style={{ padding: 24 }}><span className="spinner" /> A carregar…</div>}>
            <div className="page" key={inChat ? 'chat' : location.pathname}>
              {children}
            </div>
          </Suspense>
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Menu">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <House />
          <span>Início</span>
        </NavLink>
        <NavLink to="/plano" className={({ isActive }) => (isActive ? 'active' : '')}>
          <CalendarDays />
          <span>Plano</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `chat-fab ${isActive ? 'active' : ''}`}>
          <span className="fab">
            <Sparkles />
          </span>
          <span className="label">Chat IA</span>
        </NavLink>
        <NavLink to="/testes" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ClipboardCheck />
          <span>Testes</span>
        </NavLink>
        <button type="button" onClick={() => setMenu(true)} className={menu ? 'active' : ''}>
          <LayoutGrid />
          <span>Menu</span>
        </button>
      </nav>

      <Modal open={menu} onClose={() => setMenu(false)} title="Menu">
        <nav className="drawer-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <n.icon />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 16 }}>
          <UsageMini />
        </div>
        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={logout}>
          <LogOut /> Terminar sessão
        </button>
      </Modal>
    </div>
  );
}
