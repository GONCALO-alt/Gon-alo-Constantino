import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Camera, KeyRound, Mail, MessagesSquare, ShieldCheck, Target, UserRound } from 'lucide-react';
import { api } from '../api';
import { Logo } from '../components/Logo';
import { Button, Field, FormError } from '../components/ui';
import { useApp } from '../state';
import type { MeResponse } from '../../shared/types';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { setMe } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = mode === 'register';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const me = await api<MeResponse>(register ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: register ? { name, email, password } : { email, password },
      });
      setMe(me);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="auth-orb" aria-hidden />
        <div>
          <Logo />
          <h1 style={{ marginTop: 56 }}>
            O teu assistente pessoal de estudos, <em>com inteligência artificial.</em>
          </h1>
          <p className="muted" style={{ marginTop: 18, fontSize: 17, maxWidth: 520 }}>
            Para todos os anos e todas as disciplinas. Explica a matéria, resolve exercícios passo a passo, prepara-te para
            os testes e organiza o teu tempo.
          </p>
          <div className="features">
            {[
              { icon: Target, text: 'Plano de estudos criado à tua medida' },
              { icon: MessagesSquare, text: 'Chat de IA especializado em educação' },
              { icon: Camera, text: 'Análise de fotografias de exercícios e fichas' },
              { icon: CalendarCheck, text: 'Revisões automáticas antes dos testes' },
            ].map((f, i) => (
              <div key={f.text} className="feature fade-up" style={{ ['--i' as string]: i + 2 }}>
                <span className="ic">
                  <f.icon />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-foot row small faint" style={{ marginTop: 40 }}>
          <ShieldCheck size={16} /> Os teus dados ficam guardados de forma segura e só tu tens acesso.
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card stack lg fade-up" onSubmit={submit} noValidate>
          <div>
            <h2>{register ? 'Cria a tua conta' : 'Bem-vindo de volta'}</h2>
            <p className="muted">
              {register ? 'Demora menos de um minuto. Depois respondes a umas perguntas rápidas.' : 'Inicia sessão para continuares a estudar.'}
            </p>
          </div>
          {register && (
            <Field label="Nome">
              <div className="input-icon">
                <UserRound />
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamas?" autoComplete="given-name" required maxLength={60} />
              </div>
            </Field>
          )}
          <Field label="Email">
            <div className="input-icon">
              <Mail />
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.pt" autoComplete="email" required />
            </div>
          </Field>
          <Field label="Palavra-passe">
            <div className="input-icon">
              <KeyRound />
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={register ? 'Pelo menos 8 caracteres' : 'A tua palavra-passe'}
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={register ? 8 : 1}
              />
            </div>
          </Field>
          <FormError>{error}</FormError>
          <Button type="submit" size="lg" block loading={loading}>
            {register ? 'Criar conta e começar' : 'Entrar'}
          </Button>
          <p className="center small muted">
            {register ? (
              <>
                Já tens conta? <Link to="/entrar" className="yellow">Inicia sessão</Link>
              </>
            ) : (
              <>
                Ainda não tens conta? <Link to="/criar-conta" className="yellow">Cria uma grátis</Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
