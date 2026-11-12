// Falar com o chat: o microfone escreve a pergunta na caixa de texto.
// 1.º ditado do próprio navegador (Safari/Chrome), que vai escrevendo enquanto se fala;
// 2.º se não houver (ou falhar, como na app instalada no iPhone), grava e o servidor transcreve.
import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAudio } from './api';
import { MAX_AUDIO_SECONDS } from '../shared/plans';

export type VoiceState = 'idle' | 'listening' | 'recording' | 'transcribing';

interface Options {
  /** O servidor transcreve gravações (me.ai.voice). */
  serverVoice: boolean;
  /** Começou a ouvir: guarda o texto que já estava escrito. */
  onStart: () => void;
  /** Texto dito até agora nesta vez (substitui o anterior). */
  onText: (text: string) => void;
  /** Acabou de falar (texto final desta vez). Usado no modo conversa para enviar logo. */
  onFinal?: (text: string) => void;
  onError: (message: string) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Recognition = any;
const SpeechRecognitionCtor = (): (new () => Recognition) | null => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
const canRecord = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
const PREFER_RECORD = 'study-ai:voz-gravar';

function preferRecord(): boolean {
  try {
    return localStorage.getItem(PREFER_RECORD) === '1';
  } catch {
    return false;
  }
}
function rememberRecord() {
  try {
    localStorage.setItem(PREFER_RECORD, '1');
  } catch {
    /* sem armazenamento: volta a tentar o ditado da próxima vez */
  }
}

function pickMime(): string {
  for (const t of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* navegador antigo */
    }
  }
  return '';
}

export function useVoiceInput(opts: Options) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const [state, setState] = useState<VoiceState>('idle');
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<Recognition | null>(null);
  const mediaRef = useRef<{ recorder: MediaRecorder; stream: MediaStream; timer: ReturnType<typeof setInterval> } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const speech = !!SpeechRecognitionCtor();
  const record = canRecord() && opts.serverVoice;
  const supported = speech || record;

  const stopTracks = () => {
    const m = mediaRef.current;
    if (!m) return;
    clearInterval(m.timer);
    m.stream.getTracks().forEach((t) => t.stop());
  };

  const startRecording = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      optsRef.current.onError('Não consegui usar o microfone. Permite o acesso ao microfone nas definições do navegador e tenta outra vez.');
      setState('idle');
      return;
    }
    const mime = pickMime();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    const started = Date.now();
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      stopTracks();
      mediaRef.current = null;
      if (Date.now() - started < 600) {
        setState('idle');
        return;
      }
      setState('transcribing');
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const text = await transcribeAudio(new Blob(chunks, { type: (recorder.mimeType || mime || 'audio/webm').split(';')[0] }), ctrl.signal);
        optsRef.current.onText(text);
        if (text.trim()) optsRef.current.onFinal?.(text.trim());
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') optsRef.current.onError((err as Error).message);
      } finally {
        abortRef.current = null;
        setState('idle');
      }
    };
    setSeconds(0);
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (s >= MAX_AUDIO_SECONDS && recorder.state === 'recording') recorder.stop();
    }, 250);
    mediaRef.current = { recorder, stream, timer };
    recorder.start();
    setState('recording');
  }, []);

  const startSpeech = useCallback(() => {
    const Ctor = SpeechRecognitionCtor()!;
    const rec: Recognition = new Ctor();
    rec.lang = 'pt-PT';
    rec.interimResults = true;
    rec.continuous = true;
    let finalText = '';
    let lastText = '';
    let fellBack = false;
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      lastText = `${finalText}${interim}`.replace(/\s+/g, ' ').trim();
      optsRef.current.onText(lastText);
    };
    rec.onerror = (e: any) => {
      const err = String(e?.error ?? '');
      if (err === 'aborted') return;
      if (err === 'not-allowed') {
        optsRef.current.onError('Não tenho acesso ao microfone. Permite o acesso nas definições do navegador e tenta outra vez.');
      } else if (err === 'no-speech') {
        optsRef.current.onError('Não ouvi nada. Toca no microfone e fala perto do telemóvel.');
      } else if (canRecord() && optsRef.current.serverVoice) {
        // Ditado indisponível aqui (ex.: app instalada no iPhone): passa a gravar e o servidor transcreve.
        fellBack = true;
        rememberRecord();
        void startRecording();
      } else {
        optsRef.current.onError('O ditado por voz não está disponível neste navegador. Experimenta o Safari ou o Chrome, ou o microfone do teclado.');
      }
    };
    rec.onend = () => {
      recRef.current = null;
      if (fellBack) return;
      setState((s) => (s === 'listening' ? 'idle' : s));
      if (lastText) optsRef.current.onFinal?.(lastText);
    };
    recRef.current = rec;
    try {
      rec.start();
      setState('listening');
    } catch {
      recRef.current = null;
      if (record) void startRecording();
      else optsRef.current.onError('Não consegui começar a ouvir. Tenta outra vez.');
    }
  }, [record, startRecording]);

  const toggle = useCallback(() => {
    if (state === 'listening') {
      recRef.current?.stop();
      return;
    }
    if (state === 'recording') {
      mediaRef.current?.recorder.stop();
      return;
    }
    if (state === 'transcribing') return;
    optsRef.current.onStart();
    if (speech && !(record && preferRecord())) startSpeech();
    else if (record) void startRecording();
  }, [state, speech, record, startSpeech, startRecording]);

  /** Começa a ouvir (se ainda não estiver). */
  const start = useCallback(() => {
    if (state !== 'idle') return;
    optsRef.current.onStart();
    if (speech && !(record && preferRecord())) startSpeech();
    else if (record) void startRecording();
  }, [state, speech, record, startSpeech, startRecording]);

  /** Pára sem escrever mais nada (ex.: a pergunta foi enviada). */
  const cancel = useCallback(() => {
    const rec = recRef.current;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* já parado */
      }
      recRef.current = null;
    }
    const m = mediaRef.current;
    if (m) {
      m.recorder.onstop = null;
      if (m.recorder.state !== 'inactive') m.recorder.stop();
      stopTracks();
      mediaRef.current = null;
    }
    abortRef.current?.abort();
    setState('idle');
  }, []);

  // Ao sair da página: pára tudo e liberta o microfone.
  useEffect(() => cancel, [cancel]);

  return { supported, state, seconds, toggle, start, cancel };
}
