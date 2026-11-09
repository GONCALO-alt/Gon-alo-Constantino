/// <reference lib="webworker" />
// Reconhecimento de voz local com Whisper (transformers.js / ONNX Runtime).
// O modelo é descarregado da Hugging Face na primeira utilização e fica em cache.
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

let asr: any = null;
let loadedModel = '';

const post = (m: any) => (self as any).postMessage(m);

async function load(model: string) {
  if (asr && loadedModel === model) return asr;
  const device = (navigator as any).gpu ? 'webgpu' : 'wasm';
  asr = await pipeline('automatic-speech-recognition', `onnx-community/whisper-${model}`, {
    device,
    dtype: device === 'webgpu' ? { encoder_model: 'fp32', decoder_model_merged: 'q4' } : { encoder_model: 'q8', decoder_model_merged: 'q8' },
    progress_callback: (p: any) => {
      if (p.status === 'progress') post({ type: 'download', file: p.file, progress: p.progress ?? 0, loaded: p.loaded, total: p.total });
    },
  } as any);
  loadedModel = model;
  return asr;
}

/** Deteção de idioma: o Whisper prevê o token de idioma logo a seguir a <|startoftranscript|>. */
async function detectLanguage(audio: Float32Array): Promise<string> {
  const cfg = asr.model.generation_config;
  const langToId: Record<string, number> = cfg.lang_to_id ?? {};
  const idToLang = new Map(Object.entries(langToId).map(([k, v]) => [v, k.replace(/[<|>]/g, '')]));
  if (!idToLang.size) return 'en';
  // usa o troço de 30 s com mais energia
  const sr = 16000, win = sr * 30;
  let best = 0, bestE = -1;
  for (let s = 0; s < Math.max(1, audio.length - win + 1); s += sr * 10) {
    let e = 0;
    for (let i = s; i < Math.min(audio.length, s + win); i += 16) e += audio[i] * audio[i];
    if (e > bestE) { bestE = e; best = s; }
  }
  const seg = audio.subarray(best, Math.min(audio.length, best + win));
  const { input_features } = await asr.processor(seg);
  const out = await asr.model.generate({ inputs: input_features, decoder_input_ids: [cfg.decoder_start_token_id], max_new_tokens: 1 });
  const ids: number[] = (out.tolist ? out.tolist()[0] : out[0]).map((x: any) => Number(x));
  return idToLang.get(ids[ids.length - 1]) ?? 'en';
}

self.onmessage = async (e: MessageEvent) => {
  const { audio, model, language } = e.data as { audio: Float32Array; model: string; language: string };
  try {
    post({ type: 'status', text: 'A carregar o modelo de reconhecimento de voz…' });
    await load(model);
    let lang = language;
    if (language === 'auto') {
      post({ type: 'status', text: 'A identificar o idioma…' });
      lang = await detectLanguage(audio);
      post({ type: 'language', language: lang });
    }
    post({ type: 'status', text: 'A transcrever o áudio…' });
    const out = await asr(audio, {
      language: lang, task: 'transcribe', return_timestamps: true, chunk_length_s: 30, stride_length_s: 5,
    });
    const chunks = (out.chunks ?? []).map((c: any) => ({ start: c.timestamp?.[0] ?? 0, end: c.timestamp?.[1] ?? null, text: String(c.text ?? '').trim() }));
    post({ type: 'done', chunks, language: lang, text: out.text });
  } catch (err: any) {
    post({ type: 'error', message: err?.message ?? String(err) });
  }
};
