// JWT 鉴权中间件：解析 Authorization: Bearer <token>，附加 req.user。
import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { unauthorized } from './error';

export function authRequired(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    next(unauthorized());
    return;
  }
  try {
    req.user = verifyAccessToken(match[1]);
    next();
  } catch (e) {
    next(unauthorized());
  }
}
