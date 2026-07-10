// 初始化种子数据：管理员账号 + 默认权益点 + 默认套餐（含权益绑定）。
// 运行：npm run seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// 默认权益点（对应用户选的三类划分：教材年级 / AI / 高级功能）
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

// 默认套餐：月度/年度订阅、终身买断、单册教材（单项）
const PLANS = [
  { code: 'monthly', name: '月度会员', type: 'subscription', durationDays: 30, priceCents: 1800, ents: ['unlock_grade', 'ai_chat', 'ai_speaking', 'ai_essay', 'export_report', 'print_wrongbook', 'offline_audio'] },
  { code: 'yearly', name: '年度会员', type: 'subscription', durationDays: 365, priceCents: 12800, ents: ['unlock_grade', 'ai_chat', 'ai_speaking', 'ai_essay', 'export_report', 'print_wrongbook', 'offline_audio'] },
  { code: 'lifetime', name: '终身会员', type: 'lifetime', durationDays: null, priceCents: 29800, ents: ['unlock_grade', 'ai_chat', 'ai_speaking', 'ai_essay', 'export_report', 'print_wrongbook', 'offline_audio'] },
  { code: 'single_textbook', name: '单册教材解锁', type: 'item', durationDays: null, priceCents: 1200, ents: ['unlock_textbook'] },
];

async function main() {
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
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    });
    console.log(`[seed] admin created: ${adminUsername}`);
  } else {
    console.log(`[seed] admin exists: ${adminUsername}`);
  }

  // 2) 权益点
  for (const e of ENTITLEMENTS) {
    await prisma.entitlement.upsert({
      where: { code: e.code },
      update: { name: e.name, category: e.category },
      create: e,
    });
  }
  console.log(`[seed] entitlements: ${ENTITLEMENTS.length}`);

  // 3) 套餐 + 绑定权益
  for (const p of PLANS) {
    const plan = await prisma.membershipPlan.upsert({
      where: { code: p.code },
      update: { name: p.name, type: p.type, durationDays: p.durationDays, priceCents: p.priceCents },
      create: { code: p.code, name: p.name, type: p.type, durationDays: p.durationDays, priceCents: p.priceCents },
    });
    // 重建绑定
    await prisma.planEntitlement.deleteMany({ where: { planId: plan.id } });
    const ents = await prisma.entitlement.findMany({ where: { code: { in: p.ents } } });
    if (ents.length) {
      await prisma.planEntitlement.createMany({
        data: ents.map((en) => ({ planId: plan.id, entitlementId: en.id })),
      });
    }
  }
  console.log(`[seed] plans: ${PLANS.length}`);
  console.log('[seed] done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
