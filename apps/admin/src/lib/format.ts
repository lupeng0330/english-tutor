export const money = (cents = 0) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(cents / 100);
export const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export const shortDate = (value?: string | null) => value ? new Intl.DateTimeFormat('zh-CN').format(new Date(value)) : '—';
export const roleName = (role?: string) => ({ admin: '管理员', teacher: '教师', student: '学生' }[role || ''] || role || '未知');
