// js/member.js
// 会员中心（Phase 5）：会员状态 / 我的权益 / 套餐订购 / 我的订单。
// 纯脚本风格（全局 window.MemberCenter），与现有前端一致；渐进增强：
//   - 后端未开通（线上未注入 __API_BASE）→ 显示「会员服务即将上线」，不影响本地功能；
//   - 未登录 → 可浏览套餐，点订购引导登录；
//   - 已登录 → 展示会员状态/权益/订单，可自助下单（生成待支付订单，管理员确认收款后开通）。
// 依赖：window.ApiClient（js/api-client.js）、window.Entitlements（js/entitlement.js）。
(function () {
  'use strict';

  var PLAN_TYPE_LABEL = { subscription: '订阅', lifetime: '永久买断', item: '单项购买' };
  var ORDER_STATUS = {
    pending: { text: '待确认收款', cls: 'bg-amber-100 text-amber-700' },
    paid: { text: '已开通', cls: 'bg-green-100 text-green-700' },
    canceled: { text: '已取消', cls: 'bg-slate-100 text-slate-500' },
    refunded: { text: '已退款', cls: 'bg-slate-100 text-slate-500' },
  };
  var CATEGORY_LABEL = { content: '📚 教材内容', ai: '🤖 AI 能力', feature: '⭐ 高级功能' };

  var state = { loading: false, plans: [], membership: null, orders: [], error: '' };

  // —— 工具 ——
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(cents) {
    var n = Number(cents || 0) / 100;
    return '¥' + (Number.isInteger(n) ? n : n.toFixed(2));
  }
  function fmtDate(v) {
    if (!v) return '';
    var d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysLeft(v) {
    if (!v) return null;
    var d = new Date(v).getTime() - Date.now();
    return d <= 0 ? 0 : Math.ceil(d / 86400000);
  }
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[会员中心]', msg);
  }
  function backendOn() {
    return !!(window.ApiClient && window.ApiClient.isBackendAvailable && window.ApiClient.isBackendAvailable());
  }
  function loggedIn() {
    return !!(window.ApiClient && window.ApiClient.isLoggedIn && window.ApiClient.isLoggedIn());
  }

  // —— 数据加载 ——
  function load() {
    if (!backendOn()) {
      state.error = 'NO_BACKEND';
      return Promise.resolve();
    }
    state.loading = true;
    state.error = '';
    var tasks = [
      window.ApiClient.request('GET', '/api/plans').then(
        function (r) { state.plans = (r && r.plans) || []; },
        function () { state.plans = []; }
      ),
    ];
    if (loggedIn()) {
      tasks.push(
        window.ApiClient.request('GET', '/api/me/membership').then(
          function (r) { state.membership = r || null; },
          function () { state.membership = null; }
        )
      );
      tasks.push(
        window.ApiClient.request('GET', '/api/me/orders').then(
          function (r) { state.orders = (r && r.orders) || []; },
          function () { state.orders = []; }
        )
      );
    } else {
      state.membership = null;
      state.orders = [];
    }
    return Promise.all(tasks).then(function () { state.loading = false; });
  }

  // —— 各区块渲染 ——
  function accountCardHTML() {
    if (!loggedIn()) {
      return (
        '<div class="card p-6 mb-4 text-center">' +
          '<div class="text-4xl mb-2">🔐</div>' +
          '<div class="font-bold text-slate-700">登录后查看会员状态</div>' +
          '<p class="text-slate-500 text-sm mt-1">登录即可开通会员、查看已购权益与订单</p>' +
          '<button data-member-act="login" class="mt-4 gradient-btn px-6 py-2.5 rounded-xl font-bold text-white">去登录 / 注册</button>' +
        '</div>'
      );
    }
    var m = state.membership || {};
    var u = m.user || (window.ApiClient.getUser && window.ApiClient.getUser()) || {};
    var subs = (m.subscriptions || []).filter(function (s) { return s.status === 'active'; });
    var lifetime = subs.some(function (s) { return !s.expiresAt; });
    var best = null;
    subs.forEach(function (s) {
      if (!s.expiresAt) return;
      if (new Date(s.expiresAt).getTime() <= Date.now()) return;
      if (!best || new Date(s.expiresAt) > new Date(best.expiresAt)) best = s;
    });
    var isAdmin = !!m.isAdmin;
    var badge, desc;
    if (isAdmin) {
      badge = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">管理员</span>';
      desc = '管理员账号默认拥有全部权益';
    } else if (lifetime) {
      badge = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">永久会员</span>';
      desc = '已买断，永久有效';
    } else if (best) {
      var dl = daysLeft(best.expiresAt);
      badge = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">VIP 会员</span>';
      desc = '有效期至 ' + fmtDate(best.expiresAt) + '（剩余 ' + dl + ' 天）' + (dl <= 7 ? ' · 即将到期，建议续费' : '');
    } else {
      badge = '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">免费用户</span>';
      desc = '开通会员可解锁全部教材、AI 口语/作文批改等高级功能';
    }
    var entCount = ((m.entitlements || []).length) || 0;
    var itemCount = ((m.itemPurchases || []).length) || 0;
    return (
      '<div class="card p-5 mb-4">' +
        '<div class="flex items-start justify-between gap-3 flex-wrap">' +
          '<div>' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-lg font-bold text-slate-800">' + esc(u.displayName || u.username || '我的账号') + '</span>' + badge +
            '</div>' +
            '<div class="text-sm text-slate-500 mt-1">' + esc(desc) + '</div>' +
          '</div>' +
          '<div class="flex gap-4 text-center">' +
            '<div><div class="text-xl font-bold text-sky-600">' + entCount + '</div><div class="text-xs text-slate-400">已解锁权益</div></div>' +
            '<div><div class="text-xl font-bold text-sky-600">' + itemCount + '</div><div class="text-xs text-slate-400">单项购买</div></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function entitlementsHTML() {
    if (!loggedIn()) return '';
    var list = (state.membership && state.membership.entitlements) || [];
    if (!list.length) {
      return (
        '<div class="card p-5 mb-4">' +
          '<div class="font-bold text-slate-700 mb-2">🎁 我的权益</div>' +
          '<div class="text-sm text-slate-400">暂无已开通权益，选购下方套餐即可解锁</div>' +
        '</div>'
      );
    }
    var groups = {};
    list.forEach(function (e) {
      var c = e.category || 'feature';
      (groups[c] = groups[c] || []).push(e);
    });
    var body = Object.keys(groups).map(function (c) {
      var chips = groups[c].map(function (e) {
        var exp = e.expiresAt ? '<span class="text-[10px] text-slate-400 ml-1">至' + fmtDate(e.expiresAt) + '</span>' : '';
        return '<span class="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs border border-green-100">✓ ' + esc(e.name || e.code) + exp + '</span>';
      }).join('');
      return (
        '<div class="mb-3 last:mb-0">' +
          '<div class="text-xs text-slate-400 mb-1.5">' + esc(CATEGORY_LABEL[c] || c) + '</div>' +
          '<div class="flex flex-wrap gap-2">' + chips + '</div>' +
        '</div>'
      );
    }).join('');
    return '<div class="card p-5 mb-4"><div class="font-bold text-slate-700 mb-3">🎁 我的权益</div>' + body + '</div>';
  }

  // 判断某套餐是否已生效（订阅类）
  function ownedPlanIds() {
    var ids = {};
    var m = state.membership || {};
    (m.subscriptions || []).forEach(function (s) {
      if (s.status !== 'active') return;
      if (s.expiresAt && new Date(s.expiresAt).getTime() <= Date.now()) return;
      ids[s.planId] = s.expiresAt ? 'renew' : 'owned';
    });
    return ids;
  }
  function pendingPlanIds() {
    var ids = {};
    (state.orders || []).forEach(function (o) { if (o.status === 'pending') ids[o.planId] = o.id; });
    return ids;
  }

  function plansHTML() {
    if (!state.plans.length) {
      return (
        '<div class="card p-5 mb-4">' +
          '<div class="font-bold text-slate-700 mb-2">💎 选购套餐</div>' +
          '<div class="text-sm text-slate-400">暂无可购套餐，请稍后再来看看</div>' +
        '</div>'
      );
    }
    var owned = ownedPlanIds();
    var pending = pendingPlanIds();
    var cards = state.plans.map(function (p) {
      var ents = (p.planEntitlements || []).map(function (pe) {
        var e = pe.entitlement || {};
        return '<li class="flex items-start gap-1.5 text-sm text-slate-600"><span class="text-green-500">✓</span><span>' + esc(e.name || e.code) + '</span></li>';
      }).join('');
      var dur = p.type === 'subscription' && p.durationDays ? (p.durationDays + ' 天') : (p.type === 'lifetime' ? '永久' : '单项');
      var st = owned[p.id];
      var pendId = pending[p.id];
      var btn;
      if (pendId) {
        btn = '<button data-member-act="cancel-order" data-id="' + esc(pendId) + '" class="w-full mt-3 py-2.5 rounded-xl font-bold border border-amber-200 bg-amber-50 text-amber-700 text-sm">已下单 · 待确认（点此取消）</button>';
      } else if (st === 'owned') {
        btn = '<button disabled class="w-full mt-3 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-400 text-sm">已永久开通</button>';
      } else {
        btn = '<button data-member-act="buy" data-code="' + esc(p.code) + '" class="w-full mt-3 gradient-btn py-2.5 rounded-xl font-bold text-white text-sm active:scale-95 transition">' + (st === 'renew' ? '续费' : '立即订购') + '</button>';
      }
      return (
        '<div class="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col shadow-sm">' +
          '<div class="flex items-center justify-between">' +
            '<div class="font-bold text-slate-800">' + esc(p.name) + '</div>' +
            '<span class="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[11px]">' + esc(PLAN_TYPE_LABEL[p.type] || p.type) + '</span>' +
          '</div>' +
          '<div class="mt-2 flex items-baseline gap-1">' +
            '<span class="text-2xl font-extrabold text-amber-600">' + money(p.priceCents) + '</span>' +
            '<span class="text-xs text-slate-400">/ ' + esc(dur) + '</span>' +
          '</div>' +
          (p.description ? '<div class="text-xs text-slate-400 mt-1">' + esc(p.description) + '</div>' : '') +
          '<ul class="mt-3 space-y-1.5 flex-1">' + (ents || '<li class="text-sm text-slate-400">—</li>') + '</ul>' +
          btn +
        '</div>'
      );
    }).join('');
    return (
      '<div class="mb-4">' +
        '<div class="font-bold text-slate-700 mb-3">💎 选购套餐</div>' +
        '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">' + cards + '</div>' +
        '<div class="mt-3 text-xs text-slate-400 leading-relaxed">' +
          '下单后会生成一笔「待确认收款」订单，完成付款并由管理员在后台确认后，权益立即生效（可点右上角「刷新」查看最新状态）。' +
        '</div>' +
      '</div>'
    );
  }

  function ordersHTML() {
    if (!loggedIn()) return '';
    if (!state.orders.length) {
      return '<div class="card p-5"><div class="font-bold text-slate-700 mb-2">🧾 我的订单</div><div class="text-sm text-slate-400">暂无订单记录</div></div>';
    }
    var rows = state.orders.map(function (o) {
      var s = ORDER_STATUS[o.status] || { text: o.status, cls: 'bg-slate-100 text-slate-500' };
      var cancel = o.status === 'pending'
        ? '<button data-member-act="cancel-order" data-id="' + esc(o.id) + '" class="ml-2 text-xs text-slate-400 hover:text-red-500 underline">取消</button>'
        : '';
      return (
        '<div class="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">' +
          '<div class="min-w-0">' +
            '<div class="text-sm font-medium text-slate-700 truncate">' + esc((o.plan && o.plan.name) || '套餐') + '</div>' +
            '<div class="text-[11px] text-slate-400">' + esc(fmtDate(o.createdAt)) + ' · ' + money(o.amountCents) + '</div>' +
          '</div>' +
          '<div class="flex items-center shrink-0">' +
            '<span class="px-2 py-0.5 rounded-full text-xs ' + s.cls + '">' + esc(s.text) + '</span>' + cancel +
          '</div>' +
        '</div>'
      );
    }).join('');
    return '<div class="card p-5"><div class="font-bold text-slate-700 mb-1">🧾 我的订单</div>' + rows + '</div>';
  }

  function render() {
    var box = document.getElementById('memberBody');
    if (!box) return;
    if (state.error === 'NO_BACKEND') {
      box.innerHTML =
        '<div class="card p-10 text-center">' +
          '<div class="text-4xl mb-2">🛠️</div>' +
          '<div class="font-bold text-slate-700">会员服务即将上线</div>' +
          '<p class="text-slate-500 text-sm mt-2">当前所有已上线的学习功能均可免费使用，云端会员/套餐订购正在开通中，敬请期待。</p>' +
        '</div>';
      return;
    }
    if (state.loading) {
      box.innerHTML = '<div class="card p-10 text-center text-slate-400 text-sm">正在加载会员信息…</div>';
      return;
    }
    box.innerHTML = accountCardHTML() + entitlementsHTML() + plansHTML() + ordersHTML();
  }

  // —— 交互 ——
  function buy(planCode) {
    if (!loggedIn()) {
      toast('请先登录后再订购');
      openLogin();
      return;
    }
    var plan = state.plans.filter(function (p) { return p.code === planCode; })[0];
    if (plan && plan.type === 'item') {
      toast('该套餐为单项购买，请联系客服指定具体内容');
    }
    window.ApiClient.request('POST', '/api/me/orders', { planCode: planCode })
      .then(function (r) {
        toast(r && r.reused ? '你已有一笔该套餐的待确认订单' : '下单成功，请完成付款后等待确认开通');
        return refresh();
      })
      .catch(function (err) {
        toast((err && err.body && err.body.error && err.body.error.message) || '下单失败，请稍后重试');
      });
  }

  function cancelOrder(id) {
    window.ApiClient.request('POST', '/api/me/orders/' + id + '/cancel', {})
      .then(function () { toast('订单已取消'); return refresh(); })
      .catch(function (err) {
        toast((err && err.body && err.body.error && err.body.error.message) || '取消失败');
      });
  }

  function openLogin() {
    // 复用顶部「档案 / 云账号」面板作为登录入口
    if (typeof window.openProfilePanel === 'function') window.openProfilePanel();
    else toast('请点击右上角头像登录');
  }

  function refresh() {
    render();
    return load()
      .then(function () {
        if (window.Entitlements && window.Entitlements.refresh) return window.Entitlements.refresh();
      })
      .then(function () { render(); });
  }

  function onClick(ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-member-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-member-act');
    if (act === 'buy') buy(el.getAttribute('data-code'));
    else if (act === 'cancel-order') cancelOrder(el.getAttribute('data-id'));
    else if (act === 'login') openLogin();
  }

  var bound = false;
  function bind() {
    if (bound) return;
    var page = document.getElementById('page-member');
    if (!page) return;
    page.addEventListener('click', onClick);
    var rb = document.getElementById('memberRefreshBtn');
    if (rb) rb.addEventListener('click', function () { refresh(); });
    bound = true;
  }

  // 进入会员中心页时调用
  function open() {
    bind();
    state.loading = true;
    render();
    load().then(render);
  }

  window.MemberCenter = {
    open: open,
    refresh: refresh,
    render: render,
    get state() { return state; },
  };
})();
