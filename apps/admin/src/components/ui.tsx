import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { X } from 'lucide-react';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' }) {
  const variants = { primary: 'bg-brand-600 text-white hover:bg-brand-700', secondary: 'border bg-white text-slate-700 hover:bg-slate-50', danger: 'bg-red-600 text-white hover:bg-red-700', ghost: 'text-slate-600 hover:bg-slate-100' };
  return <button className={cx('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50', size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm', variants[variant], className)} {...props} />;
}
export function Card({ children, className }: { children: ReactNode; className?: string }) { return <section className={cx('rounded-xl border bg-white shadow-sm', className)}>{children}</section>; }
export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="flex items-start justify-between gap-4 border-b px-5 py-4"><div><h2 className="font-semibold text-slate-900">{title}</h2>{description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}</div>{action}</div>; }
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cx('h-10 w-full rounded-lg border bg-white px-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100', className)} {...props} />);
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => <select ref={ref} className={cx('h-10 w-full rounded-lg border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100', className)} {...props} />);
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cx('min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100', className)} {...props} />);

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'green' | 'blue' | 'amber' | 'red' | 'slate' }) {
  const tones = { green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', blue: 'bg-blue-50 text-blue-700 ring-blue-600/20', amber: 'bg-amber-50 text-amber-700 ring-amber-600/20', red: 'bg-red-50 text-red-700 ring-red-600/20', slate: 'bg-slate-100 text-slate-600 ring-slate-500/20' };
  return <span className={cx('inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset', tones[tone])}>{children}</span>;
}
export function StatusBadge({ status = 'unknown' }: { status?: string }) {
  const map: Record<string, [string, 'green' | 'blue' | 'amber' | 'red' | 'slate']> = { active: ['启用', 'green'], paid: ['已支付', 'green'], published: ['已发布', 'green'], draft: ['草稿', 'amber'], pending: ['待处理', 'amber'], disabled: ['已停用', 'red'], cancelled: ['已关闭', 'red'], archived: ['已归档', 'slate'] };
  const [label, tone] = map[status] || [status, 'slate']; return <Badge tone={tone}>{label}</Badge>;
}
export function Modal({ open, title, children, onClose, footer, wide }: { open: boolean; title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className={cx('max-h-[90vh] w-full overflow-auto rounded-2xl bg-white shadow-2xl', wide ? 'max-w-3xl' : 'max-w-lg')}><div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="关闭"><X size={18} /></button></div><div className="p-5">{children}</div>{footer && <div className="flex justify-end gap-2 border-t bg-slate-50 px-5 py-4">{footer}</div>}</div></div>;
}
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) { return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{headers.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y">{children}</tbody></table></div>; }
export function Tabs({ value, items, onChange }: { value: string; items: Array<{ value: string; label: string }>; onChange: (value: string) => void }) { return <div className="flex gap-1 overflow-auto rounded-lg bg-slate-100 p-1">{items.map((item) => <button key={item.value} onClick={() => onChange(item.value)} className={cx('whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition', value === item.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>{item.label}</button>)}</div>; }
