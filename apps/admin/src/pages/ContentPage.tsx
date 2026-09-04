import { useCallback, useEffect, useState } from 'react';
import { Download, Eye, FileJson, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { api, query } from '../lib/api';
import { DataState } from '../components/DataState';

interface ContentDoc {
  id: string;
  path: string;
  kind: string;
  version: number;
  status: string;
  checksum: string;
  itemCount: number;
  publishedAt?: string | null;
  updatedAt: string;
  payload?: unknown;
}

const KINDS = ['', 'questions', 'textbooks', 'exams', 'examples', 'extras', 'grammar', 'other'];
const STATUS_OPTIONS = ['', 'draft', 'published'];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    draft: 'bg-amber-50 text-amber-600',
    published: 'bg-emerald-50 text-emerald-600',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>;
}

export function ContentPage() {
  const [items, setItems] = useState<ContentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentDoc | null>(null);
  const [payloadText, setPayloadText] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q: Record<string, string> = { pageSize: '50' };
      if (search) q.search = search;
      if (status) q.status = status;
      if (kind) q.kind = kind;
      const r = await api.get(`/admin/content${query(q)}`);
      setItems((r as { items?: ContentDoc[] }).items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [search, status, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const doImport = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const r = await api.post<{ imported: Array<{ path: string }>; errors: Array<{ path: string; error: string }> }>('/admin/content/import', {});
      setImportMsg(`已导入 ${r.imported.length} 个内容文档，失败 ${r.errors.length} 个`);
      await load();
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const doExport = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (kind) params.set('kind', kind);
    const token = localStorage.getItem('admin_token');
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    fetch(`${base}/admin/content/export?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setError('导出失败'));
  };

  const openEdit = async (doc: ContentDoc) => {
    try {
      const r = await api.get<ContentDoc>(`/admin/content/${doc.id}`);
      setEditing(r);
      setEditStatus(r.status);
      setPayloadText(JSON.stringify(r.payload, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载详情失败');
    }
  };

  const saveDoc = async (publish?: boolean) => {
    if (!editing) return;
    setSaving(true);
    try {
      const body: { payload?: unknown; status: string } = publish
        ? { status: 'published' }
        : { payload: JSON.parse(payloadText), status: editStatus };
      await api.put(`/admin/content/${editing.id}`, body);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">内容管理</h1>
          <p className="mt-1 text-sm text-slate-500">教材 / 题库 / 考试等 JSON 内容文档，支持导入导出与版本校验</p>
        </div>
        <div className="flex gap-2">
          <button onClick={doImport} disabled={importing} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 导入内容
          </button>
          <button onClick={doExport} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Download size={16} /> 导出 JSON
          </button>
        </div>
      </div>

      {importMsg && <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{importMsg}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索路径…" className="h-9 w-64 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400">
          {KINDS.map((k) => <option key={k} value={k}>{k || '全部类型'}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || '全部状态'}</option>)}
        </select>
      </div>

      <DataState loading={loading} error={error} empty={items.length === 0} onRetry={load}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">路径</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-left font-medium">版本</th>
                <th className="px-4 py-3 text-left font-medium">条目数</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">更新时间</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{it.path}</td>
                  <td className="px-4 py-3 text-slate-600">{it.kind}</td>
                  <td className="px-4 py-3 text-slate-600">v{it.version}</td>
                  <td className="px-4 py-3 text-slate-600">{it.itemCount}</td>
                  <td className="px-4 py-3">{statusBadge(it.status)}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(it.updatedAt).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(it)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50">
                      <Eye size={14} /> 查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setEditing(null)}>
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileJson size={18} className="text-blue-600" />
                <div>
                  <div className="font-medium text-slate-900">{editing.path}</div>
                  <div className="text-xs text-slate-400">类型 {editing.kind} · v{editing.version} · 条目 {editing.itemCount}</div>
                </div>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100">关闭</button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <label className="mb-1 block text-xs font-medium text-slate-500">内容 JSON（保存时校验）</label>
              <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} spellCheck={false} className="h-80 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-blue-400" />
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-slate-500">状态</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-sm">
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => saveDoc()} disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">保存草稿</button>
              <button onClick={() => saveDoc(true)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
