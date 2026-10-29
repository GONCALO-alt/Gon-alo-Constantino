/** Componentes visuais partilhados. Ícones desenhados de raiz (SVG inline, sem dependências). */
import { useState, type ReactNode } from 'react';
import { APP_CONFIG } from '../../config/app.ts';
import { canSpeak, speak } from '../../services/speech.ts';

const PATHS: Record<string, ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5" />,
  map: <path d="M4 6.5 9 4l6 2.5L20 4v13.5L15 20l-6-2.5L4 20V6.5ZM9 4v13.5M15 6.5V20" />,
  review: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5M9 12.5l2 2 4-4.5" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" />,
  chart: <path d="M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-4" />,
  settings: <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.4-3.2-.1-1.3 2-1.6-2-3.4-2.4.9a7 7 0 0 0-2.2-1.3L14.3 3h-4l-.4 2.3a7 7 0 0 0-2.2 1.3l-2.4-.9-2 3.4 2 1.6a7 7 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2.2 1.3l.4 2.3h4l.4-2.3a7 7 0 0 0 2.2-1.3l2.4.9 2-3.4-2-1.6.1-1.3Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: <path d="M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />,
  sun: <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" />,
  sound: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Zm11.5-.5a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11" />,
  play: <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Zm0 15A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />,
  target: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.5V12l3 2" />,
};

export function Icon({ name, size = 22, label }: { name: keyof typeof PATHS | string; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} className="icon">
      {PATHS[name] ?? PATHS.star}
    </svg>
  );
}

/** Logótipo original: um caminho sinuoso (canal/estrada) com um ponto de chegada. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--brand)" />
        <path d="M8 25c0-6 16-4 16-10S11 11 11 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="11" cy="7" r="2.6" fill="var(--accent)" />
      </svg>
      {!compact && <span className="logo-text">{APP_CONFIG.name}</span>}
    </span>
  );
}

export function ProgressBar({ value, label, tone = 'brand' }: { value: number; label: string; tone?: 'brand' | 'accent' | 'ok' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SpeakButton({ text, rate, audio, size = 'md', label = 'Ouvir pronúncia' }: { text: string; rate: number; audio?: string; size?: 'md' | 'lg'; label?: string }) {
  const [busy, setBusy] = useState(false);
  if (!canSpeak() && !audio) return null;
  return (
    <button type="button" className={`speak speak-${size}`} aria-label={label} title={label} disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await speak(text, rate, audio); } finally { setBusy(false); }
      }}>
      <Icon name="sound" size={size === 'lg' ? 34 : 20} />
    </button>
  );
}

/** Texto com **negrito** simples (usado nas notas gramaticais). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function Card({ children, className = '', as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article'; 'aria-labelledby'?: string }) {
  return <As className={`card ${className}`} {...rest}>{children}</As>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
