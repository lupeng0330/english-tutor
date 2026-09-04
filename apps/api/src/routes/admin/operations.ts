import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db';
import { asyncHandler, badRequest } from '../../middleware/error';
import { AuthedRequest } from '../../types';
import { writeAudit } from '../../services/audit';
import { containsCI } from '../../utils/query';

const router = Router();

router.get('/dashboard', asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [users, activeUsers, classes, activeMembers, paidOrders, revenue, content, drafts, audit24h, questionAgg, examAgg, todayActive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.class.count(),
    prisma.subscription.count({ where: { status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    prisma.order.count({ where: { status: 'paid' } }),
    prisma.order.aggregate({ where: { status: 'paid' }, _sum: { amountCents: true } }),
    prisma.contentDocument.count(),
    prisma.contentDocument.count({ where: { status: 'draft' } }),
    prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.contentDocument.aggregate({ where: { kind: 'questions' }, _sum: { itemCount: true } }),
    prisma.contentDocument.aggregate({ where: { kind: { in: ['exams', 'exam_templates'] } }, _sum: { itemCount: true } }),
    prisma.user.count({ where: { lastLoginAt: { gte: startOfToday } } }),
  ]);
  const trend: Array<{ date: string; users: number; revenue: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
    trend.push({ date: start.toISOString().slice(0, 10), users: count, revenue: 0 });
  }
  const recentLogs = await prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { actor: { select: { username: true, displayName: true } } } });
  const recentActivities = recentLogs.map((a) => ({
    id: a.id,
    action: a.action,
    actor: a.actor?.displayName || a.actor?.username || '系统',
    createdAt: a.createdAt.toISOString(),
  }));
  res.json({
    users,
    activeUsers,
    classes,
    activeMembers,
    paidOrders,
    revenueCents: revenue._sum.amountCents || 0,
    contentDocuments: content,
    draftDocuments: drafts,
    audit24h,
    questions: questionAgg._sum.itemCount || 0,
    exams: examAgg._sum.itemCount || 0,
    todayActive,
    trend,
    recentActivities,
  });
}));

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const parsed = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    action: z.string().max(100).optional(),
    actorId: z.string().optional(),
    search: z.string().max(100).optional(),
  }).safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const { page, pageSize, action, actorId, search } = parsed.data;
  const where = {
    ...(action ? { action: containsCI(action) } : {}),
    ...(actorId ? { actorId } : {}),
    ...(search ? { OR: [{ target: containsCI(search) }, { detail: containsCI(search) }] } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, username: true, displayName: true } } },
    }),
  ]);
  res.json({ total, page, pageSize, items: items.map((item) => ({ ...item, detail: item.detail ? JSON.parse(item.detail) : null })) });
}));

router.get('/settings', asyncHandler(async (req, res) => {
  const parsed = z.object({ category: z.enum(['system', 'ai']).optional() }).safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const items = await prisma.systemSetting.findMany({ where: parsed.data, orderBy: [{ category: 'asc' }, { key: 'asc' }] });
  res.json({ settings: items.map((item) => ({ ...item, value: JSON.parse(item.value) })) });
}));

// 业务数据全量快照（数据迁移/备份用；仅管理员）。
// 用途：体验版云函数 /tmp SQLite 实例回收前抢救数据 → scripts/import-data.js 写入新库。
// 不含 contentDocuments（静态 JSON 的数据库副本，可从仓库重新导入）与 refreshTokens（登录态不可迁）。
router.get('/export', asyncHandler(async (_req, res) => {
  // 逐表独立查询：线上库可能因历史 init.sql 漂移缺表（如 SystemSetting），单表失败不应拖垮整体导出
  const queries: [string, () => Promise<unknown[]>][] = [
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
  const tables: Record<string, unknown[]> = {};
  const errors: Record<string, string> = {};
  for (const [key, fn] of queries) {
    try {
      tables[key] = await fn();
    } catch (e) {
      tables[key] = [];
      errors[key] = String((e as Error).message || e).slice(0, 200);
    }
  }
  const counts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]));
  res.json({ exportedAt: new Date().toISOString(), counts, errors, tables });
}));

const settingSchema = z.object({
  value: z.unknown(),
  category: z.enum(['system', 'ai']).default('system'),
  isSecret: z.boolean().default(false),
  description: z.string().max(500).nullable().optional(),
});

router.put('/settings/:key', asyncHandler(async (req: AuthedRequest, res) => {
  const key = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.-]{1,99}$/).safeParse(req.params.key);
  const parsed = settingSchema.safeParse(req.body);
  if (!key.success) throw badRequest('设置键格式无效');
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const setting = await prisma.systemSetting.upsert({
    where: { key: key.data },
    create: { key: key.data, category: parsed.data.category, value: JSON.stringify(parsed.data.value), isSecret: parsed.data.isSecret, description: parsed.data.description },
    update: { category: parsed.data.category, value: JSON.stringify(parsed.data.value), isSecret: parsed.data.isSecret, description: parsed.data.description },
  });
  await writeAudit(req.user!.sub, 'setting.update', key.data, { category: setting.category, isSecret: setting.isSecret }, req.ip);
  res.json({ ...setting, value: JSON.parse(setting.value) });
}));

// 批量更新多个设置项（前端设置页一次保存全部配置）
router.put('/settings', asyncHandler(async (req: AuthedRequest, res) => {
  const body = req.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw badRequest('请求体必须是键值对象');
  const entries = Object.entries(body).filter(([, v]) => v !== undefined);
  for (const [key, value] of entries) {
    const k = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.-]{1,99}$/).safeParse(key);
    if (!k.success) throw badRequest(`设置键 ${key} 格式无效`);
    const category = key.startsWith('ai') ? 'ai' : 'system';
    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, category, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value), category },
    });
  }
  await writeAudit(req.user!.sub, 'setting.bulkUpdate', null, { keys: entries.map(([k]) => k) }, req.ip);
  res.json({ ok: true, updated: entries.length });
}));

export default router;
