import { useSeason } from './Season.tsx';

/**
 * Tulpje: a mascote da DutchPath (uma tulipa). Desenho próprio, em SVG, sem ficheiros.
 * Só encoraja: nunca critica nem castiga.
 */
export type MascotMood = 'happy' | 'cheer' | 'calm';

export function Mascot({ mood = 'happy', size = 96 }: { mood?: MascotMood; size?: number }) {
  const season = useSeason();
  return (
    <svg className={`mascot mascot-${mood}`} width={size} height={size * 1.425} viewBox="0 -14 80 114" aria-hidden="true" focusable="false">
      {/* braço a acenar */}
      <g className="mascot-arm">
        <path d="M18 66 C10 60 8 52 10 46" stroke="#e8e2d6" strokeWidth="7" strokeLinecap="round" fill="none" />
        <ellipse cx="10" cy="43" rx="5" ry="6" fill="#4f9d3a" />
      </g>
      {/* corpo: camisola */}
      <path d="M17 66 Q40 57 63 66 Q68 80 65 91 Q40 97 15 91 Q12 80 17 66 Z" fill="#f4efe6" stroke="#e2dacb" strokeWidth="1.5" />
      <path d="M40 70 C37 73 37 78 40 80 C43 78 43 73 40 70 Z M36 74 C34 76 35 79 38 80 Z M44 74 C46 76 45 79 42 80 Z" fill="#1d5f8a" />
      {/* calças e sapatos */}
      <rect x="24" y="88" width="13" height="7" rx="3" fill="#2f6fb0" />
      <rect x="43" y="88" width="13" height="7" rx="3" fill="#2f6fb0" />
      <ellipse cx="29" cy="97" rx="8" ry="3" fill="#ffffff" stroke="#d9d4ca" />
      <ellipse cx="51" cy="97" rx="8" ry="3" fill="#ffffff" stroke="#d9d4ca" />
      {/* braço direito */}
      <ellipse cx="63" cy="76" rx="4.5" ry="5.5" fill="#4f9d3a" />
      {/* cabeça: tulipa com pétalas arredondadas */}
      <g className="mascot-head">
        <path d="M13 34 C13 53 24 63 40 63 C56 63 67 53 67 34 C67 22 64 14 58 10 C55 15 52 20 48 22 C47 13 44 6 40 4 C36 6 33 13 32 22 C28 20 25 15 22 10 C16 14 13 22 13 34 Z" fill="#f2683c" />
        <path d="M40 4 C44 6 47 13 48 22 C45 26 35 26 32 22 C33 13 36 6 40 4 Z" fill="#f6875c" />
        <path d="M22 10 C25 15 28 20 32 22 C29 27 22 30 17 29 C15 22 17 14 22 10 Z" fill="#e3582f" opacity="0.55" />
        <path d="M58 10 C55 15 52 20 48 22 C51 27 58 30 63 29 C65 22 63 14 58 10 Z" fill="#e3582f" opacity="0.55" />
        <path d="M24 56 C30 61 50 61 56 56" stroke="#d9522b" strokeWidth="1.5" fill="none" opacity="0.5" />
        {/* olhos */}
        <g className="mascot-eyes">
          <ellipse cx="31" cy="41" rx="6.5" ry="7.5" fill="#fff" />
          <ellipse cx="49" cy="41" rx="6.5" ry="7.5" fill="#fff" />
          <circle cx="32" cy="42" r="4" fill="#1c2430" />
          <circle cx="48" cy="42" r="4" fill="#1c2430" />
          <circle cx="33.3" cy="40.5" r="1.3" fill="#fff" />
          <circle cx="49.3" cy="40.5" r="1.3" fill="#fff" />
        </g>
        {/* bochechas */}
        <ellipse cx="23" cy="50" rx="3.5" ry="2.2" fill="#f7a08a" />
        <ellipse cx="57" cy="50" rx="3.5" ry="2.2" fill="#f7a08a" />
        {/* boca */}
        {mood === 'calm'
          ? <path d="M36 52 Q40 55 44 52" stroke="#1c2430" strokeWidth="2" strokeLinecap="round" fill="none" />
          : <path d="M35 51 Q40 58 45 51 Z" fill="#5a2a22" />}
        {/* acessório da época festiva */}
        {season === 'christmas' && (
          <g className="mascot-hat">
            <path d="M20 16 C26 2 46 -2 60 8 L54 20 Z" fill="#d6312f" />
            <rect x="16" y="14" width="44" height="8" rx="4" fill="#ffffff" />
            <circle cx="62" cy="8" r="5" fill="#ffffff" />
          </g>
        )}
        {season === 'halloween' && (
          <g className="mascot-hat">
            <ellipse cx="40" cy="15" rx="30" ry="5" fill="#3b2457" />
            <path d="M27 14 L40 -12 L44 -4 L53 14 Z" fill="#4a2d6b" />
            <rect x="28" y="9" width="24" height="5" fill="#f2994a" />
          </g>
        )}
        {season === 'carnival' && (
          <g className="mascot-mask">
            <path d="M18 36 C24 30 36 32 40 38 C44 32 56 30 62 36 C62 46 52 49 46 45 L40 41 L34 45 C28 49 18 46 18 36 Z" fill="#8e5bd8" opacity="0.92" />
            <circle cx="31" cy="40" r="4.5" fill="#fff" /><circle cx="49" cy="40" r="4.5" fill="#fff" />
            <circle cx="32" cy="41" r="2.6" fill="#1c2430" /><circle cx="48" cy="41" r="2.6" fill="#1c2430" />
            <path d="M62 36 C68 28 72 22 70 14" stroke="#f0b400" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {season === 'easter' && (
          <g className="mascot-ears">
            <ellipse cx="28" cy="2" rx="6" ry="15" fill="#ffffff" stroke="#e8dfe8" />
            <ellipse cx="28" cy="3" rx="3" ry="10" fill="#f7b8cc" />
            <ellipse cx="52" cy="2" rx="6" ry="15" fill="#ffffff" stroke="#e8dfe8" />
            <ellipse cx="52" cy="3" rx="3" ry="10" fill="#f7b8cc" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Mascote com um balão de fala (frase em neerlandês + tradução). */
export function MascotTip({ nl, pt, mood = 'happy' }: { nl: string; pt: string; mood?: MascotMood }) {
  return (
    <div className="mascot-tip">
      <p className="mascot-bubble">
        <strong lang="nl">{nl}</strong>
        <span>{pt}</span>
      </p>
      <Mascot mood={mood} />
    </div>
  );
}

const TIPS: { nl: string; pt: string }[] = [
  { nl: 'Je kunt het!', pt: 'Tu consegues!' },
  { nl: 'Rustig aan.', pt: 'Com calma, sem pressa.' },
  { nl: 'Wist je dat?', pt: 'Toca numa palavra para ver a tradução.' },
  { nl: 'Doe je best!', pt: 'Dá o teu melhor!' },
  { nl: 'Fouten mogen.', pt: 'Errar faz parte de aprender.' },
];
const STREAK: { nl: string; pt: string }[] = [
  { nl: 'Goed bezig!', pt: 'Estás a mandar bem!' },
  { nl: 'Super!', pt: 'Continua assim!' },
  { nl: 'Lekker bezig!', pt: 'Estás a ir muito bem!' },
];

/** Frase da mascote para o exercício atual: incentivo pela sequência de respostas certas, ou uma dica. */
export function mascotLine(position: number, streak: number): { nl: string; pt: string; mood: MascotMood } {
  if (position === 0) return { nl: 'Veel succes!', pt: 'Boa sorte!', mood: 'happy' };
  if (streak >= 2) return { ...STREAK[streak % STREAK.length]!, mood: 'cheer' };
  return { ...TIPS[position % TIPS.length]!, mood: 'calm' };
}
