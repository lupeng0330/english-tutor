import { useEffect, useState, type FormEvent } from 'react';
import { Gift, Search } from 'lucide-react';
import { api, query } from '../lib/api';
import { type Membership, type Order, type Plan, type AdminUser } from '../types';
import { money } from '../lib/format';
import { Badge, Button, Card, Input, Modal, Select, StatusBadge, Table } from '../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../components/DataState';

const SUB_LABEL: Record<string, string> = { active: '有效', expired: '已过期', canceled: '已关闭', pending: '待生效' };
const CHANNEL_LABEL: Record<string, string> = { manual: '后台开通', wechat: '微信', alipay: '支付宝', apple_iap: 'Apple', google_play: 'Google' };

export function MembershipPage() {
  const [members, setMembers] = useState<Membership[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({ userId: '', planCode: '', itemRef: '', remark: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([loadMembers(), loadOrders(), loadPlans()])
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  };

  const loadMembers = async () => {
    const r = await api.get(`/admin/membership/users${query({ page: '1', pageSize: '100' })}`);
    const list: any[] = (r as { items?: any[] }).items || [];
    const rows: Membership[] = [];
    for (const u of list) {
      for (const s of u.subscriptions || []) {
        rows.push({
          id: s.id,
          userId: u.id,
          username: u.username,
          planName: s.plan?.name,
          planCode: s.plan?.code,
          status: s.status,
          expiresAt: s.expiresAt,
          createdAt: s.createdAt,
        });
      }
    }
    setMembers(rows);
    setUsers(list.map((u) => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role, status: u.status, email: u.email, createdAt: u.createdAt })));
  };

  const loadOrders = async () => {
    const r = await api.get(`/admin/orders${query({ page: '1', pageSize: '50' })}`);
    const list: any[] = (r as { items?: any[] }).items || [];
    setOrders(
      list.map((o) => ({
        id: o.id,
        username: o.user?.username,
        planName: o.plan?.name,
        amountCents: o.amountCents,
        channel: o.channel,
        status: o.status,
        createdAt: o.createdAt,
        remark: o.remark,
      })),
    );
  };

  // 用户自助下单产生 pending 订单：管理员确认收款后自动开通对应套餐
  const orderAction = async (o: Order, type: 'confirm' | 'cancel') => {
    try {
      if (type === 'confirm') {
        if (!confirm(`确认已收款并为「${o.username || '该用户'}」开通「${o.planName || '该套餐'}」？`)) return;
        const txn = window.prompt('收款流水号（可留空）', '') || undefined;
        await api.post(`/admin/orders/${o.id}/confirm`, txn ? { externalTxnId: txn } : {});
      } else {
        if (!confirm('确定关闭该订单？')) return;
        await api.post(`/admin/orders/${o.id}/cancel`, {});
      }
      await Promise.all([loadOrders(), loadMembers()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    }
  };

  const loadPlans = async () => {
    const r = await api.get('/plans');
    setPlans(((r as { plans?: Plan[] }).plans) || []);
  };

  useEffect(load, []);

  const action = async (row: Membership, type: 'extend' | 'close') => {
    try {
      if (type === 'extend') {
        const days = window.prompt('延长天数', '30');
        if (!days) return;
        const n = Number(days);
        if (!Number.isFinite(n) || n <= 0) { setError('请输入有效的天数'); return; }
        await api.patch(`/admin/subscriptions/${row.id}`, { action: 'extend', days: n });
      } else {
        if (!confirm('确定关闭该用户的会员？')) return;
        await api.patch(`/admin/subscriptions/${row.id}`, { action: 'cancel' });
      }
      await loadMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    }
  };

  const grant = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/grant', {
        userId: grantForm.userId,
        planCode: grantForm.planCode,
        itemRef: grantForm.itemRef || undefined,
        remark: grantForm.remark || undefined,
      });
      setGrantOpen(false);
      setGrantForm({ userId: '', planCode: '', itemRef: '', remark: '' });
      await loadMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : '开通失败');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <>
      <PageHeader
        title="会员与营收"
        subtitle="手动开通 / 延期 / 关闭会员，查看订单与开通记录"
        action={<Button onClick={() => setGrantOpen(true)}><Gift size={16} /> 开通会员</Button>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h2 className="mb-4 text-base font-medium text-slate-900">会员状态</h2>
          {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={load} /> : !members.length ? <EmptyState title="暂无会员" /> : (
            <Table headers={['用户', '套餐', '状态', '到期', '创建时间', '操作']}>
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.username}</td>
                  <td className="px-4 py-3 text-slate-600">{m.planName || m.planCode || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{m.expiresAt ? new Date(m.expiresAt).toLocaleDateString('zh-CN') : '永久'}</td>
                  <td className="px-4 py-3 text-slate-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => action(m, 'extend')}>延期</Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => action(m, 'close')}>关闭</Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-slate-900">
            订单 / 开通记录
            {pendingCount > 0 && <Badge tone="amber">{pendingCount} 笔待确认</Badge>}
          </h2>
          {!orders.length ? <EmptyState title="暂无订单" /> : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className={`rounded-xl border p-3 ${o.status === 'pending' ? 'border-amber-200 bg-amber-50/60' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{o.username || '未知用户'}</span>
                    <span className="text-sm text-slate-500">{money(o.amountCents || 0)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{o.planName || '-'} · {o.channel ? (CHANNEL_LABEL[o.channel] || o.channel) : '-'}</span>
                    <Badge tone={o.status === 'paid' ? 'green' : o.status === 'pending' ? 'amber' : 'slate'}>{o.status}</Badge>
                  </div>
                  {o.status === 'pending' && (
                    <div className="mt-2 flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => orderAction(o, 'confirm')}>确认收款并开通</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => orderAction(o, 'cancel')}>关闭</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={grantOpen}
        title="开通 / 授予会员"
        onClose={() => setGrantOpen(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setGrantOpen(false)}>取消</Button>
          <Button onClick={() => document.getElementById('grant-submit')?.click()} disabled={saving}>{saving ? '处理中…' : '确认开通'}</Button>
        </>}
      >
        <form onSubmit={grant} className="space-y-4">
          <label className="block">
            <span className="field-label">用户</span>
            <Select value={grantForm.userId} onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })} required>
              <option value="">选择用户</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}{u.displayName ? `（${u.displayName}）` : ''}</option>)}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">套餐 / 权益</span>
            <Select value={grantForm.planCode} onChange={(e) => setGrantForm({ ...grantForm, planCode: e.target.value })} required>
              <option value="">选择套餐</option>
              {plans.map((p) => <option key={p.id} value={p.code}>{p.name}（{p.type}）</option>)}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">单项内容（可选，如单册教材路径）</span>
            <Input value={grantForm.itemRef} onChange={(e) => setGrantForm({ ...grantForm, itemRef: e.target.value })} placeholder="data/textbooks/g3_up.json" />
          </label>
          <label className="block">
            <span className="field-label">备注</span>
            <Input value={grantForm.remark} onChange={(e) => setGrantForm({ ...grantForm, remark: e.target.value })} />
          </label>
          <button id="grant-submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}
