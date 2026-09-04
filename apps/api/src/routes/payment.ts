// 支付回调路由（Phase P0 骨架）。
// 真实渠道（微信/支付宝/IAP）接入时在此实现验签 + 防重放 + 置 paid 回调闭环；
// 本期所有非 manual 渠道统一 501，路由结构先行固化。
import { Router } from 'express';
import { asyncHandler, badRequest, ApiError } from '../middleware/error';
import { CHANNELS, isPaymentChannel } from '../services/payment';

const router = Router();

// 已注册渠道清单（含实现状态），供后台/联调自查
router.get('/channels', (_req, res) => {
  res.json({ channels: CHANNELS });
});

// 支付结果异步回调桩：验签逻辑随各渠道 Provider 一并实现（Phase P）
router.post('/callback/:channel', asyncHandler(async (req, res) => {
  const channel = req.params.channel;
  if (!isPaymentChannel(channel)) throw badRequest(`未知支付渠道: ${channel}`);
  // TODO(Phase P): 调 getProvider(channel).handleCallback(req.body, signature)，
  // 验签通过后写 payment_logs（防重放：externalTxnId 唯一校验）再置订单 paid。
  throw new ApiError(501, 'PAYMENT_NOT_IMPLEMENTED', `支付渠道 ${channel} 回调尚未接入`);
}));

export default router;
