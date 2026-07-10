// 角色权限中间件：限制某路由只允许指定角色访问。
import { Response, NextFunction } from 'express';
import { AuthedRequest, Role } from '../types';
import { forbidden, unauthorized } from './error';

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden(`需要角色：${roles.join('/')}`));
      return;
    }
    next();
  };
}
