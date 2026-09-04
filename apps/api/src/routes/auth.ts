// 认证路由：注册 / 登录 / 刷新 token / 登出 / 当前用户。
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { asyncHandler, badRequest, conflict, unauthorized } from '../middleware/error';
import { authRequired } from '../middleware/auth';
import { AuthedRequest, JwtPayload, Role } from '../types';
import { config } from '../config';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(64),
  email: z.string().email().optional(),
  displayName: z.string().max(64).optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function refreshExpiryDate(): Date {
  // 与 JWT refresh 过期粗略对齐（30d）；用于 DB 存储过期时间
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

// 注册（默认 student 角色）
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { username, password, email, displayName } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) throw conflict('用户名已存在');

    const user = await prisma.user.create({
      data: {
        username,
        email,
        displayName: displayName || username,
        passwordHash: await hashPassword(password),
        role: 'student',
      },
    });

    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  })
);

// 登录
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('用户名或密码格式错误');
    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.status !== 'active') throw unauthorized('用户名或密码错误');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw unauthorized('用户名或密码错误');

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role as Role,
      username: user.username,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: refreshExpiryDate() },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
    });
  })
);

// 刷新 access token
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.body?.refreshToken as string) || '';
    if (!token) throw badRequest('缺少 refreshToken');

    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.revoked || record.expiresAt.getTime() < Date.now()) {
      throw unauthorized('refreshToken 无效或已过期');
    }
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw unauthorized('refreshToken 无效');
    }
    const accessToken = signAccessToken({
      sub: payload.sub,
      role: payload.role,
      username: payload.username,
    });
    res.json({ accessToken });
  })
);

// 登出（吊销 refreshToken）
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = (req.body?.refreshToken as string) || '';
    if (token) {
      await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
    }
    res.json({ ok: true });
  })
);

// 当前用户
router.get(
  '/me',
  authRequired,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, username: true, email: true, role: true, displayName: true, status: true, lastLoginAt: true },
    });
    res.json({ user });
  })
);

export default router;
