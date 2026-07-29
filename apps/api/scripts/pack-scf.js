// 打 SCF Web 函数部署 zip：关键是给 scf_bootstrap 设置 Unix 可执行权限位（0o755）。
// Windows 资源管理器/普通 zip 工具打包会丢失权限位，导致云函数启动失败（443）。
// 用法：node scripts/pack-scf.js  → 生成 scf-deploy.zip
const yazl = require('yazl');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'scf-deploy.zip');

// 部署需要包含的顶层条目（含 node_modules：SCF 在线安装对 prisma 引擎不可靠，直接自带）
const INCLUDE = ['dist', 'node_modules', 'prisma', 'scripts', 'package.json', 'scf_bootstrap'];
// 排除规则
const EXCLUDE_NAMES = new Set(['dev.db', 'dev.db-journal', '.env', 'scf-deploy.zip', '.DS_Store']);
const EXCLUDE_DIRS = new Set(['.cache', '.git']);
// 部署包只带 SCF 运行时引擎（rhel-openssl-1.1.x）；windows/debian 引擎本地保留、不入包（省 ~23MB）
const EXCLUDE_ENGINE_FILES = new Set([
  'query_engine-windows.dll.node',
  'libquery_engine-debian-openssl-3.0.x.so.node',
]);

let count = 0;
const zip = new yazl.ZipFile();

function addDir(dirAbs, dirRel) {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_NAMES.has(e.name)) continue;
    const abs = path.join(dirAbs, e.name);
    const rel = dirRel ? dirRel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      addDir(abs, rel);
    } else if (e.isFile()) {
      if (EXCLUDE_ENGINE_FILES.has(e.name)) continue; // 非 SCF 运行时的 Prisma 引擎不入包
      // scf_bootstrap 必须可执行；其他文件只读
      const mode = e.name === 'scf_bootstrap' ? 0o100755 : 0o100644;
      zip.addFile(abs, rel, { mode });
      count++;
    }
  }
}

for (const item of INCLUDE) {
  const abs = path.join(ROOT, item);
  if (!fs.existsSync(abs)) { console.error('[pack] missing: ' + item); process.exit(1); }
  const st = fs.statSync(abs);
  if (st.isDirectory()) addDir(abs, item);
  else {
    const mode = item === 'scf_bootstrap' ? 0o100755 : 0o100644;
    zip.addFile(abs, item, { mode });
    count++;
  }
}

zip.outputStream
  .pipe(fs.createWriteStream(OUT))
  .on('close', () => {
    const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
    console.log(`[pack] done: ${count} files -> scf-deploy.zip (${mb} MB)`);
  });
zip.end();
