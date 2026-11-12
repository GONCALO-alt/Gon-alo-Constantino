// Fotografar o calendário de testes: a IA lê as datas e o estudante confirma antes de as marcar.
import { useState } from 'react';
import { CalendarCheck, Camera } from 'lucide-react';
import { api } from '../api';
import { invalidate, useApp, useMe } from '../state';
import { formatDateShort } from '../../shared/dates';
import type { UsageSnapshot } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import type { CalendarEvent, CalendarProposal, EventType } from '../../shared/types';
import { PhotoPicker, photoIds, photosReady, type PickedPhoto } from './PhotoPicker';
import { Button, FormError, Modal } from './ui';

type Row = CalendarProposal & { on: boolean; duplicate: boolean };

export function CalendarPhotoModal({ open, onClose, existing }: { open: boolean; onClose: () => void; existing: CalendarEvent[] }) {
  const me = useMe();
  const { setUsage, toast } = useApp();
  const q = me.profile.questionnaire;
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setRows(null);
    setError('');
  }
  function close() {
    reset();
    onClose();
  }

  async function read() {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ events: CalendarProposal[]; usage: UsageSnapshot }>('/photos/calendar', { method: 'POST', body: { attachmentIds: photoIds(photos) } });
      setUsage(r.usage);
      const dup = (e: CalendarProposal) => existing.some((x) => x.date === e.date && x.type === e.type && (x.subject ?? null) === e.subject);
      setRows(r.events.map((e) => ({ ...e, on: !dup(e), duplicate: dup(e) })));
      if (!r.events.length) setError('Não encontrei datas de testes nas fotografias. Tenta uma foto mais nítida ou marca-os à mão.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!rows) return;
    setBusy(true);
    setError('');
    const chosen = rows.filter((r) => r.on);
    try {
      for (const r of chosen) {
        const title = r.title.trim() || (r.subject ? `Teste de ${getSubject(r.subject, q?.customSubjects).name}` : 'Teste');
        await api('/events', { method: 'POST', body: { type: r.type, subject: r.subject, title, date: r.date, notes: r.notes } });
      }
      invalidate('/events');
      toast(`${chosen.length} ${chosen.length === 1 ? 'data marcada' : 'datas marcadas'} no calendário. O plano já tem as revisões.`);
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (i: number, patch: Partial<Row>) => setRows((list) => list && list.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const count = rows?.filter((r) => r.on).length ?? 0;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Calendário de testes por foto"
      wide
      footer={
        rows?.length ? (
          <>
            <Button variant="ghost" onClick={reset}>Outra foto</Button>
            <Button icon={<CalendarCheck />} loading={busy} disabled={!count} onClick={save}>Marcar {count} no calendário</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>Cancelar</Button>
            <Button icon={<Camera />} loading={busy} disabled={!photosReady(photos)} onClick={read}>{busy ? 'A ler as datas…' : 'Ler as datas'}</Button>
          </>
        )
      }
    >
      {!rows?.length ? (
        <div className="stack">
          <p className="muted small">Fotografa o calendário de testes (da caderneta, do quadro ou do papel que o professor deu). A IA encontra as datas e tu confirmas antes de ficarem marcadas.</p>
          <PhotoPicker photos={photos} onChange={setPhotos} max={2} label="Fotografar o calendário" />
          <FormError>{error}</FormError>
        </div>
      ) : (
        <div className="stack">
          <p className="muted small">Confirma e corrige o que for preciso. Só ficam marcadas as linhas com visto.</p>
          {rows.map((r, i) => (
            <div key={i} className={`cal-proposal ${r.on ? '' : 'off'}`}>
              <label className="row" style={{ gap: 10 }}>
                <input type="checkbox" checked={r.on} onChange={(e) => set(i, { on: e.target.checked })} aria-label={`Marcar ${r.title}`} />
                <b className="grow">{r.title}</b>
                <span className="tiny faint nowrap">{formatDateShort(r.date)}</span>
              </label>
              <div className="cal-proposal-fields">
                <input className="input" type="date" value={r.date} onChange={(e) => set(i, { date: e.target.value })} aria-label="Data" />
                <select className="input" value={r.subject ?? ''} onChange={(e) => set(i, { subject: e.target.value || null })} aria-label="Disciplina">
                  <option value="">Sem disciplina</option>
                  {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
                </select>
                <select className="input" value={r.type} onChange={(e) => set(i, { type: e.target.value as EventType })} aria-label="Tipo">
                  <option value="teste">Teste</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              {r.duplicate && <div className="tiny faint">Já está no teu calendário.</div>}
              {r.notes && <div className="tiny faint">{r.notes}</div>}
            </div>
          ))}
          <FormError>{error}</FormError>
        </div>
      )}
    </Modal>
  );
}
