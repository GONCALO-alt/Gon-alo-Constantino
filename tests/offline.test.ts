/**
 * Uso sem internet (services/offline.ts) e áudio depois do microfone (services/sounds.ts).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOfflineState, startOffline } from '../src/services/offline.ts';
import { configureSounds, playSound, restoreAudioAfterMicrophone } from '../src/services/sounds.ts';
import { listenOnce, type SpeechRecognitionLike } from '../src/services/speechRecognition.ts';

class FakeAudioContext {
  static created = 0;
  state = 'running';
  currentTime = 0;
  destination = {};
  constructor() { FakeAudioContext.created++; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  private node() {
    const n = { connect: () => n, start() {}, stop() {}, type: '', value: 0,
      frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      threshold: { value: 0 }, ratio: { value: 0 } };
    return n;
  }
  createOscillator() { return this.node(); }
  createGain() { return this.node(); }
  createDynamicsCompressor() { return this.node(); }
}

afterEach(() => vi.unstubAllGlobals());

describe('efeitos sonoros depois de usar o microfone', () => {
  it('o contexto de áudio é recriado depois do microfone', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    configureSounds({ enabled: true, volume: 0.8 });
    playSound('correct');
    const before = FakeAudioContext.created;
    restoreAudioAfterMicrophone();
    playSound('correct');
    expect(FakeAudioContext.created).toBe(before + 1);
  });

  it('o reconhecimento de voz repõe o áudio quando termina', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    class FakeRec implements SpeechRecognitionLike {
      lang = ''; maxAlternatives = 1; interimResults = false; continuous = false;
      onresult: SpeechRecognitionLike['onresult'] = null;
      onerror: SpeechRecognitionLike['onerror'] = null;
      onend: SpeechRecognitionLike['onend'] = null;
      start() {
        setTimeout(() => {
          this.onresult?.({ results: [[{ transcript: 'de kat' }]] });
          this.onend?.();
        }, 0);
      }
      stop() {}
      abort() {}
    }
    vi.stubGlobal('SpeechRecognition', FakeRec);
    configureSounds({ enabled: true });
    playSound('tap');
    const before = FakeAudioContext.created;
    await expect(listenOnce('nl-NL').result).resolves.toEqual(['de kat']);
    playSound('correct');
    expect(FakeAudioContext.created).toBe(before + 1);
  });
});

describe('uso sem internet', () => {
  it('fora da versão publicada não regista o service worker', () => {
    startOffline(false);
    expect(getOfflineState().kind).toBe('unsupported');
  });
});
