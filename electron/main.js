// electron/main.js
// Electron 主进程：Phase 1 桌面壳。
// 职责：启动内嵌静态服务 → 创建窗口以 http://127.0.0.1 加载现有前端 →
//       菜单 / 日志 / IPC 版本号 / 自动更新预留接口。
//
// 关键：不使用 loadFile()（file:// 下 fetch 相对路径会全部失败），
//       改用 startStaticServer() + loadURL()，现有前端 fetch('data/...') 零改动可用。

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { startStaticServer } = require('./static-server');

// 打包后现有前端资源随 app 一起（见 electron-builder.yml 的 files/extraResources）。
// 开发态：electron/ 的上一级就是项目根（现有前端所在）。
// 生产态：资源被放到 app 根目录，__dirname 指向 app.asar 内的 electron/，
//         其上一级即打包进来的前端根。两种情况都取 __dirname 的上一级。
const WEB_ROOT = path.resolve(__dirname, '..');

let mainWindow = null;
let staticServer = null;
let serverOrigin = null;

// —— 简单文件日志（写到用户数据目录，便于排查桌面端问题）——
function logPath() {
  return path.join(app.getPath('userData'), 'desktop.log');
}
function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  try {
    fs.appendFileSync(logPath(), line);
  } catch (e) {
    // 忽略日志写入失败
  }
  console.log(...args);
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: '文件',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '访问项目主页',
          click: () => shell.openExternal('https://lupeng0330.github.io/english-tutor/'),
        },
        {
          label: `版本 v${app.getVersion()}`,
          enabled: false,
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  // 1) 启动内嵌静态服务（命门）
  const started = await startStaticServer(WEB_ROOT);
  staticServer = started.server;
  serverOrigin = started.origin;
  log('Static server started at', serverOrigin, 'root:', WEB_ROOT);

  // 2) 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 640,
    title: '乐学英语',
    backgroundColor: '#f8fafc',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 外部链接用系统浏览器打开，不在应用内导航
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // 3) 以 http:// 加载现有前端（相对 fetch 正常工作）
  await mainWindow.loadURL(`${serverOrigin}/index.html`);
  log('Loaded index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// —— IPC：向渲染进程提供原生版本号（供 index.html __withVer 注入用）——
ipcMain.handle('app:getVersion', () => app.getVersion());

// —— 自动更新预留接口（Phase 6 实现）——
function initAutoUpdater() {
  // TODO(Phase 6): electron-updater 检查更新 + 提示安装
}

app.whenReady().then(() => {
  buildMenu();
  initAutoUpdater();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (staticServer) {
    try { staticServer.close(); } catch (e) { /* ignore */ }
  }
  if (process.platform !== 'darwin') app.quit();
});
