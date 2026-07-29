// 云函数冷启动数据库初始化：用 PrismaClient 执行 prisma/init.sql 建表。
// 为什么不用 prisma db push：CLI 的 schema-engine 是平台相关的（本地 Windows 版在 Linux 云函数跑不了），
// 而 @prisma/client 的 query engine 已含 Linux 版（binaryTargets），直接执行 SQL 最稳。
// 幂等：表已存在时跳过（实例复用 /tmp 未清空的场景）。
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  const sqlFile = path.join(__dirname, '..', 'prisma', 'init.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  // 去掉行注释，按分号切语句
  const statements = sql
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let created = 0, skipped = 0;
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      created++;
    } catch (e) {
      const msg = (e && e.message) || '';
      if (/already exists|duplicate/i.test(msg)) { skipped++; continue; }
      throw e;
    }
  }
  await prisma.$disconnect();
  console.log(`[init-db] done: ${created} executed, ${skipped} skipped(existing)`);
}

main().catch((e) => {
  console.error('[init-db] failed:', e);
  process.exit(1);
});
