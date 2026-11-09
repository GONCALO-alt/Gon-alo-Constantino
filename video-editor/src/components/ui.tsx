import React, { useEffect, useState } from 'react';
import { Diamond, RotateCcw, X } from 'lucide-react';

export function Slider(props: {
  label?: React.ReactNode; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void; onReset?: () => void; kf?: React.ReactNode; format?: (v: number) => string; disabled?: boolean;
}) {
  const { value, min, max, step = 1, onChange } = props;
  const [txt, setTxt] = useState<string | null>(null);
  const fill = ((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100;
  const shown = props.format ? props.format(value) : String(Math.round(value / step) * step === value ? value : +value.toFixed(3));
  return (
    <div className="field" style={{ marginBottom: 10, opacity: props.disabled ? 0.5 : 1 }}>
      {props.label !== undefined && (
        <div className="label">
          <span>{props.label}</span>
          <span className="row" style={{ gap: 2 }}>
            {props.onReset && <button className="kf" title="Repor" onClick={props.onReset}><RotateCcw size={12} /></button>}
          </span>
        </div>
      )}
      <div className="slider-row">
        <input
          type="range" min={min} max={max} step={step} value={value} disabled={props.disabled}
          style={{ ['--fill' as any]: `${fill}%` }}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onDoubleClick={props.onReset}
        />
        <input
          className="num" value={txt ?? `${shown}${props.unit ?? ''}`} disabled={props.disabled}
          onFocus={(e) => { setTxt(String(+value.toFixed(3))); setTimeout(() => e.target.select()); }}
          onChange={(e) => setTxt(e.target.value)}
          onBlur={() => { const v = parseFloat(txt ?? ''); if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v))); setTxt(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); e.stopPropagation(); }}
        />
        <span>{props.kf}</span>
      </div>
    </div>
  );
}

export function KfButton({ active, has, onClick, title }: { active: boolean; has: boolean; onClick: () => void; title?: string }) {
  return (
    <button className={`kf ${active ? 'on' : has ? 'has' : ''}`} title={title ?? (active ? 'Remover keyframe' : 'Adicionar keyframe')} onClick={onClick}>
      <Diamond size={13} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <label className="row" style={{ cursor: 'pointer', justifyContent: 'space-between', marginBottom: 10 }}>
      <span className="label">{label}</span>
      <span onClick={() => onChange(!value)} style={{
        width: 34, height: 20, borderRadius: 10, background: value ? 'var(--accent)' : 'var(--bg4)', position: 'relative', transition: 'background .15s', flexShrink: 0,
      }}>
        <span style={{ position: 'absolute', top: 2, left: value ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left .15s' }} />
      </span>
    </label>
  );
}

export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={String(o.v)} title={o.title} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, width }: { title: React.ReactNode; onClose?: () => void; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" style={width ? { width } : undefined}>
        <div className="modal-head">
          <span>{title}</span>
          {onClose && <button className="icon-btn" onClick={onClose}><X size={16} /></button>}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Section({ title, right, children }: { title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-title"><span>{title}</span>{right}</div>
      {children}
    </div>
  );
}

export const fmtBytes = (b: number) => {
  if (!b) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(i ? 1 : 0)} ${u[i]}`;
};
