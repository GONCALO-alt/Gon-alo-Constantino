import { lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LogoMark } from './components/Logo';
import { useApp } from './state';
import { AuthPage } from './pages/Auth';
import { DashboardPage } from './pages/Dashboard';
import { OnboardingPage } from './pages/Onboarding';

// As páginas mais pesadas (Markdown, fórmulas) só são descarregadas quando são abertas.
const ChatPage = lazy(() => import('./pages/Chat').then((m) => ({ default: m.ChatPage })));
const ChoosePlanPage = lazy(() => import('./pages/ChoosePlan').then((m) => ({ default: m.ChoosePlanPage })));
const DeckPage = lazy(() => import('./pages/Flashcards').then((m) => ({ default: m.DeckPage })));
const PracticePage = lazy(() => import('./pages/Practice').then((m) => ({ default: m.PracticePage })));
const ProgressPage = lazy(() => import('./pages/Progress').then((m) => ({ default: m.ProgressPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then((m) => ({ default: m.SettingsPage })));
const StudyPlanPage = lazy(() => import('./pages/StudyPlan').then((m) => ({ default: m.StudyPlanPage })));
const StudyTimerPage = lazy(() => import('./pages/StudyTimer').then((m) => ({ default: m.StudyTimerPage })));
const SubjectsPage = lazy(() => import('./pages/Subjects').then((m) => ({ default: m.SubjectsPage })));
const SubjectDetailPage = lazy(() => import('./pages/Subjects').then((m) => ({ default: m.SubjectDetailPage })));
const SummariesPage = lazy(() => import('./pages/Summaries').then((m) => ({ default: m.SummariesPage })));
const SummaryPage = lazy(() => import('./pages/Summaries').then((m) => ({ default: m.SummaryPage })));
const TestPage = lazy(() => import('./pages/TestRunner').then((m) => ({ default: m.TestPage })));

function Splash() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <div className="pop" style={{ animation: 'glowPulse 1.6s infinite', borderRadius: 14 }}>
        <LogoMark size={52} />
      </div>
    </div>
  );
}

export function App() {
  const { me, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Splash />;

  if (!me) {
    return (
      <Routes>
        <Route path="/entrar" element={<AuthPage mode="login" />} />
        <Route path="/criar-conta" element={<AuthPage mode="register" />} />
        <Route path="*" element={<Navigate to={location.pathname === '/' ? '/criar-conta' : '/entrar'} replace />} />
      </Routes>
    );
  }

  if (!me.profile.onboarded) {
    return (
      <Routes>
        <Route path="/questionario" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/questionario" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/entrar" element={<Navigate to="/" replace />} />
      <Route path="/criar-conta" element={<Navigate to="/" replace />} />
      <Route path="/questionario" element={<OnboardingPage />} />
      <Route path="/" element={<Layout><DashboardPage /></Layout>} />
      <Route path="/chat" element={<Layout full><ChatPage /></Layout>} />
      <Route path="/chat/:id" element={<Layout full><ChatPage /></Layout>} />
      <Route path="/plano" element={<Layout><StudyPlanPage /></Layout>} />
      <Route path="/plano/calendario" element={<Layout><StudyPlanPage tab="calendario" /></Layout>} />
      <Route path="/disciplinas" element={<Layout><SubjectsPage /></Layout>} />
      <Route path="/disciplinas/:id" element={<Layout><SubjectDetailPage /></Layout>} />
      <Route path="/resumos" element={<Layout><SummariesPage /></Layout>} />
      <Route path="/resumos/:id" element={<Layout><SummaryPage /></Layout>} />
      <Route path="/testes" element={<Layout><PracticePage /></Layout>} />
      <Route path="/testes/flashcards" element={<Layout><PracticePage tab="flashcards" /></Layout>} />
      <Route path="/testes/historico" element={<Layout><PracticePage tab="historico" /></Layout>} />
      <Route path="/testes/:id" element={<Layout><TestPage /></Layout>} />
      <Route path="/flashcards/:id" element={<Layout><DeckPage /></Layout>} />
      <Route path="/progresso" element={<Layout><ProgressPage /></Layout>} />
      <Route path="/definicoes" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/planos" element={<Layout><ChoosePlanPage /></Layout>} />
      <Route path="/estudar" element={<Layout><StudyTimerPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
