// js/api-client.js
// 后端 API 轻封装 + token 管理。纯脚本风格（全局 window.ApiClient），与现有前端一致。
// 渐进增强：未配置后端 / 未登录时，本文件不影响任何现有本地功能。
// 环境感知：本地/局域网开发连本地后端；线上未配置云端后端地址时判定“后端未开通”，
//           请求快速失败（不转圈），UI 据此显示「云同步即将上线」降级提示。
(function () {
  'use strict';

  // —— 后端地址判定 ——
  // 优先级：window.__API_BASE（壳/部署注入，如 CloudBase 公网地址）> 本地/局域网开发默认 127.0.0.1:4000 > 其他环境视为未开通。
  function _detectApiBase() {
    try {
      if (window.__API_BASE) return String(window.__API_BASE);
      var h = (location && location.hostname) || '';
      var isLocal = (h === 'localhost' || h === '127.0.0.1' || h === '' ||
        /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h));
      if (isLocal) return 'http://127.0.0.1:4000';
    } catch (e) {}
    return ''; // 线上未注入 __API_BASE → 未开通
  }

  var API_BASE = _detectApiBase().replace(/\/+$/, '');
  var BACKEND_AVAILABLE = !!API_BASE;
  var REQ_TIMEOUT = 8000; // 8s 超时兜底，防止弱网/跨域拦截时永久 pending（转圈）

  // token 存储：全局（不分 profile），登录态跨档案共享。
  var TK_ACCESS = 'yxyy_cloud_access_v1';
  var TK_REFRESH = 'yxyy_cloud_refresh_v1';
  var TK_USER = 'yxyy_cloud_user_v1';

  function getAccess() { try { return localStorage.getItem(TK_ACCESS) || ''; } catch (e) { return ''; } }
  function getRefresh() { try { return localStorage.getItem(TK_REFRESH) || ''; } catch (e) { return ''; } }
  function getUser() {
    try { var s = localStorage.getItem(TK_USER); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function setSession(accessToken, refreshToken, user) {
    try {
      if (accessToken) localStorage.setItem(TK_ACCESS, accessToken);
      if (refreshToken) localStorage.setItem(TK_REFRESH, refreshToken);
      if (user) localStorage.setItem(TK_USER, JSON.stringify(user));
    } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem(TK_ACCESS); localStorage.removeItem(TK_REFRESH); localStorage.removeItem(TK_USER); } catch (e) {}
  }
  function isLoggedIn() { return !!getAccess(); }

  function _err(status, code, message) {
    return { status: status, body: { error: { code: code, message: message } } };
  }

  // 核心请求：自动带 token；后端未开通快速失败；8s 超时；401 时尝试用 refresh 换新 access 后重试一次。
  function request(method, path, body, _retried) {
    if (!BACKEND_AVAILABLE) {
      return Promise.reject(_err(0, 'NO_BACKEND', '云同步服务暂未开通'));
    }
    var headers = { 'Content-Type': 'application/json' };
    var access = getAccess();
    if (access) headers['Authorization'] = 'Bearer ' + access;
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, REQ_TIMEOUT) : null;
    return fetch(API_BASE + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (res.status === 401 && !_retried && getRefresh()) {
        return refresh().then(function (ok) {
          if (ok) return request(method, path, body, true);
          clearSession();
          return res.json().catch(function () { return {}; }).then(function (j) { throw { status: 401, body: j }; });
        });
      }
      return res.text().then(function (t) {
        var json; try { json = t ? JSON.parse(t) : {}; } catch (e) { json = t; }
        if (!res.ok) throw { status: res.status, body: json };
        return json;
      });
    }, function (fetchErr) {
      // 网络错误 / 超时 abort / CORS 拦截 → 统一为友好错误
      if (timer) clearTimeout(timer);
      throw _err(0, 'NETWORK', '无法连接云同步服务，请检查网络或稍后再试');
    });
  }

  function refresh() {
    if (!BACKEND_AVAILABLE) return Promise.resolve(false);
    var rt = getRefresh();
    if (!rt) return Promise.resolve(false);
    return fetch(API_BASE + '/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    }).then(function (res) {
      if (!res.ok) return false;
      return res.json().then(function (j) {
        if (j && j.accessToken) { setSession(j.accessToken, null, null); return true; }
        return false;
      });
    }).catch(function () { return false; });
  }

  function login(username, password) {
    return request('POST', '/api/auth/login', { username: username, password: password })
      .then(function (j) { setSession(j.accessToken, j.refreshToken, j.user); return j.user; });
  }
  function register(username, password) {
    return request('POST', '/api/auth/register', { username: username, password: password });
  }
  function logout() {
    var rt = getRefresh();
    var p = (rt && BACKEND_AVAILABLE) ? request('POST', '/api/auth/logout', { refreshToken: rt }).catch(function () {}) : Promise.resolve();
    return p.then(function () { clearSession(); });
  }

  // 流式请求（SSE）：返回原始 fetch Response，供调用方按块读取。401 自动尝试刷新后重试一次。
  function streamRaw(method, path, body, _retried) {
    if (!BACKEND_AVAILABLE) return Promise.reject(_err(0, 'NO_BACKEND', '云同步服务暂未开通'));
    var headers = { 'Content-Type': 'application/json' };
    var access = getAccess();
    if (access) headers['Authorization'] = 'Bearer ' + access;
    return fetch(API_BASE + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (res) {
      if (res.status === 401 && !_retried && getRefresh()) {
        return refresh().then(function (ok) {
          if (ok) return streamRaw(method, path, body, true);
          clearSession();
          throw _err(401, 'UNAUTHORIZED', '未登录或登录已过期');
        });
      }
      return res;
    });
  }

  window.ApiClient = {
    base: API_BASE,
    request: request,
    stream: streamRaw,
    login: login,
    register: register,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    clearSession: clearSession,
    isBackendAvailable: function () { return BACKEND_AVAILABLE; },
  };
})();
