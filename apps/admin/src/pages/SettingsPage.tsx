import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
import { api } from '../lib/api';
import { DataState } from '../components/DataState';

interface SettingsForm {
  siteName: string;
  registrationEnabled: boolean;
  maintenanceMode: boolean;
  dailyLimit: number;
  aiEnabled: boolean;
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
}

export function SettingsPage() {
  const [form, setForm] = useState<Partial<SettingsForm>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/admin/settings') as { settings?: Array<{ key: string; value: unknown }> };
      const arr = r.settings || [];
      const obj: Record<string, unknown> = {};
      for (const s of arr) obj[s.key] = s.value;
      setForm(obj as Partial<SettingsForm>);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put('/admin/settings', form);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof SettingsForm, v: unknown) => setForm((f) => ({ ...f, [k]: v } as Partial<SettingsForm>));

  const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {desc && <span className="block text-xs text-slate-400">{desc}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-200 transition checked:bg-blue-600 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4" />
    </label>
  );

  const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI 与系统设置</h1>
          <p className="mt-1 text-sm text-slate-500">配置 AI 供应商与全局开关，保存后即时生效</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 保存
        </button>
      </div>

      <DataState loading={loading} error={error} empty={false} onRetry={load}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-medium text-slate-900"><SettingsIcon size={18} className="text-blue-600" /> 系统</h2>
            <Field label="站点名称">
              <input value={form.siteName ?? ''} onChange={(e) => set('siteName', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </Field>
            <Toggle label="开放注册" desc="允许用户自助注册账号" checked={!!form.registrationEnabled} onChange={(v) => set('registrationEnabled', v)} />
            <Toggle label="维护模式" desc="暂停客户端登录与学习" checked={!!form.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} />
            <Field label="每日 AI 调用额度（免费用户）">
              <input type="number" min="0" value={form.dailyLimit ?? 0} onChange={(e) => set('dailyLimit', Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </Field>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-medium text-slate-900"><SettingsIcon size={18} className="text-emerald-600" /> AI 能力</h2>
            <Toggle label="启用 AI 能力" desc="关闭后客户端隐藏 AI 入口" checked={!!form.aiEnabled} onChange={(v) => set('aiEnabled', v)} />
            <Field label="AI 供应商">
              <input value={form.aiProvider ?? ''} onChange={(e) => set('aiProvider', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="openai / azure / 自建" />
            </Field>
            <Field label="默认模型">
              <input value={form.aiModel ?? ''} onChange={(e) => set('aiModel', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="gpt-4o-mini" />
            </Field>
            <Field label="API Key">
              <input type="password" value={form.aiApiKey ?? ''} onChange={(e) => set('aiApiKey', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="留空表示未配置" />
            </Field>
          </section>
        </div>
      </DataState>
    </div>
  );
}
