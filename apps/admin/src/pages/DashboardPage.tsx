import { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, BookOpen, Crown, DollarSign, GraduationCap, Users } from 'lucide-react';
import { api } from '../lib/api';
import { DataState } from '../components/DataState';
import { DashboardData } from '../types';
import { money } from '../lib/format';

const DEMO_TREND = [
  { date: '周一', users: 12, revenue: 0 }, { date: '周二', users: 19, revenue: 0 },
  { date: '周三', users: 15, revenue: 0 }, { date: '周四', users: 27, revenue: 0 },
  { date: '周五', users: 33, revenue: 0 }, { date: '周六', users: 41, revenue: 0 },
  { date: '周日', users: 38, revenue: 0 },
];

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/admin/dashboard');
      setData(((r as { data?: DashboardData }).data) || (r as DashboardData));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const d = data || ({} as DashboardData);
    return [
      { label: '注册用户', value: d.users ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
      { label: '活跃会员', value: d.activeMembers ?? 0, icon: Crown, color: 'bg-emerald-50 text-emerald-600' },
      { label: '题库题目', value: d.questions ?? 0, icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
      { label: '考试模板', value: d.exams ?? 0, icon: GraduationCap, color: 'bg-amber-50 text-amber-600' },
      { label: '累计营收', value: money(d.revenueCents ?? 0), icon: DollarSign, color: 'bg-rose-50 text-rose-600' },
      { label: '今日活跃', value: d.todayActive ?? 0, icon: Activity, color: 'bg-cyan-50 text-cyan-600' },
    ];
  }, [data]);

  const trend = data?.trend && data.trend.length ? data.trend : DEMO_TREND;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">总览仪表盘</h1>
        <p className="mt-1 text-sm text-slate-500">平台运营数据实时概览</p>
      </div>
      <DataState loading={loading} error={error} empty={!data} onRetry={load}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{s.label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon size={18} />
                </span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-base font-medium text-slate-900">近 7 日新增用户</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-medium text-slate-900">最近操作</h2>
            <div className="space-y-3">
              {(data?.recentActivities && data.recentActivities.length ? data.recentActivities : []).map((a) => (
                <div key={a.id || a.createdAt} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-slate-700">{a.action}</div>
                    <div className="text-xs text-slate-400">{a.actor || '系统'} · {new Date(a.createdAt).toLocaleString('zh-CN')}</div>
                  </div>
                </div>
              ))}
              {(!data?.recentActivities || data.recentActivities.length === 0) && (
                <div className="text-sm text-slate-400">暂无操作记录</div>
              )}
            </div>
          </div>
        </div>
      </DataState>
    </div>
  );
}
