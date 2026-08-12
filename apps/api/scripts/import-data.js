// 业务数据导入（铁律8：②差异报告 ③行数骤降>30% 中断，--force 可跳过）。
// 用法：node scripts/import-data.js backups/export-<ts>.json [--force]
// 目标库由 DATABASE_URL 决定；目标为 PostgreSQL 前，必须先跑 npm run prisma:generate
// （生成 PG 版 client），否则连库会报方言错误。
// 幂等：全部按 id upsert，重复执行安全；外键安全顺序写入。
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_) { /* 可选 */ }
const { PrismaClient } = require('@prisma/client');

// 外键安全顺序：父表先于子表
const ORDER = [
  ['users', 'user'],
  ['classes', 'class'],
  ['classMembers', 'classMember'],
  ['membershipPlans', 'membershipPlan'],
  ['entitlements', 'entitlement'],
  ['planEntitlements', 'planEntitlement'],
  ['subscriptions', 'subscription'],
  ['userEntitlements', 'userEntitlement'],
  ['itemPurchases', 'itemPurchase'],
  ['orders', 'order'],
  ['paymentLogs', 'paymentLog'],
  ['auditLogs', 'auditLog'],
  ['syncBlobs', 'syncBlob'],
  ['systemSettings', 'systemSetting'],
];

async function main() {
  const file = process.argv[2];
  const force = process.argv.includes('--force');
  if (!file) {
    console.error('用法: node scripts/import-data.js <snapshot.json> [--force]');
    process.exit(1);
  }
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const tables = snapshot.tables || {};
  console.log(`[import] 快照时间: ${snapshot.exportedAt || '未知'}`);

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
  } catch (e) {
    console.error('[import] 连库失败。若目标是 PostgreSQL，请先执行 npm run prisma:generate 生成 PG 版 client 再试。');
    console.error(String(e.message || e).slice(0, 400));
    process.exit(1);
  }

  // ③ 骤降保护：快照行数显著少于目标表现有行数时中断（防止拿旧/空快照覆盖新数据）
  for (const [key, model] of ORDER) {
    const rows = tables[key];
    if (!Array.isArray(rows)) continue;
    const current = await prisma[model].count();
    if (!force && current > 0 && rows.length < current * 0.7) {
      console.error(`[import] 中断：表 ${key} 快照 ${rows.length} 行 < 目标现有 ${current} 行的 70%。确认无误后加 --force 重跑。`);
      process.exit(1);
    }
  }

  // ② 逐表 upsert + 差异报告
  for (const [key, model] of ORDER) {
    const rows = tables[key];
    if (!Array.isArray(rows)) continue;
    let inserted = 0, updated = 0;
    for (const row of rows) {
      const existing = await prisma[model].findUnique({ where: { id: row.id }, select: { id: true } });
      await prisma[model].upsert({ where: { id: row.id }, create: row, update: row });
      existing ? updated++ : inserted++;
    }
    const total = await prisma[model].count();
    console.log(`[import] ${key}: 快照${rows.length} | 新增${inserted} 覆盖${updated} | 目标现存${total}`);
  }
  await prisma.$disconnect();
  console.log('[import] done');
}

main().catch((e) => {
  console.error('[import] failed:', e.message || e);
  process.exit(1);
});
