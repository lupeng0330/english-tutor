// 业务数据导出（铁律8：①输出即备份 ②打印逐表行数报告）。
// 两种模式：
//   本地：node scripts/export-data.js
//     从 DATABASE_URL 指向的库导出（本地 SQLite 或任意可达库）。
//   远程：node scripts/export-data.js --remote <baseUrl> <adminUser> <adminPass>
//     通过在线 API 的 GET /api/admin/export 抢救云函数 /tmp 里的数据。
// 产物：backups/export-<timestamp>.json
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_) { /* 可选 */ }

function saveSnapshot(snapshot) {
  const dir = path.join(__dirname, 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `export-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), 'utf8');
  const counts = snapshot.counts || {};
  console.log('[export] 逐表行数:');
  for (const [table, n] of Object.entries(counts)) console.log(`  ${table}: ${n}`);
  const errors = snapshot.errors || {};
  for (const [table, msg] of Object.entries(errors)) console.log(`  ⚠️ ${table} 导出失败: ${msg}`);
  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
  console.log(`[export] 已保存: ${file} (${mb} MB)`);
  return file;
}

async function exportRemote(baseUrl, username, password) {
  const base = baseUrl.replace(/\/$/, '');
  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`登录失败: HTTP ${login.status} ${await login.text()}`);
  const { accessToken } = await login.json();
  const resp = await fetch(`${base}/api/admin/export`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error(`导出失败: HTTP ${resp.status} ${await resp.text()}`);
  return saveSnapshot(await resp.json());
}

async function exportLocal() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const queries = [
    ['users', () => prisma.user.findMany()],
    ['classes', () => prisma.class.findMany()],
    ['classMembers', () => prisma.classMember.findMany()],
    ['membershipPlans', () => prisma.membershipPlan.findMany()],
    ['entitlements', () => prisma.entitlement.findMany()],
    ['planEntitlements', () => prisma.planEntitlement.findMany()],
    ['subscriptions', () => prisma.subscription.findMany()],
    ['userEntitlements', () => prisma.userEntitlement.findMany()],
    ['itemPurchases', () => prisma.itemPurchase.findMany()],
    ['orders', () => prisma.order.findMany()],
    ['paymentLogs', () => prisma.paymentLog.findMany()],
    ['auditLogs', () => prisma.auditLog.findMany()],
    ['syncBlobs', () => prisma.syncBlob.findMany()],
    ['systemSettings', () => prisma.systemSetting.findMany()],
  ];
  const tables = {};
  const errors = {};
  try {
    // 逐表独立查询：库缺表（历史漂移）时单表失败不拖垮整体
    for (const [key, fn] of queries) {
      try {
        tables[key] = await fn();
      } catch (e) {
        tables[key] = [];
        errors[key] = String(e.message || e).slice(0, 200);
      }
    }
    const counts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]));
    return saveSnapshot({ exportedAt: new Date().toISOString(), counts, errors, tables });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--remote') {
    const [, baseUrl, username, password] = args;
    if (!baseUrl || !username || !password) {
      console.error('用法: node scripts/export-data.js --remote <baseUrl> <adminUser> <adminPass>');
      process.exit(1);
    }
    await exportRemote(baseUrl, username, password);
  } else {
    await exportLocal();
  }
}

main().catch((e) => {
  console.error('[export] failed:', e.message || e);
  process.exit(1);
});
