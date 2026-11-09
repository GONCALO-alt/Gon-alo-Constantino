import { create } from 'zustand';

interface PlaybackState {
  time: number;
  playing: boolean;
  rate: number;
  loop: boolean;
  seek(t: number): void;
  setPlaying(p: boolean): void;
  setRate(r: number): void;
  toggle(): void;
}

/** Estado da cabeça de leitura, separado do projeto para não re-renderizar a app a cada fotograma. */
export const usePlayback = create<PlaybackState>((set, get) => ({
  time: 0,
  playing: false,
  rate: 1,
  loop: false,
  seek: (t) => set({ time: Math.max(0, t) }),
  setPlaying: (playing) => set({ playing }),
  setRate: (rate) => set({ rate }),
  toggle: () => set({ playing: !get().playing }),
}));
