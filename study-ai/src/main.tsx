import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource-variable/geist';
import 'katex/dist/katex.min.css';
import './styles.css';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './state';
import { initPwa } from './pwa';
import { DEMO } from './env';

// Dentro de um artefacto o endereço da página não pode mudar: a navegação fica em memória.
const Router = DEMO ? MemoryRouter : BrowserRouter;

if (DEMO) {
  // Regista erros inesperados na área privada da pessoa, para se perceber o que falhou.
  const log = (where: string, err: unknown) => import('./demo/server').then((m) => m.demoLogError(where, err)).catch(() => {});
  window.addEventListener('error', (e) => log('página', e.error ?? e.message));
  window.addEventListener('unhandledrejection', (e) => log('promessa', e.reason));
}

initPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorBoundary>
    </Router>
  </StrictMode>,
);
