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

async function main() {
  // 1) 管理员
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123456';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existing = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        displayName: '超级管理员',
        role: 'admin',
        status: 'active',
        passwordHash,
      },
    });
    console.log(`[seed] admin created: ${adminUsername}`);
  } else {
    // 已存在也强制保证默认密码 / 角色 / 状态，避免「默认无法登录」
    await prisma.user.update({
      where: { username: adminUsername },
      data: { passwordHash, role: 'admin', status: 'active', displayName: existing.displayName || '超级管理员' },
    });
    console.log(`[seed] admin exists, password reset: ${adminUsername}`);
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

  // 4) 系统与 AI 设置
  for (const setting of SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        category: setting.category,
        value: JSON.stringify(setting.value),
        description: setting.description,
        isSecret: setting.isSecret || false,
      },
    });
  }
  console.log(`[seed] settings: ${SETTINGS.length}`);
  console.log('[seed] done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
