// mobile/scripts/copy-web-assets.js
// 将项目根的现有前端运行时资源同步到 Capacitor 的 webDir (mobile/www)。
// 与 electron-builder.yml 的白名单同源：只拷贝前端运行所需资源，排除
// 后端/脚本/文档/备份等，避免把无关内容打进移动包。
//
// 用法：node mobile/scripts/copy-web-assets.js
// 每次改动现有前端后、执行 `npx cap sync` 前先跑此脚本刷新 www。

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // 项目根
const WWW = path.resolve(__dirname, '..', 'www'); // Capacitor webDir

// 需要拷贝的顶层文件
const FILES = [
  'index.html',
  'mobile.html',
  'app.js',
  'questionBank.js',
  'manifest.json',
  'styles.css',
  'tailwind.css',
  'version.txt',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  // 注意：sw.js 不拷贝——移动壳内 SW 无意义（hostname 非 *.github.io 天然不注册）
];

// 需要整目录拷贝的资源
const DIRS = ['js', 'data', 'audio'];

// 目录内需排除的子路径（相对该目录）
const EXCLUDE_DIRNAMES = new Set(['.backups', '_tmp', '_sent', '__pycache__']);
const EXCLUDE_EXTS = new Set(['.py', '.pyc']);

function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

let fileCount = 0;

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRNAMES.has(entry.name)) continue;
      copyDir(path.join(srcDir, entry.name), path.join(destDir, entry.name));
    } else if (entry.isFile()) {
      if (EXCLUDE_EXTS.has(path.extname(entry.name).toLowerCase())) continue;
      copyFile(path.join(srcDir, entry.name), path.join(destDir, entry.name));
      fileCount++;
    }
  }
}

function main() {
  rmrf(WWW);
  fs.mkdirSync(WWW, { recursive: true });

  for (const f of FILES) {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(WWW, f));
      fileCount++;
    } else {
      console.warn('  [skip missing]', f);
    }
  }

  for (const d of DIRS) {
    copyDir(path.join(ROOT, d), path.join(WWW, d));
  }

  console.log(`[copy-web-assets] done. ${fileCount} files copied to ${WWW}`);
}

main();
