// 统一错误处理 + 业务错误类型。
import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (msg: string) => new ApiError(400, 'BAD_REQUEST', msg);
export const unauthorized = (msg = '未登录或登录已过期') => new ApiError(401, 'UNAUTHORIZED', msg);
export const forbidden = (msg = '无权限') => new ApiError(403, 'FORBIDDEN', msg);
export const notFound = (msg = '资源不存在') => new ApiError(404, 'NOT_FOUND', msg);
export const conflict = (msg: string) => new ApiError(409, 'CONFLICT', msg);

// 包装异步路由，自动捕获异常转交 errorHandler
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({ error: { code: 'INTERNAL', message: '服务器内部错误' } });
}
