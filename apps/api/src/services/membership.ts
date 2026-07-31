// 会员权益服务：合并计算用户【有效权益集合】。
// 来源合并优先级（并集）：
//   1) 有效订阅(subscription: status=active 且未过期或永久) → 展开其套餐绑定的权益点
//   2) 单项购买(item_purchase) → 对应套餐的权益点（带 itemRef 范围）
//   3) 后台手动授予(user_entitlement: source=manual，未过期)
// 返回去重后的 EffectiveEntitlement[]。
import { prisma } from '../db';
import { EffectiveEntitlement } from '../types';

function parseScope(scope: string | null | undefined): Record<string, unknown> | null {
  if (!scope) return null;
  try {
    return JSON.parse(scope);
  } catch {
    return null;
  }
}

function notExpired(expiresAt: Date | null | undefined): boolean {
  return !expiresAt || expiresAt.getTime() > Date.now();
}

// 按套餐类型为用户开通：subscription→按 durationDays 计到期；lifetime→永久订阅；item→单项购买
// 供「后台手动开通」与「订单确认收款后自动开通」复用
export async function fulfillPlanForUser(params: {
  userId: string;
  plan: { id: string; type: string; durationDays: number | null };
  itemRef?: string | null;
  orderId?: string | null;
  source?: string;
}): Promise<{ kind: 'subscription' | 'item'; id: string }> {
  const { userId, plan, itemRef, orderId } = params;
  const source = params.source || 'manual';

  if (plan.type === 'item') {
    if (!itemRef) throw new Error('单项套餐需提供 itemRef');
    const rec = await prisma.itemPurchase.create({
      data: { userId, planId: plan.id, itemRef, orderId: orderId || null },
    });
    return { kind: 'item', id: rec.id };
  }

  let expiresAt: Date | null = null;
  if (plan.type === 'subscription' && plan.durationDays) {
    // 续费叠加：若已有同套餐未过期订阅，从原到期时间往后顺延
    const existing = await prisma.subscription.findFirst({
      where: { userId, planId: plan.id, status: 'active' },
      orderBy: { expiresAt: 'desc' },
    });
    const base =
      existing?.expiresAt && existing.expiresAt.getTime() > Date.now()
        ? new Date(existing.expiresAt)
        : new Date();
    base.setDate(base.getDate() + plan.durationDays);
    expiresAt = base;
  }

  const sub = await prisma.subscription.create({
    data: { userId, planId: plan.id, expiresAt, status: 'active', source },
  });
  return { kind: 'subscription', id: sub.id };
}

export async function computeEffectiveEntitlements(
  userId: string
): Promise<EffectiveEntitlement[]> {
  // 用 Map 去重（同 code 合并；scope 以最先出现为准，可后续做更细合并）
  const result = new Map<string, EffectiveEntitlement>();

  const add = (
    code: string,
    category: string,
    scope: Record<string, unknown> | null,
    expiresAt: Date | null | undefined
  ) => {
    if (!result.has(code)) {
      result.set(code, {
        code,
        category,
        scope,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      });
    }
  };

  // 1) 有效订阅 → 套餐权益
  const subs = await prisma.subscription.findMany({
    where: { userId, status: 'active' },
    include: {
      plan: {
        include: { planEntitlements: { include: { entitlement: true } } },
      },
    },
  });
  for (const sub of subs) {
    if (!notExpired(sub.expiresAt)) continue;
    for (const pe of sub.plan.planEntitlements) {
      add(pe.entitlement.code, pe.entitlement.category, parseScope(pe.scope), sub.expiresAt);
    }
  }

  // 2) 单项购买 → 套餐权益（附带 itemRef 范围）
  const items = await prisma.itemPurchase.findMany({
    where: { userId },
    include: {
      plan: { include: { planEntitlements: { include: { entitlement: true } } } },
    },
  });
  for (const it of items) {
    for (const pe of it.plan.planEntitlements) {
      const scope = parseScope(pe.scope) || {};
      scope.itemRef = it.itemRef;
      add(pe.entitlement.code, pe.entitlement.category, scope, null);
    }
  }

  // 3) 后台手动授予
  const manual = await prisma.userEntitlement.findMany({
    where: { userId },
    include: { entitlement: true },
  });
  for (const ue of manual) {
    if (!notExpired(ue.expiresAt)) continue;
    add(ue.entitlement.code, ue.entitlement.category, parseScope(ue.scope), ue.expiresAt);
  }

  return Array.from(result.values());
}
