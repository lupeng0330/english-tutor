const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const ACCESS_KEY = 'yxyy_admin_access';
const REFRESH_KEY = 'yxyy_admin_refresh';
let refreshing: Promise<string | null> | null = null;

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); }
}

export const tokens = {
  get access() { return localStorage.getItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set(access: string, refresh?: string) { localStorage.setItem(ACCESS_KEY, access); if (refresh) localStorage.setItem(REFRESH_KEY, refresh); },
  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); },
};

async function refreshAccess(): Promise<string | null> {
  if (!tokens.refresh) return null;
  if (!refreshing) refreshing = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refresh }),
  }).then(async (res) => {
    if (!res.ok) throw new Error('登录已过期');
    const data = await res.json();
    const access = data.accessToken || data.data?.accessToken;
    if (!access) throw new Error('刷新令牌失败');
    tokens.set(access); return access as string;
  }).catch(() => { tokens.clear(); return null; }).finally(() => { refreshing = null; });
  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (tokens.access) headers.set('Authorization', `Bearer ${tokens.access}`);
  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers });
  if (response.status === 401 && retry && !path.includes('/auth/refresh')) {
    const access = await refreshAccess();
    if (access) return request<T>(path, init, false);
    window.dispatchEvent(new Event('auth:expired'));
  }
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const obj = payload as Record<string, unknown> | null;
    throw new ApiError(response.status, String(obj?.message || obj?.error || `请求失败 (${response.status})`), payload);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const query = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value !== undefined && value !== '' && sp.set(key, String(value)));
  const value = sp.toString(); return value ? `?${value}` : '';
};
