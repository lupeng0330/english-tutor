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
