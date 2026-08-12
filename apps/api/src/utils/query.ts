// 跨库查询兼容工具。
import { config } from '../config';

/**
 * 大小写不敏感的 contains 过滤。
 * SQLite 的 contains 原生大小写不敏感且不支持 mode 参数（传了会报错）；
 * PostgreSQL 默认大小写敏感，需要显式 mode: 'insensitive' 才能保持一致的搜索体验。
 */
export function containsCI(value: string): { contains: string; mode?: 'insensitive' } {
  return config.db.isPg ? { contains: value, mode: 'insensitive' } : { contains: value };
}
