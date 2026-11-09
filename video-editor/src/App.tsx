import React, { useEffect } from 'react';
import { useEditor } from './store/editor';
import { Home } from './components/Home';
import { Editor } from './components/Editor';
import { api } from './api';

export function App() {
  const screen = useEditor((s) => s.screen);
  const toast = useEditor((s) => s.toast);

  // atualizações de média vindas do processo principal (tira de miniaturas, ondas, proxies)
  useEffect(() => api.onMediaUpdate(({ id, path, patch }) => {
    useEditor.getState().silent((d) => {
      for (const m of d.media) if (m.id === id || m.path === path) Object.assign(m, patch);
    });
  }), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useEditor.setState({ toast: null }), toast.kind === 'error' ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      {screen === 'home' ? <Home /> : <Editor />}
      {toast && <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>}
    </>
  );
}
