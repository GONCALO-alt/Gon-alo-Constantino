import React, { useState } from 'react';
import { FONT_CATEGORIES } from '../engine/fonts';

/** Seletor visual de tipos de letra (cada nome é mostrado na própria fonte), por categoria. */
export function FontPicker({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  const initial = FONT_CATEGORIES.find((c) => c.fonts.includes(value))?.name ?? FONT_CATEGORIES[0].name;
  const [cat, setCat] = useState(initial);
  const fonts = FONT_CATEGORIES.find((c) => c.name === cat)?.fonts ?? [];
  return (
    <div className="font-picker">
      <div className="font-cats">
        {FONT_CATEGORIES.map((c) => (
          <button key={c.name} className={c.name === cat ? 'on' : ''} onClick={() => setCat(c.name)}>{c.name}</button>
        ))}
      </div>
      <div className="font-grid">
        {fonts.map((f) => (
          <button key={f} className={`font-tile ${f === value ? 'on' : ''}`} style={{ fontFamily: `"${f}"` }} title={f} onClick={() => onChange(f)}>
            <span className="aa">Aa</span>
            <span className="fn">{f}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
