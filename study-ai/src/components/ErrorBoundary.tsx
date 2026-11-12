import { Component, type ErrorInfo, type ReactNode } from 'react';
import { DEMO } from '../env';

/** Se uma página rebentar, mostra o que aconteceu em vez de um ecrã vazio. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[STUDY AI]', error, info.componentStack);
    if (DEMO) import('../demo/server').then((m) => m.demoLogError('ecrã', error)).catch(() => {});
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card pad-lg stack" style={{ maxWidth: 440 }}>
          <h2>Algo correu mal</h2>
          <p className="muted">Os teus dados estão guardados. Volta a tentar; se o erro continuar, envia esta mensagem a quem gere a STUDY AI:</p>
          <pre className="small" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg-2)', padding: 12, borderRadius: 12, margin: 0 }}>
            {this.state.error.message}
          </pre>
          <button type="button" className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }
}
