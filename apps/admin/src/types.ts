export type Role = 'admin' | 'teacher' | 'student';
export type Status = 'active' | 'disabled' | 'draft' | 'archived' | string;

export interface AdminUser {
  id: string; username: string; displayName?: string; email?: string;
  role: Role; status: Status; lastLoginAt?: string; createdAt?: string;
}
export interface AuthResponse { accessToken: string; refreshToken: string; user: AdminUser }
export interface PageResult<T> { items: T[]; total: number; page?: number; pageSize?: number }
export interface DashboardData {
  users?: number; activeUsers?: number; classes?: number; activeMembers?: number; paidOrders?: number;
  contentDocuments?: number; draftDocuments?: number; audit24h?: number;
  questions?: number; exams?: number; todayActive?: number;
  revenueCents?: number; revenue?: number;
  trend?: Array<{ date: string; users: number; revenue: number }>;
  recentActivities?: Array<{ id?: string; action: string; actor?: string; createdAt: string }>;
}
export interface ContentItem {
  id: string; title: string; type?: string; category?: string; status: Status;
  level?: string; updatedAt?: string; createdAt?: string; description?: string;
}
export interface Question {
  id: string; stem?: string; content?: string; type: string; difficulty?: string;
  category?: string; answer?: string; options?: string[]; status?: Status; updatedAt?: string;
}
export interface Exam {
  id: string; title: string; status: Status; questionCount?: number;
  durationMinutes?: number; totalScore?: number; createdAt?: string;
}
export interface Plan {
  id: string; code: string; name: string; type: 'subscription' | 'lifetime' | 'item';
  durationDays?: number; priceCents: number; status?: Status;
  entitlementCodes?: string[]; planEntitlements?: Array<{ entitlement: Entitlement }>;
}
export interface Entitlement { id: string; code: string; name: string; category: string; description?: string }
export interface Membership {
  id: string; userId: string; username?: string; planName?: string; planCode?: string;
  status: Status; expiresAt?: string | null; createdAt?: string;
}
export interface Order {
  id: string; username?: string; planName?: string; amountCents: number;
  channel?: string; status: Status; createdAt?: string; remark?: string | null;
}
export interface AuditLog {
  id: string; action: string; actor?: string; actorId?: string; target?: string;
  detail?: Record<string, unknown>; ip?: string; createdAt: string;
}
export interface SystemSettings {
  aiProvider?: string; aiModel?: string; aiEnabled?: boolean; dailyLimit?: number;
  maintenanceMode?: boolean; registrationEnabled?: boolean; [key: string]: unknown;
}

export const asArray = <T>(data: unknown, keys: string[] = ['items']): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  for (const key of keys) if (Array.isArray(obj[key])) return obj[key] as T[];
  if (obj.data && typeof obj.data === 'object') return asArray<T>(obj.data, keys);
  return [];
};
export const asPage = <T>(data: unknown, keys: string[] = ['items']): PageResult<T> => {
  const obj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return { items: asArray<T>(data, keys), total: Number(obj.total ?? obj.count ?? asArray<T>(data, keys).length), page: Number(obj.page ?? 1), pageSize: Number(obj.pageSize ?? 20) };
};
