import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Bot, ChevronDown, ClipboardList, CreditCard, FileText, LayoutDashboard, LogOut, Menu, Package, Search, Settings, Users, X } from 'lucide-react';
import { IoSchoolOutline } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { to: '/', label: '总览仪表盘', icon: LayoutDashboard },
  { to: '/content', label: '内容管理', icon: BookOpen },
  { to: '/exams', label: '题库与考试', icon: ClipboardList },
  { to: '/users', label: '用户与权限', icon: Users },
  { to: '/membership', label: '会员与营收', icon: CreditCard },
  { to: '/plans', label: '套餐与权益', icon: Package },
  { to: '/settings', label: 'AI 与系统设置', icon: Bot },
  { to: '/audit', label: '审计日志', icon: FileText },
];
const pageNames: Record<string, string> = { '/': '总览仪表盘', '/content': '内容管理', '/exams': '题库与考试', '/users': '用户与权限', '/membership': '会员与营收', '/plans': '套餐与权益', '/settings': 'AI 与系统设置', '/audit': '审计日志' };

function Sidebar({ close }: { close?: () => void }) {
  return <div className="flex h-full flex-col bg-[#0b3262] text-white"><div className="flex h-16 items-center gap-3 border-b border-white/10 px-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sky-300"><IoSchoolOutline size={24} /></span><div><div className="font-bold tracking-wide">乐学英语</div><div className="text-[11px] text-slate-300">ADMIN CONSOLE</div></div></div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={close} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-white text-[#0b3262] shadow-sm' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav><div className="border-t border-white/10 p-4 text-xs text-slate-400"><div className="flex items-center gap-2"><Activity size={14} className="text-emerald-400" />系统运行正常</div><p className="mt-1">Phase 4 · v1.0</p></div></div>;
}

export function AppShell() {
  const [drawer, setDrawer] = useState(false); const [profile, setProfile] = useState(false);
  const { user, logout } = useAuth(); const navigate = useNavigate(); const { pathname } = useLocation();
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return <div className="min-h-screen bg-slate-50"><aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"><Sidebar /></aside>{drawer && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/50" onClick={() => setDrawer(false)} aria-label="关闭导航" /><aside className="relative h-full w-72 shadow-2xl"><button onClick={() => setDrawer(false)} className="absolute right-3 top-3 z-10 p-2 text-white"><X /></button><Sidebar close={() => setDrawer(false)} /></aside></div>}<div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><button onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="打开导航"><Menu /></button><div><p className="text-xs text-slate-400">管理后台</p><h1 className="text-sm font-semibold text-slate-800">{pageNames[pathname] || '管理中心'}</h1></div></div><div className="flex items-center gap-2"><button className="hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm text-slate-500 md:flex"><Search size={15} />搜索功能</button><div className="relative"><button onClick={() => setProfile(!profile)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">{(user?.displayName || user?.username || '管')[0]}</span><span className="hidden text-left sm:block"><span className="block text-xs font-semibold">{user?.displayName || user?.username}</span><span className="block text-[10px] text-slate-400">超级管理员</span></span><ChevronDown size={14} className="text-slate-400" /></button>{profile && <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-white p-1 shadow-soft"><button onClick={() => navigate('/settings')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"><Settings size={15} />系统设置</button><button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={15} />退出登录</button></div>}</div></div></header><main className="p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div>;
}
