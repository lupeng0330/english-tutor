// electron/preload.js
// 安全隔离层：nodeIntegration=false + contextIsolation=true 下，
// 通过 contextBridge 只暴露最小必要能力给渲染进程（现有前端网页）。
//
// Phase 1 只暴露：
//   - 运行环境标识（isElectron / platform）
//   - 原生应用版本号（app.getVersion，经主进程 IPC 提供）
// 后续阶段（P3 SQLite / 同步）再按白名单逐步扩展，绝不开放任意 Node 能力。

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopBridge', {
  isElectron: true,
  platform: process.platform, // 'win32' | 'darwin' | 'linux'
  // 同步拿不到，主进程启动时通过 IPC 提供；这里返回 Promise
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
});
