// js/entitlement.js
// 学生端权益门控（Phase 5）：登录后拉取「有效权益」与「AI 服务状态」，供各功能门控判断是否放行。
// 渐进增强：未登录 / 后端未开通 / 请求失败 → 视为无权益（功能走降级或显示「开通会员」）。
// 依赖：window.ApiClient（js/api-client.js）。
(function () {
  'use strict';

  // 教材 code 映射：教材标识 → 对应权益 code
  var TEXTBOOK_ENTITLEMENT = {
    rj: 'textbook_rj', // 人教版
    wy: 'textbook_wy', // 外研社
    hj: 'textbook_hj', // 沪教
    qz: 'textbook_qz', // 牛津/其他
  };

  var state = {
    codes: new Set(),
    ai: { enabled: false, provider: null, model: null },
    ready: false,
    promise: null,
    user: null,
  };

  function _fetch(fn) {
    if (!window.ApiClient || !window.ApiClient.request) return Promise.reject(new Error('no ApiClient'));
    return fn();
  }

  function bootstrap() {
    if (state.promise) return state.promise;
    state.ready = false;
    state.promise = (async function () {
      try {
        if (!window.ApiClient.isLoggedIn || !window.ApiClient.isLoggedIn()) {
          // 未登录：无权益
          state.codes = new Set();
          state.ai = { enabled: false, provider: null, model: null };
          return api;
        }
        var e = await _fetch(function () { return window.ApiClient.request('GET', '/api/me/entitlements'); });
        state.codes = new Set(((e && e.entitlements) || []).map(function (x) { return x.code; }));
        try {
          var s = await _fetch(function () { return window.ApiClient.request('GET', '/api/ai/status'); });
          state.ai = { enabled: !!s.enabled, provider: s.provider || null, model: s.model || null };
        } catch (_) {
          state.ai = { enabled: false, provider: null, model: null };
        }
      } catch (_) {
        state.codes = new Set();
      } finally {
        state.ready = true;
      }
      return api;
    })();
    return state.promise;
  }

  // 强制重新拉取（登录/登出/下单开通后调用）：清掉缓存的 promise 再 bootstrap
  function refresh() {
    state.promise = null;
    return bootstrap();
  }

  function has(code) { return state.codes.has(code); }
  function hasAny(codes) { return (codes || []).some(function (c) { return state.codes.has(c); }); }
  function isAdmin() {
    var u = window.ApiClient && window.ApiClient.getUser && window.ApiClient.getUser();
    return !!(u && u.role === 'admin');
  }
  // AI 能力是否可用：已登录 + 持有该权益 + AI 服务开启
  function canAI(code) {
    if (!window.ApiClient.isLoggedIn || !window.ApiClient.isLoggedIn()) return false;
    if (isAdmin()) return state.ai.enabled; // 管理员默认放行（便于测试），但仍需服务开启
    return state.ai.enabled && state.codes.has(code);
  }
  // 免费教材（当前已上线）始终可访问；其余教材（rj/wy/qz 等）按 textbook_* 权益门控；游客保持原体验
  var FREE_TEXTBOOKS = { jk: true, hj: true, gzk: true };
  function canTextbook(tbCode) {
    if (!tbCode) return true;
    if (FREE_TEXTBOOKS[tbCode]) return true;
    if (!window.ApiClient.isLoggedIn || !window.ApiClient.isLoggedIn()) return true; // 游客保持原体验
    if (isAdmin()) return true;
    var ent = TEXTBOOK_ENTITLEMENT[tbCode] || ('textbook_' + tbCode);
    return state.codes.has(ent);
  }

  var api = {
    bootstrap: bootstrap,
    refresh: refresh,
    has: has,
    hasAny: hasAny,
    isAdmin: isAdmin,
    canAI: canAI,
    canTextbook: canTextbook,
    get ready() { return state.ready; },
    get codes() { return Array.from(state.codes); },
    get ai() { return state.ai; },
    TEXTBOOK_ENTITLEMENT: TEXTBOOK_ENTITLEMENT,
  };

  window.Entitlements = api;
})();
