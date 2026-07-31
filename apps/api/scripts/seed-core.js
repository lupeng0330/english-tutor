// 种子数据「单一事实源」（CommonJS，只依赖生产依赖 @prisma/client + bcryptjs）。
// 两处复用：
//   1) 本地 `npm run seed` → prisma/seed.ts 薄壳调用（resetAdminPassword = true）
//   2) 云函数冷启动 → scf_bootstrap 执行 `node scripts/seed-core.js`（resetAdminPassword = false）
// 为什么不用 ts-node 跑 seed.ts：ts-node/typescript 是 dev 依赖，不入云函数部署包。
// 幂等：全部 upsert；已存在的 admin 默认不动密码（避免线上把运营改过的密码重置回默认）。
// 本地执行时需要 .env 里的 DATABASE_URL；云函数由 scf_bootstrap 导出环境变量，
// dotenv 不会覆盖已存在的环境变量，两边都安全。
try { require('dotenv').config(); } catch (_) { /* 可选依赖，缺失不致命 */ }
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// 默认权益点（教材年级 / AI / 高级功能三类）
const ENTITLEMENTS = [
  { code: 'unlock_grade', name: '解锁全部年级教材', category: 'content' },
  { code: 'unlock_textbook', name: '解锁指定教材', category: 'content' },
  { code: 'ai_chat', name: 'AI 对话', category: 'ai' },
  { code: 'ai_speaking', name: 'AI 口语/朗读评测', category: 'ai' },
  { code: 'ai_essay', name: 'AI 作文评分', category: 'ai' },
  { code: 'export_report', name: '学习报告导出', category: 'feature' },
  { code: 'print_wrongbook', name: '错题打印', category: 'feature' },
  { code: 'offline_audio', name: '离线音频包', category: 'feature' },
];

const FULL = ['unlock_grade', 'ai_chat', 'ai_speaking', 'ai_essay', 'export_report', 'print_wrongbook', 'offline_audio'];

// 默认套餐：月度/年度订阅、终身买断、单册教材（单项）
const PLANS = [
  { code: 'monthly', name: '月度会员', type: 'subscription', durationDays: 30, priceCents: 1800, ents: FULL },
  { code: 'yearly', name: '年度会员', type: 'subscription', durationDays: 365, priceCents: 12800, ents: FULL },
  { code: 'lifetime', name: '终身会员', type: 'lifetime', durationDays: null, priceCents: 29800, ents: FULL },
  { code: 'single_textbook', name: '单册教材解锁', type: 'item', durationDays: null, priceCents: 1200, ents: ['unlock_textbook'] },
];

const SETTINGS = [
  { key: 'siteName', category: 'system', value: '乐学英语', description: '后台与客户端显示名称', isSecret: false },
  { key: 'registrationEnabled', category: 'system', value: true, description: '是否开放用户注册', isSecret: false },
  { key: 'maintenanceMode', category: 'system', value: false, description: '维护模式（暂停客户端登录）', isSecret: false },
  { key: 'dailyLimit', category: 'system', value: 20, description: '免费用户每日 AI 调用额度', isSecret: false },
  { key: 'aiEnabled', category: 'ai', value: false, description: '是否启用 AI 能力', isSecret: false },
  { key: 'aiProvider', category: 'ai', value: 'openai', description: 'AI 服务提供方', isSecret: false },
  { key: 'aiModel', category: 'ai', value: 'gpt-4o-mini', description: '默认 AI 模型', isSecret: false },
  { key: 'aiApiKey', category: 'ai', value: '', description: 'AI 服务密钥', isSecret: true },
];

/**
 * @param {{ resetAdminPassword?: boolean, quiet?: boolean }} [opts]
 */
async function runSeed(opts) {
  const resetAdminPassword = !!(opts && opts.resetAdminPassword);
  const quiet = !!(opts && opts.quiet);
  const log = (...a) => { if (!quiet) console.log(...a); };
  const prisma = new PrismaClient();
  try {
    // 1) 管理员
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123456';
    const existing = await prisma.user.findUnique({ where: { username: adminUsername } });
    if (!existing) {
      await prisma.user.create({
        data: {
          username: adminUsername,
          displayName: '超级管理员',
          role: 'admin',
          status: 'active',
          passwordHash: await bcrypt.hash(adminPassword, 10),
        },
      });
      log(`[seed] admin created: ${adminUsername}`);
    } else if (resetAdminPassword) {
      // 本地 npm run seed 才强制重置，避免「默认账号登不进去」
      await prisma.user.update({
        where: { username: adminUsername },
        data: {
          passwordHash: await bcrypt.hash(adminPassword, 10),
          role: 'admin',
          status: 'active',
          displayName: existing.displayName || '超级管理员',
        },
      });
      log(`[seed] admin exists, password reset: ${adminUsername}`);
    } else {
      log(`[seed] admin exists, keep password: ${adminUsername}`);
    }

    // 2) 权益点
    for (const e of ENTITLEMENTS) {
      await prisma.entitlement.upsert({
        where: { code: e.code },
        update: { name: e.name, category: e.category },
        create: e,
      });
    }
    log(`[seed] entitlements: ${ENTITLEMENTS.length}`);

    // 3) 套餐 + 绑定权益
    for (const p of PLANS) {
      const plan = await prisma.membershipPlan.upsert({
        where: { code: p.code },
        update: { name: p.name, type: p.type, durationDays: p.durationDays, priceCents: p.priceCents },
        create: { code: p.code, name: p.name, type: p.type, durationDays: p.durationDays, priceCents: p.priceCents },
      });
      await prisma.planEntitlement.deleteMany({ where: { planId: plan.id } });
      const ents = await prisma.entitlement.findMany({ where: { code: { in: p.ents } } });
      if (ents.length) {
        await prisma.planEntitlement.createMany({
          data: ents.map((en) => ({ planId: plan.id, entitlementId: en.id })),
        });
      }
    }
    log(`[seed] plans: ${PLANS.length}`);

    // 4) 系统与 AI 设置（已存在不覆盖，保护运营配置）
    for (const s of SETTINGS) {
      await prisma.systemSetting.upsert({
        where: { key: s.key },
        update: {},
        create: {
          key: s.key,
          category: s.category,
          value: JSON.stringify(s.value),
          description: s.description,
          isSecret: s.isSecret || false,
        },
      });
    }
    log(`[seed] settings: ${SETTINGS.length}`);
    log('[seed] done.');
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { runSeed, ENTITLEMENTS, PLANS, SETTINGS };

// 直接 `node scripts/seed-core.js` 执行（云函数冷启动用；默认不重置已存在管理员的密码）
if (require.main === module) {
  runSeed({ resetAdminPassword: process.argv.includes('--reset-admin') }).catch((e) => {
    console.error('[seed] failed:', e && e.message ? e.message : e);
    process.exit(1);
  });
}
