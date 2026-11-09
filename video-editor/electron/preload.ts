import { contextBridge, ipcRenderer, webUtils } from 'electron';

const inv = (ch: string) => (...a: unknown[]) => ipcRenderer.invoke(ch, ...a);
const on = (ch: string) => (cb: (p: any) => void) => {
  const l = (_e: unknown, p: unknown) => cb(p);
  ipcRenderer.on(ch, l);
  return () => ipcRenderer.removeListener(ch, l);
};

const api = {
  openMedia: inv('dialog:openMedia'),
  saveExportDialog: inv('dialog:saveExport'),
  openProjectDialog: inv('dialog:openProject'),
  saveProjectAsDialog: inv('dialog:saveProjectAs'),
  chooseFolder: inv('dialog:chooseFolder'),
  openSrt: inv('dialog:openSrt'),
  saveSrt: inv('dialog:saveSrt'),
  confirm: inv('dialog:confirm'),
  importMedia: inv('media:import'),
  analyzeMedia: inv('media:analyze'),
  makeProxy: inv('media:proxy'),
  cancelProxy: inv('media:cancelProxy'),
  readWaveform: inv('media:waveform'),
  freezeFrame: inv('media:freezeFrame'),
  exists: inv('media:exists'),
  writeTemp: inv('fs:writeTemp'),
  readBinary: inv('fs:readBinary'),
  writeText: inv('fs:writeText'),
  detectHardware: inv('hw:detect'),
  startExport: inv('export:start'),
  cancelExport: inv('export:cancel'),
  reveal: inv('shell:reveal'),
  openPath: inv('shell:open'),
  captionAudio: inv('captions:audioMix'),
  listProjects: inv('project:list'),
  loadProject: inv('project:load'),
  saveProject: inv('project:save'),
  defaultProjectPath: inv('project:defaultPath'),
  autosave: inv('project:autosave'),
  snapshot: inv('project:snapshot'),
  history: inv('project:history'),
  loadSnapshot: inv('project:loadSnapshot'),
  duplicateProject: inv('project:duplicate'),
  renameProject: inv('project:rename'),
  removeProject: inv('project:remove'),
  exportPackage: inv('project:exportPackage'),
  beginSession: inv('project:beginSession'),
  endSession: inv('project:endSession'),
  pendingRecovery: inv('project:pendingRecovery'),
  appInfo: inv('app:info'),
  toggleFullscreen: inv('app:toggleFullscreen'),
  onMediaUpdate: on('media:update'),
  onExportProgress: on('export:progress'),
  pathForFile: (f: File) => webUtils.getPathForFile(f),
};

contextBridge.exposeInMainWorld('api', api);
export type Api = typeof api;
