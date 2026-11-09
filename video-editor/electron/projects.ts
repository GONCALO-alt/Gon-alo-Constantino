// Sistema de projetos: biblioteca de projetos, gravação atómica, autosave,
// histórico de versões e recuperação após encerramentos inesperados.
import fs from 'node:fs';
import path from 'node:path';
import type { Project, ProjectSummary } from '../shared/types';
import { normalizeProject } from '../shared/defaults';
import { projectDuration, uid } from '../shared/timeline';

export class ProjectStore {
  constructor(private libraryDir: string, private dataDir: string) {
    fs.mkdirSync(libraryDir, { recursive: true });
    fs.mkdirSync(path.join(dataDir, 'autosave'), { recursive: true });
    fs.mkdirSync(path.join(dataDir, 'history'), { recursive: true });
  }

  get lockFile() { return path.join(this.dataDir, 'session.lock.json'); }
  get recentFile() { return path.join(this.dataDir, 'recent.json'); }

  private atomicWrite(file: string, data: string) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, file);
  }

  defaultPath(p: Project) {
    return path.join(this.libraryDir, `${p.id}.corte`);
  }

  private recent(): string[] {
    try { return JSON.parse(fs.readFileSync(this.recentFile, 'utf8')); } catch { return []; }
  }
  private addRecent(file: string) {
    const r = [file, ...this.recent().filter((f) => f !== file)].slice(0, 30);
    this.atomicWrite(this.recentFile, JSON.stringify(r));
  }

  list(): ProjectSummary[] {
    const files = new Set<string>([
      ...fs.readdirSync(this.libraryDir).filter((f) => f.endsWith('.corte')).map((f) => path.join(this.libraryDir, f)),
      ...this.recent().filter((f) => fs.existsSync(f)),
    ]);
    const out: ProjectSummary[] = [];
    for (const file of files) {
      try {
        const p = JSON.parse(fs.readFileSync(file, 'utf8')) as Project;
        const thumbMedia = p.media.find((m) => m.thumbnail && fs.existsSync(m.thumbnail));
        out.push({
          id: p.id, name: p.name, path: file, updatedAt: p.updatedAt, duration: projectDuration(p),
          thumbnail: thumbMedia?.thumbnail, width: p.settings.width, height: p.settings.height,
        });
      } catch { /* ficheiro inválido */ }
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  load(file: string): Project {
    const p = normalizeProject(JSON.parse(fs.readFileSync(file, 'utf8')));
    this.addRecent(file);
    return p;
  }

  save(p: Project, file?: string): string {
    const target = file || this.defaultPath(p);
    p.updatedAt = Date.now();
    this.atomicWrite(target, JSON.stringify(p));
    this.addRecent(target);
    // a cópia de autosave fica igual ao ficheiro: nada para recuperar
    try { fs.unlinkSync(this.autosaveFile(p.id)); } catch { /* */ }
    return target;
  }

  autosaveFile(id: string) { return path.join(this.dataDir, 'autosave', `${id}.json`); }

  /** Autosave: grava o diário de recuperação e o próprio ficheiro do projeto; guarda instantâneos para o histórico. */
  autosave(p: Project, file: string): { savedAt: number } {
    const now = Date.now();
    p.updatedAt = now;
    const json = JSON.stringify(p);
    this.atomicWrite(this.autosaveFile(p.id), JSON.stringify({ file, savedAt: now, project: p }));
    this.atomicWrite(file, json);
    // histórico de versões: no máximo um instantâneo por minuto, até 50
    const hdir = path.join(this.dataDir, 'history', p.id);
    fs.mkdirSync(hdir, { recursive: true });
    const snaps = fs.readdirSync(hdir).filter((f) => f.endsWith('.json')).sort();
    const last = snaps.length ? Number(snaps[snaps.length - 1].replace('.json', '')) : 0;
    if (now - last > 60_000) {
      this.atomicWrite(path.join(hdir, `${now}.json`), json);
      snaps.push(`${now}.json`);
      for (const old of snaps.slice(0, Math.max(0, snaps.length - 50))) fs.unlinkSync(path.join(hdir, old));
    }
    return { savedAt: now };
  }

  /** Instantâneo manual (ex.: antes de operações destrutivas). */
  snapshot(p: Project) {
    const hdir = path.join(this.dataDir, 'history', p.id);
    fs.mkdirSync(hdir, { recursive: true });
    this.atomicWrite(path.join(hdir, `${Date.now()}.json`), JSON.stringify(p));
  }

  history(id: string): { time: number; clips: number; duration: number }[] {
    const hdir = path.join(this.dataDir, 'history', id);
    if (!fs.existsSync(hdir)) return [];
    return fs.readdirSync(hdir).filter((f) => f.endsWith('.json')).map((f) => {
      const time = Number(f.replace('.json', ''));
      try {
        const p = JSON.parse(fs.readFileSync(path.join(hdir, f), 'utf8')) as Project;
        return { time, clips: p.clips.length, duration: projectDuration(p) };
      } catch { return { time, clips: 0, duration: 0 }; }
    }).sort((a, b) => b.time - a.time);
  }

  loadSnapshot(id: string, time: number): Project {
    return normalizeProject(JSON.parse(fs.readFileSync(path.join(this.dataDir, 'history', id, `${time}.json`), 'utf8')));
  }

  duplicate(file: string): string {
    const p = JSON.parse(fs.readFileSync(file, 'utf8')) as Project;
    p.id = uid('p_');
    p.name = `${p.name} (cópia)`;
    p.createdAt = p.updatedAt = Date.now();
    return this.save(p);
  }

  rename(file: string, name: string): void {
    const p = JSON.parse(fs.readFileSync(file, 'utf8')) as Project;
    p.name = name;
    this.atomicWrite(file, JSON.stringify(p));
  }

  remove(file: string): void {
    if (file.startsWith(this.libraryDir)) fs.unlinkSync(file);
    this.atomicWrite(this.recentFile, JSON.stringify(this.recent().filter((f) => f !== file)));
  }

  /** Exporta o projeto como pasta autónoma: copia a média e reescreve os caminhos. */
  exportPackage(p: Project, destDir: string): string {
    const safe = p.name.replace(/[^\w\- ]+/g, '_').trim() || 'projeto';
    const root = path.join(destDir, safe);
    const mediaDir = path.join(root, 'media');
    fs.mkdirSync(mediaDir, { recursive: true });
    const copy: Project = JSON.parse(JSON.stringify(p));
    const used = new Set<string>();
    for (const m of copy.media) {
      let name = path.basename(m.path);
      while (used.has(name)) name = `_${name}`;
      used.add(name);
      if (fs.existsSync(m.path)) fs.copyFileSync(m.path, path.join(mediaDir, name));
      m.path = path.join(mediaDir, name);
      m.proxyPath = undefined;
      m.proxyStatus = 'none';
    }
    const file = path.join(root, `${safe}.corte`);
    this.atomicWrite(file, JSON.stringify(copy, null, 2));
    return file;
  }

  // ---- Recuperação ----
  beginSession(projectId: string, file: string) {
    this.atomicWrite(this.lockFile, JSON.stringify({ projectId, file, pid: process.pid, at: Date.now() }));
  }
  endSession() {
    try { fs.unlinkSync(this.lockFile); } catch { /* */ }
  }
  /** Se a última sessão não terminou corretamente e há um autosave, devolve-o. */
  pendingRecovery(): { file: string; savedAt: number; project: Project } | null {
    let lock: any;
    try { lock = JSON.parse(fs.readFileSync(this.lockFile, 'utf8')); } catch { return null; }
    try {
      const a = JSON.parse(fs.readFileSync(this.autosaveFile(lock.projectId), 'utf8'));
      return { file: a.file, savedAt: a.savedAt, project: normalizeProject(a.project) };
    } catch {
      try { return { file: lock.file, savedAt: lock.at, project: this.load(lock.file) }; } catch { return null; }
    }
  }
}
