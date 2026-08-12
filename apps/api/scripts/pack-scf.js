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
// backups：数据迁移快照（含用户数据），绝不入部署包
const EXCLUDE_DIRS = new Set(['.cache', '.git', 'backups']);
// 部署包只带 SCF 运行时引擎（rhel-openssl-1.1.x）；windows/debian 引擎与 prisma generate
// 遗留的 *.tmp<pid> 半成品副本一律不入包（曾各 18.4MB × N，直接把包顶到 51MB 触发上传 413）
const EXCLUDE_FILE_PATTERNS = [
  /query_engine-windows\.dll\.node/,      // Windows 引擎（含 .tmp1234 残留）
  /libquery_engine-debian-openssl/,       // debian 引擎
  /\.tmp\d+$/,                            // 任何 *.tmpNNNN 临时残留
];
// dev-only 依赖不入包（运行时 scf_bootstrap 只跑 node scripts/init-db.js + node dist/server.js）
// @prisma/engines 是 prisma CLI 的引擎包，@prisma/client 运行时用 .prisma/client 内的引擎，不需要它
const EXCLUDE_RELS = new Set([
  'node_modules/prisma',
  'node_modules/typescript',
  'node_modules/ts-node',
  'node_modules/ts-node-dev',
  'node_modules/@types',
  'node_modules/yazl',
  'node_modules/@prisma/engines',
]);

let count = 0;
let hasRhelEngine = false;
const zip = new yazl.ZipFile();

function addDir(dirAbs, dirRel) {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_NAMES.has(e.name)) continue;
    const abs = path.join(dirAbs, e.name);
    const rel = dirRel ? dirRel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      if (EXCLUDE_RELS.has(rel)) continue; // dev-only 依赖
      addDir(abs, rel);
    } else if (e.isFile()) {
      if (EXCLUDE_FILE_PATTERNS.some((re) => re.test(e.name))) continue; // 非 SCF 运行时引擎 / tmp 残留
      if (e.name === 'libquery_engine-rhel-openssl-1.1.x.so.node') hasRhelEngine = true;
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
    if (!hasRhelEngine) {
      console.error('[pack] FATAL: 包内缺少 libquery_engine-rhel-openssl-1.1.x.so.node，云函数将无法连库！');
      process.exitCode = 1;
    }
  });
zip.end();
