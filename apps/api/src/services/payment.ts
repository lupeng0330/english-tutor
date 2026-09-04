// 支付渠道适配层（Phase P0 骨架）。
// 设计目标：真实支付（微信/支付宝/Apple IAP/Google Play）接入时只新增 Provider 实现，
// 不改订单状态机与开通逻辑。首期唯一可用渠道是 manual（后台手动确认收款）。
//
// 订单状态机：pending → paid | canceled；paid → refunded（预留，本期无写入方）。
import { Order, MembershipPlan } from '@prisma/client';
import { prisma } from '../db';
import { badRequest, notFound, ApiError } from '../middleware/error';
import { fulfillPlanForUser } from './membership';

export type PaymentChannel = 'manual' | 'wechat' | 'alipay' | 'apple_iap' | 'google_play';

export interface ConfirmPaidInput {
  orderId: string;
  externalTxnId?: string;
  itemRef?: string;
  remark?: string;
}

export interface ConfirmPaidResult {
  order: Order & { plan: MembershipPlan | null; user: { id: string; username: string; displayName: string | null } };
  granted: { kind: 'subscription' | 'item'; id: string };
  itemRef: string | null;
}

export interface PaymentProvider {
  readonly channel: PaymentChannel;
  /** 确认收款：置订单 paid + 自动开通套餐。Manual 即后台「确认收款」按钮。 */
  confirmPaid(input: ConfirmPaidInput): Promise<ConfirmPaidResult>;
  /** 真实渠道异步回调（验签 + 防重放 + 置 paid）。本期一律 501。 */
  handleCallback?(payload: unknown, signature?: string): Promise<void>;
}

// ---------- ManualProvider：手动收款（现有行为原样迁入，契约不变） ----------

class ManualProvider implements PaymentProvider {
  readonly channel = 'manual' as const;

  async confirmPaid(input: ConfirmPaidInput): Promise<ConfirmPaidResult> {
    const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { plan: true } });
    if (!order) throw notFound('订单不存在');
    if (order.status !== 'pending') throw badRequest('仅待支付订单可确认');
    if (!order.plan) throw badRequest('订单未关联套餐，无法自动开通');

    // itemRef 优先取请求参数，其次从订单备注 itemRef=xxx 中解析
    const itemRef = input.itemRef || (order.remark?.match(/itemRef=([^|]+)/)?.[1] || '').trim() || null;
    if (order.plan.type === 'item' && !itemRef) throw badRequest('单项套餐需提供 itemRef');

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        externalTxnId: input.externalTxnId || order.externalTxnId,
        remark: input.remark ? `${order.remark || ''} | ${input.remark}` : order.remark,
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
    return { order: updated, granted, itemRef };
  }
}

// ---------- 渠道注册表 ----------

const providers: Partial<Record<PaymentChannel, PaymentProvider>> = {
  manual: new ManualProvider(),
  // TODO(Phase P): wechat / alipay / apple_iap / google_play 在此注册真实实现
};

export const CHANNELS: { channel: PaymentChannel; implemented: boolean }[] = [
  { channel: 'manual', implemented: true },
  { channel: 'wechat', implemented: false },
  { channel: 'alipay', implemented: false },
  { channel: 'apple_iap', implemented: false },
  { channel: 'google_play', implemented: false },
];

export function isPaymentChannel(v: string): v is PaymentChannel {
  return CHANNELS.some((c) => c.channel === v);
}

export function getProvider(channel: PaymentChannel): PaymentProvider {
  const p = providers[channel];
  if (!p) throw new ApiError(501, 'PAYMENT_NOT_IMPLEMENTED', `支付渠道 ${channel} 尚未接入（当前仅支持 manual 手动收款）`);
  return p;
}

// ---------- 回调流水（防重放/对账预留） ----------

export async function writePaymentLog(params: {
  orderId: string;
  channel: string;
  rawPayload: unknown;
  status: string;
}): Promise<void> {
  try {
    await prisma.paymentLog.create({
      data: {
        orderId: params.orderId,
        channel: params.channel,
        rawPayload: JSON.stringify(params.rawPayload ?? null),
        status: params.status,
      },
    });
  } catch (e) {
    console.error('[payment] writePaymentLog failed:', e);
  }
}
