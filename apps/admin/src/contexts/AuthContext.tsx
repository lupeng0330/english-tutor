import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokens } from '../lib/api';
import type { AdminUser, AuthResponse } from '../types';

interface AuthValue { user: AdminUser | null; loading: boolean; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(Boolean(tokens.access));
  useEffect(() => {
    if (!tokens.access) return;
    api.get<{ user?: AdminUser; data?: { user?: AdminUser } }>('/auth/me').then((res) => setUser(res.user || res.data?.user || null)).catch(() => tokens.clear()).finally(() => setLoading(false));
  }, []);
  useEffect(() => { const expire = () => { setUser(null); tokens.clear(); }; window.addEventListener('auth:expired', expire); return () => window.removeEventListener('auth:expired', expire); }, []);
  const login = async (username: string, password: string) => {
    const result = await api.post<AuthResponse & { data?: AuthResponse }>('/auth/login', { username, password });
    const auth = result.data || result; tokens.set(auth.accessToken, auth.refreshToken); setUser(auth.user);
  };
  const logout = async () => { try { await api.post('/auth/logout', { refreshToken: tokens.refresh }); } finally { tokens.clear(); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; }
