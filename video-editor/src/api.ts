import type {
  CaptionSegment, ExportOptions, ExportProgress, HardwareInfo, MediaAsset, Project, ProjectSummary,
} from '@shared/types';

export interface Api {
  openMedia(): Promise<string[]>;
  saveExportDialog(name: string): Promise<string | null>;
  openProjectDialog(): Promise<string | null>;
  saveProjectAsDialog(name: string): Promise<string | null>;
  chooseFolder(title: string): Promise<string | null>;
  openSrt(): Promise<string | null>;
  saveSrt(name: string, content: string): Promise<string | null>;
  confirm(message: string, detail?: string, buttons?: string[]): Promise<number>;
  importMedia(paths: string[], opts: { autoProxy: boolean }): Promise<{ media: MediaAsset[]; errors: string[] }>;
  analyzeMedia(m: MediaAsset, opts: { autoProxy: boolean }): Promise<void>;
  makeProxy(m: MediaAsset): Promise<void>;
  cancelProxy(id: string): Promise<void>;
  readWaveform(path: string): Promise<{ perSec: number; peaks: number[] }>;
  freezeFrame(path: string, time: number): Promise<MediaAsset>;
  exists(path: string): Promise<boolean>;
  writeTemp(name: string, data: ArrayBuffer): Promise<string>;
  readBinary(path: string): Promise<ArrayBuffer>;
  writeText(path: string, content: string): Promise<void>;
  detectHardware(): Promise<HardwareInfo>;
  startExport(p: Project, o: ExportOptions, textImages: Record<string, { path: string; width: number; height: number }>): Promise<string>;
  cancelExport(id: string): Promise<void>;
  reveal(path: string): Promise<void>;
  openPath(path: string): Promise<void>;
  captionAudio(p: Project): Promise<ArrayBuffer>;
  listProjects(): Promise<ProjectSummary[]>;
  loadProject(path: string): Promise<Project>;
  saveProject(p: Project, path?: string): Promise<string>;
  defaultProjectPath(p: Project): Promise<string>;
  autosave(p: Project, path: string): Promise<{ savedAt: number }>;
  snapshot(p: Project): Promise<void>;
  history(id: string): Promise<{ time: number; clips: number; duration: number }[]>;
  loadSnapshot(id: string, time: number): Promise<Project>;
  duplicateProject(path: string): Promise<string>;
  renameProject(path: string, name: string): Promise<void>;
  removeProject(path: string): Promise<void>;
  exportPackage(p: Project, dir: string): Promise<string>;
  beginSession(id: string, path: string): Promise<void>;
  endSession(): Promise<void>;
  pendingRecovery(): Promise<{ file: string; savedAt: number; project: Project } | null>;
  appInfo(): Promise<{ ffmpeg: string; userData: string; platform: string; version: string }>;
  toggleFullscreen(): Promise<void>;
  onMediaUpdate(cb: (u: { id: string; path: string; patch: Partial<MediaAsset> }) => void): () => void;
  onExportProgress(cb: (p: ExportProgress) => void): () => void;
  pathForFile(f: File): string;
}

declare global { interface Window { api: Api } }
export const api: Api = window.api;

/** URL do protocolo media:// (com suporte a streaming e Range) para um ficheiro local. */
export const mediaUrl = (path: string) => `media://f/${encodeURIComponent(path)}`;

export type { CaptionSegment };
