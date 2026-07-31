import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db';
import { asyncHandler, badRequest, notFound } from '../../middleware/error';
import { AuthedRequest } from '../../types';
import { writeAudit } from '../../services/audit';
import { fulfillPlanForUser } from '../../services/membership';

const router = Router();
const pagination = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  status: z.string().max(30).optional(),
});

router.get('/membership/overview', asyncHandler(async (_req, res) => {
  const now = new Date();
  const [users, activeSubscriptions, lifetimeSubscriptions, itemPurchases, paidRevenue, plans] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    prisma.subscription.count({ where: { status: 'active', expiresAt: null } }),
    prisma.itemPurchase.count(),
    prisma.order.aggregate({ where: { status: 'paid' }, _sum: { amountCents: true }, _count: true }),
    prisma.membershipPlan.findMany({
      include: { planEntitlements: { include: { entitlement: true } }, _count: { select: { subscriptions: true, itemPurchases: true, orders: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);
  res.json({
    users, activeSubscriptions, lifetimeSubscriptions, itemPurchases,
    paidOrders: paidRevenue._count, revenueCents: paidRevenue._sum.amountCents || 0, plans,
  });
}));

router.get('/membership/users', asyncHandler(async (req, res) => {
  const parsed = pagination.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const { page, pageSize, search, status } = parsed.data;
  const where = {
    ...(search ? { OR: [{ username: { contains: search } }, { displayName: { contains: search } }, { email: { contains: search } }] } : {}),
    ...(status ? { subscriptions: { some: { status } } } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, displayName: true, email: true, status: true, createdAt: true,
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        itemPurchases: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        _count: { select: { orders: true, userEntitlements: true } },
      },
    }),
  ]);
  res.json({ total, page, pageSize, items });
}));

router.get('/orders', asyncHandler(async (req, res) => {
  const parsed = pagination.extend({ channel: z.string().max(30).optional() }).safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const { page, pageSize, search, status, channel } = parsed.data;
  const where = {
    ...(status ? { status } : {}), ...(channel ? { channel } : {}),
    ...(search ? { OR: [{ id: { contains: search } }, { externalTxnId: { contains: search } }, { user: { username: { contains: search } } }] } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, username: true, displayName: true } }, plan: true } }),
  ]);
  res.json({ total, page, pageSize, items });
}));

// 待支付订单：确认收款并自动开通对应套餐
const orderConfirmSchema = z.object({
  externalTxnId: z.string().max(100).optional(),
  itemRef: z.string().max(200).optional(),
  remark: z.string().max(200).optional(),
});

router.post('/orders/:id/confirm', asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = orderConfirmSchema.safeParse(req.body || {});
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { plan: true } });
  if (!order) throw notFound('订单不存在');
  if (order.status !== 'pending') throw badRequest('仅待支付订单可确认');
  if (!order.plan) throw badRequest('订单未关联套餐，无法自动开通');

  // itemRef 优先取请求参数，其次从订单备注 itemRef=xxx 中解析
  const itemRef = parsed.data.itemRef || (order.remark?.match(/itemRef=([^|]+)/)?.[1] || '').trim() || null;
  if (order.plan.type === 'item' && !itemRef) throw badRequest('单项套餐需提供 itemRef');

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      externalTxnId: parsed.data.externalTxnId || order.externalTxnId,
      remark: parsed.data.remark ? `${order.remark || ''} | ${parsed.data.remark}` : order.remark,
    },
    include: { plan: true, user: { select: { id: true, username: true, displayName: true } } },
  });
  const granted = await fulfillPlanForUser({
    userId: order.userId,
    plan: order.plan,
    itemRef,
    orderId: order.id,
    source: 'manual',
  });
  await writeAudit(req.user!.sub, 'order.confirm', order.id, { planCode: order.plan.code, itemRef, granted }, req.ip);
  res.json({ order: updated, granted });
}));

router.post('/orders/:id/cancel', asyncHandler(async (req: AuthedRequest, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw notFound('订单不存在');
  if (order.status !== 'pending') throw badRequest('仅待支付订单可关闭');
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'canceled', remark: req.body?.reason ? `${order.remark || ''} | ${String(req.body.reason).slice(0, 200)}` : order.remark },
    include: { plan: true, user: { select: { id: true, username: true, displayName: true } } },
  });
  await writeAudit(req.user!.sub, 'order.cancel', order.id, { reason: req.body?.reason }, req.ip);
  res.json({ order: updated });
}));

const subscriptionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().max(200).optional() }),
  z.object({ action: z.literal('extend'), days: z.number().int().min(1).max(3650) }),
]);

router.patch('/subscriptions/:id', asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = subscriptionSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const subscription = await prisma.subscription.findUnique({ where: { id: req.params.id } });
  if (!subscription) throw notFound('订阅不存在');
  let data: { status?: string; autoRenew?: boolean; expiresAt?: Date };
  if (parsed.data.action === 'cancel') {
    data = { status: 'canceled', autoRenew: false };
  } else {
    if (!subscription.expiresAt) throw badRequest('永久会员无需延期');
    const base = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
    const expiresAt = new Date(base);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + parsed.data.days);
    data = { status: 'active', expiresAt };
  }
  const updated = await prisma.subscription.update({ where: { id: subscription.id }, data });
  await writeAudit(req.user!.sub, `subscription.${parsed.data.action}`, subscription.id, parsed.data, req.ip);
  res.json(updated);
}));

const planUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['subscription', 'lifetime', 'item']).optional(),
  durationDays: z.number().int().positive().nullable().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  status: z.enum(['active', 'archived']).optional(),
  remark: z.string().max(500).nullable().optional(),
  entitlements: z.array(z.object({ code: z.string().min(1), scope: z.record(z.unknown()).nullable().optional() })).max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, '没有可更新字段');

router.put('/plans/:id', asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = planUpdateSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const plan = await prisma.membershipPlan.findUnique({ where: { id: req.params.id } });
  if (!plan) throw notFound('套餐不存在');
  const { entitlements, ...fields } = parsed.data;
  const updated = await prisma.$transaction(async (tx) => {
    await tx.membershipPlan.update({ where: { id: plan.id }, data: fields });
    if (entitlements) {
      const definitions = await tx.entitlement.findMany({ where: { code: { in: entitlements.map((item) => item.code) } } });
      if (definitions.length !== new Set(entitlements.map((item) => item.code)).size) throw badRequest('包含不存在的权益代码');
      await tx.planEntitlement.deleteMany({ where: { planId: plan.id } });
      if (definitions.length) await tx.planEntitlement.createMany({
        data: definitions.map((definition) => {
          const binding = entitlements.find((item) => item.code === definition.code)!;
          return { planId: plan.id, entitlementId: definition.id, scope: binding.scope ? JSON.stringify(binding.scope) : null };
        }),
      });
    }
    return tx.membershipPlan.findUnique({ where: { id: plan.id }, include: { planEntitlements: { include: { entitlement: true } } } });
  });
  await writeAudit(req.user!.sub, 'plan.update', plan.id, parsed.data, req.ip);
  res.json(updated);
}));

export default router;
