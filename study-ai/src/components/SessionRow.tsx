import { Link } from 'react-router-dom';
import { Check, MessagesSquare, Play } from 'lucide-react';
import { addMinutesToTime } from '../../shared/dates';
import { getSubject, type CustomSubjects } from '../../shared/subjects';
import { ACTIVITY_HINTS, ACTIVITY_LABELS, type DaySession } from '../../shared/types';
import { subjectColor } from './SubjectIcon';

export function sessionTitle(s: DaySession, custom?: CustomSubjects): string {
  return s.subject ? getSubject(s.subject, custom).name : 'Trabalhos de casa';
}

/** Link para o chat com uma pergunta já escrita, adequada à atividade da sessão. */
export function chatPromptFor(s: DaySession, custom?: CustomSubjects): string {
  const name = s.subject ? getSubject(s.subject, custom).name : '';
  switch (s.activity) {
    case 'exercicios':
    case 'consolidacao':
      return `Cria-me uma ficha de exercícios de ${name} com soluções no fim. A matéria é: `;
    case 'resumo':
      return `Faz-me um resumo de ${name} sobre: `;
    case 'perguntas':
      return `Faz-me 10 perguntas rápidas de ${name} para eu testar os meus conhecimentos sobre: `;
    case 'exemplos':
      return `Dá-me exemplos práticos do dia a dia para perceber esta matéria de ${name}: `;
    case 'revisao':
    case 'preparacao-teste':
      return `Ajuda-me a rever ${name} para o teste. A matéria é: `;
    case 'tpc':
      return 'Ajuda-me com este trabalho de casa: ';
    default:
      return `Explica-me de forma simples esta matéria de ${name}: `;
  }
}

export function SessionRow({
  s,
  done,
  busy,
  onToggle,
  custom,
  showHint,
}: {
  s: DaySession;
  done: boolean;
  busy?: boolean;
  onToggle: () => void;
  custom?: CustomSubjects;
  showHint?: boolean;
}) {
  const color = subjectColor(s.subject, custom);
  const timerUrl = `/estudar?session=${encodeURIComponent(s.key)}&subject=${encodeURIComponent(s.subject)}&minutes=${s.minutes}&date=${s.date}`;
  const chatUrl = `/chat?q=${encodeURIComponent(chatPromptFor(s, custom))}${s.subject ? `&subject=${encodeURIComponent(s.subject)}` : ''}`;
  return (
    <div className={`session ${done ? 'done' : ''}`}>
      <button type="button" className={`check ${done ? 'on' : ''}`} onClick={onToggle} disabled={busy} aria-label={done ? 'Marcar como não feita' : 'Marcar como feita'}>
        <Check />
      </button>
      <div className="session-time">
        {s.start}
        <span>{addMinutesToTime(s.start, s.minutes)}</span>
      </div>
      <span className="session-bar" style={{ background: color }} />
      <div className="grow">
        <div className="session-title">{sessionTitle(s, custom)}</div>
        <div className="session-sub">
          {ACTIVITY_LABELS[s.activity]} · {s.minutes} min
          {s.note ? ` · ${s.note}` : ''}
        </div>
        {showHint && !done && <div className="tiny faint" style={{ marginTop: 3 }}>{ACTIVITY_HINTS[s.activity]}</div>}
      </div>
      <Link to={chatUrl} className="icon-btn sm" aria-label="Pedir ajuda à IA" title="Pedir ajuda à IA">
        <MessagesSquare />
      </Link>
      {!done && (
        <Link to={timerUrl} className="icon-btn sm" aria-label="Começar com temporizador" title="Começar com temporizador" style={{ color: 'var(--yellow)' }}>
          <Play />
        </Link>
      )}
    </div>
  );
}
