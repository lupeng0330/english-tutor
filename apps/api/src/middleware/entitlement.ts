// 权益校验中间件（Phase 2 骨架，Phase 5 接入受限资源）。
// 用法：requireEntitlement('ai_chat') 保护某条 API。
// admin 默认放行所有权益（便于后台/测试）。
import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../types';
import { forbidden, unauthorized } from './error';
import { computeEffectiveEntitlements } from '../services/membership';

export function requireEntitlement(code: string) {
  return async (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (req.user.role === 'admin') {
      next();
      return;
    }
    try {
      const ents = await computeEffectiveEntitlements(req.user.sub);
      if (ents.some((e) => e.code === code)) {
        next();
        return;
      }
      next(forbidden(`该功能需要开通会员权益：${code}`));
    } catch (e) {
      next(e);
    }
  };
}
