import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource-variable/geist';
import 'katex/dist/katex.min.css';
import './styles.css';
import { App } from './App';
import { AppProvider } from './state';
import { initPwa } from './pwa';
import { DEMO } from './env';

// Dentro de um artefacto o endereço da página não pode mudar: a navegação fica em memória.
const Router = DEMO ? MemoryRouter : BrowserRouter;

initPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </StrictMode>,
);
