import { type ReactNode } from 'react';
import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui';

export function DataState({ loading, error, empty, onRetry, children }: { loading?: boolean; error?: string | null; empty?: boolean; onRetry?: () => void; children: ReactNode }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={onRetry} />;
  if (empty) return <EmptyState />;
  return <>{children}</>;
}

export function LoadingState({ label = '正在加载数据…' }: { label?: string }) { return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="animate-spin text-brand-600" /><span>{label}</span></div>; }
export function EmptyState({ title = '暂无数据', description = '当前筛选条件下没有可显示的内容。' }: { title?: string; description?: string }) { return <div className="flex min-h-48 flex-col items-center justify-center text-center"><span className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400"><Inbox /></span><h3 className="font-medium text-slate-800">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="flex min-h-48 flex-col items-center justify-center text-center"><span className="mb-3 rounded-full bg-red-50 p-3 text-red-500"><AlertCircle /></span><h3 className="font-medium text-slate-800">加载失败</h3><p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>{retry && <Button className="mt-4" variant="secondary" onClick={retry}><RefreshCw size={15} />重试</Button>}</div>; }
export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div>; }
