// 共享类型定义。
import { Request } from 'express';

export type Role = 'admin' | 'teacher' | 'student';

export interface JwtPayload {
  sub: string; // userId
  role: Role;
  username: string;
}

// 鉴权后附加到 req.user
export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

// 有效权益项（合并计算后下发给前端）
export interface EffectiveEntitlement {
  code: string;
  category: string;
  scope?: Record<string, unknown> | null;
  expiresAt?: string | null;
}
