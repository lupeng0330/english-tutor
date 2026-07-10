// 用户与班级管理路由（管理员 / 教师）。
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { hashPassword } from '../utils/password';
import { authRequired } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { asyncHandler, badRequest, conflict, notFound } from '../middleware/error';
import { AuthedRequest, Role } from '../types';
import { writeAudit } from '../services/audit';

const router = Router();

router.use(authRequired);

// 用户列表（管理员）：分页 + 角色筛选
router.get(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt((req.query.pageSize as string) || '20', 10)));
    const role = req.query.role as string | undefined;
    const where = role ? { role } : {};

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, role: true, displayName: true, status: true, lastLoginAt: true, createdAt: true },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  })
);

// 创建用户（管理员可指定角色）
const createUserSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(64),
  role: z.enum(['admin', 'teacher', 'student']),
  email: z.string().email().optional(),
  displayName: z.string().max(64).optional(),
});
router.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { username, password, role, email, displayName } = parsed.data;
    if (await prisma.user.findUnique({ where: { username } })) throw conflict('用户名已存在');

    const user = await prisma.user.create({
      data: {
        username,
        email,
        role: role as Role,
        displayName: displayName || username,
        passwordHash: await hashPassword(password),
      },
      select: { id: true, username: true, role: true },
    });
    await writeAudit(req.user!.sub, 'user.create', user.id, { role });
    res.status(201).json(user);
  })
);

// 启用/禁用用户
router.patch(
  '/:id/status',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const status = req.body?.status;
    if (status !== 'active' && status !== 'disabled') throw badRequest('status 必须为 active|disabled');
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw notFound('用户不存在');
    await prisma.user.update({ where: { id: user.id }, data: { status } });
    await writeAudit(req.user!.sub, 'user.status', user.id, { status });
    res.json({ ok: true });
  })
);

// —— 班级 ——

// 创建班级（教师/管理员）
router.post(
  '/classes',
  requireRole('admin', 'teacher'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const name = (req.body?.name as string || '').trim();
    if (!name) throw badRequest('班级名不能为空');
    const teacherId = req.user!.role === 'teacher' ? req.user!.sub : (req.body?.teacherId as string);
    if (!teacherId) throw badRequest('缺少 teacherId');
    const cls = await prisma.class.create({ data: { name, teacherId } });
    res.status(201).json(cls);
  })
);

// 班级加入学生
router.post(
  '/classes/:id/members',
  requireRole('admin', 'teacher'),
  asyncHandler(async (req, res) => {
    const studentId = req.body?.studentId as string;
    if (!studentId) throw badRequest('缺少 studentId');
    const cls = await prisma.class.findUnique({ where: { id: req.params.id } });
    if (!cls) throw notFound('班级不存在');
    const member = await prisma.classMember.create({
      data: { classId: cls.id, studentId },
    });
    res.status(201).json(member);
  })
);

export default router;
