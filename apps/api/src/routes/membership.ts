// 会员与权益路由：
//   - GET  /me/entitlements      当前用户有效权益（前端门控用）
//   - GET  /plans                套餐列表
//   - POST /admin/plans          创建套餐（管理员）
//   - GET  /entitlements         权益点列表
//   - POST /admin/entitlements   创建权益点（管理员）
//   - POST /admin/grant          后台手动开通/授予会员（管理员，首期支付方式）
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authRequired } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { asyncHandler, badRequest, notFound } from '../middleware/error';
import { AuthedRequest } from '../types';
import { computeEffectiveEntitlements } from '../services/membership';
import { writeAudit } from '../services/audit';

const router = Router();
router.use(authRequired);

// 当前用户有效权益（供前端 entitlement.js 门控）
router.get(
  '/me/entitlements',
  asyncHandler(async (req: AuthedRequest, res) => {
    const ents = await computeEffectiveEntitlements(req.user!.sub);
    res.json({ entitlements: ents, isAdmin: req.user!.role === 'admin' });
  })
);

// 套餐列表
router.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    const plans = await prisma.membershipPlan.findMany({
      where: { status: 'active' },
      include: { planEntitlements: { include: { entitlement: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ plans });
  })
);

// 权益点列表
router.get(
  '/entitlements',
  asyncHandler(async (_req, res) => {
    const items = await prisma.entitlement.findMany({ orderBy: { category: 'asc' } });
    res.json({ entitlements: items });
  })
);

// —— 管理员：创建套餐 ——
const planSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['subscription', 'lifetime', 'item']),
  durationDays: z.number().int().positive().optional(),
  priceCents: z.number().int().nonnegative().default(0),
  entitlementCodes: z.array(z.string()).optional(),
});
router.post(
  '/admin/plans',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { code, name, type, durationDays, priceCents, entitlementCodes } = parsed.data;

    const plan = await prisma.membershipPlan.create({
      data: { code, name, type, durationDays, priceCents },
    });

    if (entitlementCodes?.length) {
      const ents = await prisma.entitlement.findMany({ where: { code: { in: entitlementCodes } } });
      await prisma.planEntitlement.createMany({
        data: ents.map((e) => ({ planId: plan.id, entitlementId: e.id })),
      });
    }
    await writeAudit(req.user!.sub, 'plan.create', plan.id, { code, type });
    res.status(201).json(plan);
  })
);

// —— 管理员：创建权益点 ——
router.post(
  '/admin/entitlements',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const code = (req.body?.code as string || '').trim();
    const name = (req.body?.name as string || '').trim();
    const category = (req.body?.category as string || 'feature').trim();
    if (!code || !name) throw badRequest('code 与 name 必填');
    const ent = await prisma.entitlement.create({ data: { code, name, category } });
    await writeAudit(req.user!.sub, 'entitlement.create', ent.id, { code });
    res.status(201).json(ent);
  })
);

// —— 管理员：手动开通会员（首期支付方式）——
// 支持三种：订阅(subscription,按 durationDays 计到期) / 买断(lifetime,永久) / 单项(item,绑 itemRef)
const grantSchema = z.object({
  userId: z.string(),
  planCode: z.string(),
  itemRef: z.string().optional(), // type=item 时绑定内容
  remark: z.string().optional(),
});
router.post(
  '/admin/grant',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = grantSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { userId, planCode, itemRef, remark } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound('用户不存在');
    const plan = await prisma.membershipPlan.findUnique({ where: { code: planCode } });
    if (!plan) throw notFound('套餐不存在');

    // 生成内部订单（渠道 manual）
    const order = await prisma.order.create({
      data: {
        userId,
        planId: plan.id,
        amountCents: plan.priceCents,
        channel: 'manual',
        status: 'paid',
        remark: remark || '后台手动开通',
      },
    });

    if (plan.type === 'item') {
      if (!itemRef) throw badRequest('单项套餐需提供 itemRef');
      await prisma.itemPurchase.create({
        data: { userId, planId: plan.id, itemRef, orderId: order.id },
      });
    } else {
      // subscription / lifetime → 建订阅
      let expiresAt: Date | null = null;
      if (plan.type === 'subscription' && plan.durationDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
      }
      await prisma.subscription.create({
        data: { userId, planId: plan.id, expiresAt, status: 'active', source: 'manual' },
      });
    }

    await writeAudit(req.user!.sub, 'membership.grant', userId, { planCode, itemRef, orderId: order.id });
    const ents = await computeEffectiveEntitlements(userId);
    res.status(201).json({ ok: true, orderId: order.id, entitlements: ents });
  })
);

export default router;
