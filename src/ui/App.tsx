import { useEffect } from 'react';
import { APP_CONFIG } from '../config/app.ts';
import { AppProvider, useApp } from './AppState.tsx';
import { Icon, Logo } from './components/common.tsx';
import { href, useRoute, type Route } from './router.ts';
import { CourseScreen } from './screens/CourseScreen.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LessonScreen } from './screens/LessonScreen.tsx';
import { ProfileScreen, SettingsScreen, StatsScreen } from './screens/ProfileScreens.tsx';
import { ReviewScreen, ReviewSessionScreen } from './screens/ReviewScreens.tsx';

const NAV = [
  { key: 'home', label: 'Início', icon: 'home', to: href.home() },
  { key: 'course', label: 'Curso', icon: 'map', to: href.course() },
  { key: 'review', label: 'Revisão', icon: 'review', to: href.review() },
  { key: 'stats', label: 'Estatísticas', icon: 'chart', to: href.stats() },
  { key: 'profile', label: 'Perfil', icon: 'user', to: href.profile() },
] as const;

function activeKey(r: Route): string {
  if (r.name === 'reviewSession') return 'review';
  if (r.name === 'settings') return 'profile';
  return r.name;
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home': return <HomeScreen />;
    case 'course': return <CourseScreen sectionId={route.sectionId} />;
    case 'lesson': return <LessonScreen lessonId={route.lessonId} />;
    case 'review': return <ReviewScreen />;
    case 'reviewSession': return <ReviewSessionScreen mode={route.mode} />;
    case 'profile': return <ProfileScreen />;
    case 'stats': return <StatsScreen />;
    case 'settings': return <SettingsScreen />;
    case 'notFound':
      return <div className="page"><h1>Página não encontrada</h1><a href={href.home()}>Voltar ao início</a></div>;
  }
}

function Shell() {
  const route = useRoute();
  const { data, error, refresh } = useApp();
  const immersive = route.name === 'lesson' || route.name === 'reviewSession';

  useEffect(() => {
    document.title = APP_CONFIG.name;
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = data?.settings.reducedMotion ? 'reduce' : 'auto';
  }, [data?.settings.reducedMotion]);

  if (error && !data) {
    return (
      <div className="page center">
        <Logo />
        <p className="notice" role="alert">{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => void refresh()}>Tentar novamente</button>
      </div>
    );
  }
  if (!data) return <div className="page center"><Logo /><p className="loading" aria-busy="true">A carregar…</p></div>;

  if (immersive) return <div className="app immersive"><Screen route={route} /></div>;

  const active = activeKey(route);
  return (
    <div className="app">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <aside className="sidebar">
        <a href={href.home()} className="brand" aria-label={`${APP_CONFIG.name} — início`}><Logo /></a>
        <nav aria-label="Navegação principal">
          <ul>
            {NAV.map((n) => (
              <li key={n.key}><a href={n.to} className={`nav-link ${active === n.key ? 'active' : ''}`} aria-current={active === n.key ? 'page' : undefined}><Icon name={n.icon} /> <span>{n.label}</span></a></li>
            ))}
            <li><a href={href.settings()} className={`nav-link ${route.name === 'settings' ? 'active' : ''}`} aria-current={route.name === 'settings' ? 'page' : undefined}><Icon name="settings" /> <span>Definições</span></a></li>
          </ul>
        </nav>
      </aside>
      <header className="topbar">
        <a href={href.home()} aria-label={`${APP_CONFIG.name} — início`}><Logo /></a>
        <span className="topbar-xp" aria-label={`${data.profile.totalXp} pontos de experiência`}><Icon name="star" size={18} /> {data.profile.totalXp}</span>
        <a href={href.settings()} className="icon-btn" aria-label="Definições"><Icon name="settings" /></a>
      </header>
      <main id="conteudo" className="main" tabIndex={-1}><Screen route={route} /></main>
      <nav className="bottom-nav" aria-label="Navegação principal (móvel)">
        {NAV.map((n) => (
          <a key={n.key} href={n.to} className={active === n.key ? 'active' : ''} aria-current={active === n.key ? 'page' : undefined}>
            <Icon name={n.icon} /><span>{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
