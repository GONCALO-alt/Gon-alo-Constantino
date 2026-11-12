import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ImagePlus, Lock, X } from 'lucide-react';
import { api, uploadFile } from '../api';
import { shrinkPhoto } from '../image';
import { useApp, useMe } from '../state';
import { AI_PLANS, imagesLeft } from '../../shared/plans';
import type { Attachment } from '../../shared/types';

export interface PickedPhoto {
  localId: string;
  preview: string;
  attachment?: Attachment;
}

/** Escolher/tirar até `max` fotografias e enviá-las logo (devolve as que já foram enviadas). */
export function PhotoPicker({ max = 3, photos, onChange, label = 'Tirar ou escolher fotos' }: {
  max?: number;
  photos: PickedPhoto[];
  onChange: (fn: (list: PickedPhoto[]) => PickedPhoto[]) => void;
  label?: string;
}) {
  const me = useMe();
  const { toast } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const plan = AI_PLANS[me.usage.plan];
  const left = imagesLeft(me.usage);
  const [busy, setBusy] = useState(0);

  // Ao sair: liberta as pré-visualizações.
  const latest = useRef(photos);
  latest.current = photos;
  useEffect(() => () => latest.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  if (plan.dailyImages === 0) {
    return (
      <div className="notice">
        <Lock />
        <div>
          O <b>{plan.name}</b> não lê fotografias. <Link to="/planos" className="yellow">Muda para o Cláudio 5.5 ou o Cláudio 6</Link> — nesta versão são grátis.
        </div>
      </div>
    );
  }

  async function add(files: File[]) {
    const room = Math.min(max - photos.length, left === null ? Infinity : left - photos.length);
    if (room <= 0) {
      toast(left !== null && left <= photos.length ? `Já usaste as fotografias de hoje do ${plan.name}.` : `Podes usar até ${max} fotografias.`, 'error');
      return;
    }
    for (const original of files.filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)).slice(0, room)) {
      const localId = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(original);
      onChange((l) => [...l, { localId, preview }]);
      setBusy((n) => n + 1);
      try {
        const attachment = await uploadFile(await shrinkPhoto(original));
        onChange((l) => l.map((p) => (p.localId === localId ? { ...p, attachment } : p)));
      } catch (err) {
        toast((err as Error).message, 'error');
        URL.revokeObjectURL(preview);
        onChange((l) => l.filter((p) => p.localId !== localId));
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  function remove(p: PickedPhoto) {
    URL.revokeObjectURL(p.preview);
    if (p.attachment) api(`/attachments/${p.attachment.id}`, { method: 'DELETE' }).catch(() => {});
    onChange((l) => l.filter((x) => x.localId !== p.localId));
  }

  return (
    <div className="photo-picker">
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      <div className="photo-grid">
        {photos.map((p, i) => (
          <div key={p.localId} className="photo-thumb">
            <img src={p.preview} alt={`Fotografia ${i + 1}`} />
            {!p.attachment && <span className="loading"><span className="spinner" /></span>}
            <button type="button" className="x" aria-label="Remover fotografia" onClick={() => remove(p)}><X /></button>
          </div>
        ))}
        {photos.length < max && (
          <button type="button" className="photo-add" onClick={() => input.current?.click()}>
            {photos.length ? <ImagePlus /> : <Camera />}
            <span>{photos.length ? 'Mais uma' : label}</span>
          </button>
        )}
      </div>
      <p className="tiny faint">
        Até {max} fotografias, nítidas e com boa luz. {left !== null && `Tens ${left} ${left === 1 ? 'fotografia' : 'fotografias'} hoje no ${plan.name}.`}
        {busy > 0 && ' A enviar…'}
      </p>
    </div>
  );
}

export const photoIds = (photos: PickedPhoto[]) => photos.map((p) => p.attachment?.id).filter((x): x is string => !!x);
export const photosReady = (photos: PickedPhoto[]) => photos.length > 0 && photos.every((p) => p.attachment);
