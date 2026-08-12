// 用户与班级管理路由（管理员 / 教师）。
import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { hashPassword } from '../utils/password';
import { containsCI } from '../utils/query';
import { authRequired } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { asyncHandler, badRequest, conflict, notFound } from '../middleware/error';
import { AuthedRequest, Role } from '../types';
import { writeAudit } from '../services/audit';

const router = Router();

router.use(authRequired);

// 用户列表（管理员）：分页 + 角色/状态/关键词筛选
router.get(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = z.object({
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
      role: z.enum(['admin', 'teacher', 'student']).optional(),
      status: z.enum(['active', 'disabled']).optional(),
      search: z.string().max(100).optional(),
    }).safeParse(req.query);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { page, pageSize, role, status, search } = parsed.data;
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ username: containsCI(search) }, { email: containsCI(search) }, { displayName: containsCI(search) }] } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, role: true, displayName: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true },
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
    await writeAudit(req.user!.sub, 'user.create', user.id, { role }, req.ip);
    res.status(201).json(user);
  })
);

// 启用/禁用用户
router.patch(
  '/:id/status',
  requireRole('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = z.object({ status: z.enum(['active', 'disabled']) }).safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const status = parsed.data.status;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw notFound('用户不存在');
    await prisma.user.update({ where: { id: user.id }, data: { status } });
    await writeAudit(req.user!.sub, 'user.status', user.id, { status }, req.ip);
    res.json({ ok: true });
  })
);

// —— 班级 ——

// 班级列表（管理员）
router.get(
  '/classes',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = z.object({
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
      teacherId: z.string().optional(),
      search: z.string().max(100).optional(),
    }).safeParse(req.query);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { page, pageSize, teacherId, search } = parsed.data;
    const where: Prisma.ClassWhereInput = {
      ...(teacherId ? { teacherId } : {}),
      ...(search ? { name: containsCI(search) } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { id: true, username: true, displayName: true } },
          members: { include: { student: { select: { id: true, username: true, displayName: true, status: true } } } },
        },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  })
);

// 用户详情（管理员）
router.get(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, username: true, email: true, role: true, displayName: true, status: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        userEntitlements: { include: { entitlement: true }, orderBy: { createdAt: 'desc' } },
        itemPurchases: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        orders: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        studentOf: { include: { class: { include: { teacher: { select: { id: true, username: true, displayName: true } } } } } },
        teachingClasses: { include: { _count: { select: { members: true } } } },
      },
    });
    if (!user) throw notFound('用户不存在');
    res.json(user);
  })
);

const classSchema = z.object({ name: z.string().trim().min(1).max(100), teacherId: z.string().optional() });

// 创建班级（教师/管理员）
router.post(
  '/classes',
  requireRole('admin', 'teacher'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = classSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const teacherId = req.user!.role === 'teacher' ? req.user!.sub : parsed.data.teacherId;
    if (!teacherId) throw badRequest('缺少 teacherId');
    const teacher = await prisma.user.findFirst({ where: { id: teacherId, role: 'teacher' } });
    if (!teacher) throw notFound('教师不存在');
    const cls = await prisma.class.create({ data: { name: parsed.data.name, teacherId } });
    await writeAudit(req.user!.sub, 'class.create', cls.id, { teacherId, name: cls.name }, req.ip);
    res.status(201).json(cls);
  })
);

// 班级加入学生
router.post(
  '/classes/:id/members',
  requireRole('admin', 'teacher'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = z.object({ studentId: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const cls = await prisma.class.findUnique({ where: { id: req.params.id } });
    if (!cls) throw notFound('班级不存在');
    if (req.user!.role === 'teacher' && cls.teacherId !== req.user!.sub) throw notFound('班级不存在');
    const student = await prisma.user.findFirst({ where: { id: parsed.data.studentId, role: 'student' } });
    if (!student) throw notFound('学生不存在');
    const member = await prisma.classMember.create({
      data: { classId: cls.id, studentId: student.id },
    });
    await writeAudit(req.user!.sub, 'class.member.add', cls.id, { studentId: student.id }, req.ip);
    res.status(201).json(member);
  })
);

export default router;
