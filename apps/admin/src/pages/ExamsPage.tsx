import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Eye, FileBarChart, FlaskConical, Loader2, X } from 'lucide-react';
import { api, query } from '../lib/api';
import { DataState } from '../components/DataState';

interface QuestionItem {
  documentId: string;
  path: string;
  index: number;
  questionType: string;
  q?: string;
  prompt?: string;
  grade?: number;
  options?: string[];
  answer?: string;
  [k: string]: unknown;
}
interface Template {
  key: string;
  name?: string;
  totalPoints?: number;
  sections?: Array<{ type: string; count: number; name?: string }>;
  [k: string]: unknown;
}
interface PreflightResult {
  ok: boolean;
  checks: Array<{ type: string; required: number; available: number; ok: boolean; shortage: number }>;
  totalPoints: number | null;
}

export function ExamsPage() {
  const [tab, setTab] = useState<'questions' | 'templates'>('questions');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [qLoading, setQLoading] = useState(true);
  const [qError, setQError] = useState<string | null>(null);
  const [qSearch, setQSearch] = useState('');
  const [editing, setEditing] = useState<QuestionItem | null>(null);
  const [qText, setQText] = useState('');
  const [saving, setSaving] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [tLoading, setTLoading] = useState(false);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);

  const loadQuestions = useCallback(async () => {
    setQLoading(true);
    setQError(null);
    try {
      const q: Record<string, string> = { pageSize: '50' };
      if (qSearch) q.search = qSearch;
      const r = await api.get(`/admin/questions${query(q)}`);
      setQuestions((r as { items?: QuestionItem[] }).items || []);
    } catch (e) {
      setQError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setQLoading(false);
    }
  }, [qSearch]);

  useEffect(() => {
    if (tab === 'questions') loadQuestions();
  }, [tab, loadQuestions]);

  useEffect(() => {
    if (tab !== 'templates') return;
    setTLoading(true);
    api.get('/admin/exam-templates')
      .then((r) => setTemplates((r as { templates?: Template[] }).templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setTLoading(false));
  }, [tab]);

  const openEdit = async (it: QuestionItem) => {
    setEditing(it);
    setQText(JSON.stringify(it, null, 2));
  };
  const saveQuestion = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const parsed = JSON.parse(qText);
      await api.put(`/admin/questions/${editing.documentId}/items/${editing.index}`, parsed);
      setEditing(null);
      await loadQuestions();
    } catch (e) {
      setQError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };
  const runPreflight = async (tpl: Template) => {
    const r = await api.post<PreflightResult>('/admin/exam-templates/preflight', { template: tpl });
    setPreflight(r);
  };

  const TabBtn = ({ id, icon: Icon, label }: { id: 'questions' | 'templates'; icon: typeof Eye; label: string }) => (
    <button onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">题库与考试</h1>
        <p className="mt-1 text-sm text-slate-500">题目编辑与考试模板组卷预检</p>
      </div>
      <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
        <TabBtn id="questions" icon={ClipboardCheck} label="题目" />
        <TabBtn id="templates" icon={FileBarChart} label="考试模板" />
      </div>

      {tab === 'questions' && (
        <div className="space-y-4">
          <input value={qSearch} onChange={(e) => setQSearch(e.target.value)} placeholder="搜索题干 / 路径 / 题型…" className="h-9 w-72 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
          <DataState loading={qLoading} error={qError} empty={questions.length === 0} onRetry={loadQuestions}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">题干</th>
                    <th className="px-4 py-3 text-left font-medium">题型</th>
                    <th className="px-4 py-3 text-left font-medium">选项数</th>
                    <th className="px-4 py-3 text-left font-medium">年级</th>
                    <th className="px-4 py-3 text-left font-medium">来源</th>
                    <th className="px-4 py-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((it, i) => (
                    <tr key={`${it.documentId}-${it.index}-${i}`} className="hover:bg-slate-50">
                      <td className="max-w-xs truncate px-4 py-3 text-slate-700">{(it.q || it.prompt || '(无题干)') as string}</td>
                      <td className="px-4 py-3 text-slate-600">{it.questionType}</td>
                      <td className="px-4 py-3 text-slate-600">{Array.isArray(it.options) ? it.options.length : '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{it.grade ?? '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{it.path}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(it)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50"><Eye size={14} /> 编辑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataState>
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-base font-medium text-slate-900">考试模板</h2>
            <DataState loading={tLoading} error={null} empty={templates.length === 0} onRetry={() => setTab('templates')}>
              <div className="space-y-3">
                {templates.map((t) => (
                  <div key={t.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{t.name || t.key}</div>
                        <div className="text-xs text-slate-400">总分 {t.totalPoints ?? '-'} · {Array.isArray(t.sections) ? t.sections.length : 0} 个题型模块</div>
                      </div>
                      <button onClick={() => runPreflight(t)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                        <FlaskConical size={14} /> 组卷预检
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DataState>
          </div>
          <div>
            <h2 className="mb-3 text-base font-medium text-slate-900">组卷预检结果</h2>
            {!preflight && <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">选择左侧模板执行预检</div>}
            {preflight && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${preflight.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {preflight.ok ? '可正常组卷' : '题库不足，无法组卷'} · 总分 {preflight.totalPoints ?? '-'}
                </div>
                <table className="w-full text-sm">
                  <thead className="text-slate-500">
                    <tr><th className="py-2 text-left font-medium">题型</th><th className="py-2 text-right font-medium">需求</th><th className="py-2 text-right font-medium">可用</th><th className="py-2 text-right font-medium">缺口</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preflight.checks.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 text-slate-700">{c.type}</td>
                        <td className="py-2 text-right text-slate-600">{c.required}</td>
                        <td className="py-2 text-right text-slate-600">{c.available}</td>
                        <td className={`py-2 text-right ${c.shortage > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{c.shortage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setEditing(null)}>
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="font-medium text-slate-900">编辑题目</div>
                <div className="text-xs text-slate-400">{editing.path} · 索引 #{editing.index}</div>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <textarea value={qText} onChange={(e) => setQText(e.target.value)} spellCheck={false} className="h-[60vh] w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">取消</button>
              <button onClick={saveQuestion} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null} 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
