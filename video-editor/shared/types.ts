// Modelo de dados do projeto — partilhado entre a interface (renderer), o processo principal
// e o motor de exportação FFmpeg. Todas as unidades de tempo estão em segundos.

export type MediaKind = 'video' | 'audio' | 'image';

export interface MediaAsset {
  id: string;
  name: string;
  path: string; // caminho absoluto do ficheiro original
  kind: MediaKind;
  duration: number; // 0 para imagens
  width: number; // dimensões já com a rotação aplicada
  height: number;
  fps: number;
  hasAudio: boolean;
  hasVideo: boolean;
  videoCodec?: string;
  audioCodec?: string;
  pixFmt?: string;
  bitrate?: number;
  size: number; // bytes
  sampleRate?: number;
  channels?: number;
  thumbnail?: string; // caminho da miniatura (jpg)
  filmstrip?: { path: string; count: number }; // sprite horizontal de miniaturas
  waveform?: string; // caminho do JSON de picos (100 por segundo)
  proxyPath?: string;
  proxyStatus?: 'none' | 'pending' | 'running' | 'ready' | 'error';
  proxyProgress?: number;
  needsProxy?: boolean; // formato não suportado pelo leitor interno
  importedAt: number;
}

export type TrackKind = 'video' | 'audio' | 'text';

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  hidden: boolean;
  muted: boolean;
  caption?: boolean; // pista de legendas
}

export type Ease = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'hold';

export interface Keyframe {
  t: number; // tempo local do clip (segundos desde o início do clip na timeline)
  v: number;
  ease: Ease;
}

export type AnimProp = 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'volume';

export interface Transform {
  x: number; // deslocamento do centro, em fração da largura do canvas
  y: number; // deslocamento do centro, em fração da altura do canvas
  scale: number; // 1 = encaixado no canvas
  rotation: number; // graus, sentido horário
  opacity: number; // 0..1
  flipH: boolean;
  flipV: boolean;
}

export interface Crop {
  l: number; t: number; r: number; b: number; // frações 0..1 removidas em cada lado
}

export interface ColorAdjust {
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  temperature: number; // -100..100 (negativo = frio)
  tint: number; // -100..100 (positivo = magenta)
}

export interface EffectInstance {
  id: string;
  type: EffectType;
  intensity: number; // 0..100
}

export type EffectType = 'blur' | 'sharpen' | 'vignette' | 'grain' | 'glitch' | 'bw' | 'sepia' | 'invert';

export type TransitionType =
  | 'fade' | 'dissolve' | 'zoomIn' | 'zoomOut' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'blur' | 'glitch';

export interface TransitionRef { type: TransitionType; duration: number }

export type AnimType = 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'pop' | 'blur' | 'spin';
export interface ClipAnim { type: AnimType; duration: number }

export type MotionType = 'none' | 'shake' | 'kenBurnsIn' | 'kenBurnsOut' | 'pulse' | 'float' | 'sway';

export interface TextStyle {
  font: string;
  size: number; // px numa referência de 1080 de altura
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  strokeColor: string;
  strokeWidth: number; // px na referência 1080
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  background: string; // '' = sem fundo
  backgroundOpacity: number;
}

export type ClipType = 'video' | 'image' | 'audio' | 'text';

export interface Clip {
  id: string;
  type: ClipType;
  trackId: string;
  start: number; // posição na timeline
  duration: number; // duração na timeline
  mediaId?: string;
  in: number; // ponto de entrada na fonte
  speed: number;
  // áudio
  volume: number; // 0..2
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
  // visual
  transform: Transform;
  crop: Crop;
  color: ColorAdjust;
  filter: { id: string; intensity: number } | null;
  effects: EffectInstance[];
  keyframes: Partial<Record<AnimProp, Keyframe[]>>;
  motion: { type: MotionType; intensity: number };
  animIn: ClipAnim;
  animOut: ClipAnim;
  transitionIn: TransitionRef | null; // transição a partir do clip anterior na mesma pista
  // texto
  text?: string;
  style?: TextStyle;
  linkId?: string; // clips ligados (vídeo + áudio extraído) movem-se juntos
  name?: string;
}

export interface ProjectSettings {
  width: number; // resolução de trabalho (define a proporção)
  height: number;
  fps: number;
  background: string;
}

export interface Project {
  version: 1;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  media: MediaAsset[];
  tracks: Track[]; // ordem visual: o primeiro está no topo (camada de cima)
  clips: Clip[];
  markers: number[];
}

export type VideoCodec = 'h264' | 'hevc';
export type RateControl = 'crf' | 'bitrate';

export interface ExportOptions {
  outputPath: string;
  width: number;
  height: number;
  fps: number;
  codec: VideoCodec;
  encoder: string; // libx264, libx265, h264_nvenc, ...
  rateControl: RateControl;
  crf: number;
  bitrateMbps: number;
  preset: 'ultrafast' | 'veryfast' | 'fast' | 'medium' | 'slow';
  audioBitrateKbps: number;
  includeAudio: boolean;
  hwDecode: boolean;
  range?: { start: number; end: number };
  exportSrt?: boolean;
}

export interface ExportProgress {
  jobId: string;
  progress: number; // 0..1
  frame: number;
  fps: number;
  speed: number;
  elapsed: number;
  eta: number; // segundos
  stage: 'preparing' | 'rendering' | 'finalizing' | 'done' | 'error' | 'cancelled';
  message?: string;
  result?: ExportResult;
}

export interface ExportResult {
  path: string;
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec?: string;
  duration: number;
  size: number;
  bitrate: number;
}

export interface HardwareInfo {
  encoders: { id: string; codec: VideoCodec; label: string; hardware: boolean }[];
  ffmpegVersion: string;
  ffmpegPath: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  path: string;
  updatedAt: number;
  duration: number;
  thumbnail?: string;
  width: number;
  height: number;
}

export interface CaptionSegment { start: number; end: number; text: string }
