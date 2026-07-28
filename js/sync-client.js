// js/sync-client.js
// 学习数据云同步客户端（Phase 3 首批：wrongbook / stats）。
// 渐进增强：未登录时全程 no-op，前端完全按现有本地 localStorage 行为运行。
// 登录后：①本地↔云端合并（存量数据上云、多设备不互相覆盖）②本地写变更后节流推送云端。
(function () {
  'use strict';

  // 本批同步的 key（与后端 ALLOWED_KEYS 对应）
  // PROFILE_SCOPED：按档案隔离（localStorage key 加 :profileId，云端按真实 profileId 存）
  // GLOBAL：全局元数据（档案列表本身；localStorage 无后缀，云端用固定 profileId='__global__' 存）
  var PROFILE_SCOPED_KEYS = ['yxyy_wrongbook_v1', 'yxyy_stats_v1'];
  var GLOBAL_KEYS = ['yxyy_profiles_v1'];
  var SYNC_KEYS = PROFILE_SCOPED_KEYS.concat(GLOBAL_KEYS);
  var GLOBAL_PID = '__global__';

  // 记录各 key 的服务端版本（用于 PUT 的 baseVersion，做乐观并发）
  var _versions = {}; // { key: version }
  // 节流推送定时器
  var _pushTimers = {}; // { key: timeoutId }
  var PUSH_DELAY = 3000; // 3s 节流，避免 stats 计时器每 10s 高频写直接打云端

  function loggedIn() {
    return window.ApiClient && window.ApiClient.isLoggedIn();
  }

  function activeProfileId() {
    try {
      return (window.ProfileManager && window.ProfileManager.active().id) || 'default';
    } catch (e) { return 'default'; }
  }

  function isGlobalKey(base) {
    return GLOBAL_KEYS.indexOf(base) >= 0;
  }

  function pkey(base) {
    return isGlobalKey(base) ? base : (base + ':' + activeProfileId());
  }

  // 云端存储用的 profileId：全局 key 固定 __global__，档案级 key 用当前激活档案
  function serverProfileId(base) {
    return isGlobalKey(base) ? GLOBAL_PID : activeProfileId();
  }

  // —— 刷新模块内存缓存（关键：两个 _load* 有内存短路，覆盖 localStorage 后必须清空内存）——
  function refreshModuleMemory() {
    try { if (window.__wrongbookReload) window.__wrongbookReload(); } catch (e) {}
    try { if (window.__statsReload) window.__statsReload(); } catch (e) {}
    // 刷新 UI
    try { if (window.renderHomeStats) window.renderHomeStats(); } catch (e) {}
    try {
      if (window.renderWrongbookPage && document.querySelector('#page-wrongbook.active')) {
        window.renderWrongbookPage();
      }
    } catch (e) {}
    // 档案列表可能被云端合并出新档案：重渲染档案面板与 header 徽标
    try { if (window.renderProfilePanel) window.renderProfilePanel(); } catch (e) {}
    try { if (window.refreshProfileBadge) window.refreshProfileBadge(); } catch (e) {}
  }

  // —— 合并策略（登录时本地↔云端，保证存量上云、多设备互不覆盖）——
  // 错题本：{ qid: { wrongCount, mastered, ... } } —— 按题目并集；同题保留信息更全的一方，wrongCount 取大
  function mergeWrongbook(server, local) {
    var s = (server && typeof server === 'object') ? server : {};
    var l = (local && typeof local === 'object') ? local : {};
    var out = {};
    var k;
    for (k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) out[k] = s[k]; }
    for (k in l) {
      if (!Object.prototype.hasOwnProperty.call(l, k)) continue;
      var sv = out[k], lv = l[k];
      if (sv == null) { out[k] = lv; continue; }
      var sc = (sv && sv.wrongCount) || 0, lc = (lv && lv.wrongCount) || 0;
      var sm = (sv && sv.mastered) ? 1 : 0, lm = (lv && lv.mastered) ? 1 : 0;
      // 信息量打分：已掌握 +1，错误次数更多 +1
      var sScore = sc + sm, lScore = lc + lm;
      var base = (lScore > sScore) ? lv : sv;
      var merged = {};
      var key2;
      for (key2 in sv) { if (Object.prototype.hasOwnProperty.call(sv, key2)) merged[key2] = sv[key2]; }
      for (key2 in lv) { if (Object.prototype.hasOwnProperty.call(lv, key2)) merged[key2] = lv[key2]; }
      // 保留信息量更高一方的整体字段，但 wrongCount 取两者较大（不丢历史）
      for (key2 in base) { if (Object.prototype.hasOwnProperty.call(base, key2)) merged[key2] = base[key2]; }
      merged.wrongCount = Math.max(sc, lc);
      out[k] = merged;
    }
    return out;
  }

  // 统计：{ totalSeconds, todaySeconds, knownWords{}, answers[], streak, lastUnit, readingExDone{}, dailySeconds{}, lastActiveDay }
  // 数值取大（避免 double-count 且不丢进度）；对象并集；answers 取更长；日期取新
  function mergeStats(server, local) {
    var s = (server && typeof server === 'object') ? server : {};
    var l = (local && typeof local === 'object') ? local : {};
    var out = {};
    var k;
    for (k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) out[k] = s[k]; }
    for (k in l) { if (Object.prototype.hasOwnProperty.call(l, k)) out[k] = l[k]; }
    ['totalSeconds', 'todaySeconds', 'streak'].forEach(function (f) {
      var sv = (typeof s[f] === 'number') ? s[f] : 0, lv = (typeof l[f] === 'number') ? l[f] : 0;
      out[f] = Math.max(sv, lv);
    });
    ['knownWords', 'readingExDone', 'dailySeconds'].forEach(function (f) {
      var so = (s[f] && typeof s[f] === 'object') ? s[f] : {};
      var lo = (l[f] && typeof l[f] === 'object') ? l[f] : {};
      var m = {};
      var k2;
      for (k2 in so) { if (Object.prototype.hasOwnProperty.call(so, k2)) m[k2] = so[k2]; }
      for (k2 in lo) { if (Object.prototype.hasOwnProperty.call(lo, k2)) m[k2] = lo[k2]; }
      if (f === 'dailySeconds') {
        for (k2 in m) {
          var a = (typeof so[k2] === 'number') ? so[k2] : 0;
          var b = (typeof lo[k2] === 'number') ? lo[k2] : 0;
          m[k2] = Math.max(a, b);
        }
      }
      out[f] = m;
    });
    var sa = Array.isArray(s.answers) ? s.answers : [];
    var la = Array.isArray(l.answers) ? l.answers : [];
    out.answers = la.length >= sa.length ? la : sa;
    var sd = s.lastActiveDay || '', ld = l.lastActiveDay || '';
    out.lastActiveDay = ld >= sd ? ld : sd;
    if (l.lastUnit != null) out.lastUnit = l.lastUnit;
    else if (s.lastUnit != null) out.lastUnit = s.lastUnit;
    return out;
  }

  // 档案列表：[{id,name,createdAt}] —— 按 id 并集；同 id 本地优先（保留本地重命名），
  // 云端/本地各自独有的档案都保留。删除不同步（一端删除不会扩散，避免误删他端数据）。
  function mergeProfiles(server, local) {
    var s = Array.isArray(server) ? server : [];
    var l = Array.isArray(local) ? local : [];
    var out = [];
    var seen = {};
    s.forEach(function (p) {
      if (p && p.id && !seen[p.id]) { seen[p.id] = 1; out.push(p); }
    });
    l.forEach(function (p) {
      if (!p || !p.id) return;
      if (seen[p.id]) {
        // 同 id：本地优先（保留本地重命名后的名字）
        for (var i = 0; i < out.length; i++) {
          if (out[i] && out[i].id === p.id) { out[i] = p; break; }
        }
      } else {
        seen[p.id] = 1;
        out.push(p);
      }
    });
    return out;
  }

  function mergeByKey(key, server, local) {
    if (key === 'yxyy_wrongbook_v1') return mergeWrongbook(server, local);
    if (key === 'yxyy_stats_v1') return mergeStats(server, local);
    if (key === 'yxyy_profiles_v1') return mergeProfiles(server, local);
    return (local != null) ? local : server; // 默认本地优先
  }

  function differs(a, b) {
    try { return JSON.stringify(a) !== JSON.stringify(b); } catch (e) { return true; }
  }

  // 登录后：对每个 key 做 本地↔云端合并 → 写回本地并刷新内存 → 若合并结果比云端全则回推云端。
  // 保证：存量数据上云（不再丢失）、多设备合并（不再互相覆盖）。
  function pullAll() {
    if (!loggedIn()) return Promise.resolve();
    var tasks = SYNC_KEYS.map(function (key) {
      var profileId = serverProfileId(key); // 全局 key 用 __global__，档案级 key 用当前档案
      return window.ApiClient.request('GET', '/api/sync/' + key + '?profileId=' + encodeURIComponent(profileId))
        .then(function (r) {
          var serverVersion = (r && r.version) || 0;
          var serverData = (r && r.data != null) ? r.data : null;
          var localRaw = null;
          try { localRaw = localStorage.getItem(pkey(key)); } catch (e) {}
          var localData = null;
          try { localData = localRaw ? JSON.parse(localRaw) : null; } catch (e) { localData = null; }
          var merged = mergeByKey(key, serverData, localData);
          try { localStorage.setItem(pkey(key), JSON.stringify(merged)); } catch (e) {}
          if (differs(merged, serverData)) {
            // 合并结果与云端不同（本地有独有/更新数据）→ 回推云端
            return window.ApiClient.request('PUT', '/api/sync/' + key, {
              profileId: profileId,
              data: merged,
              baseVersion: serverVersion,
            }).then(function (pr) {
              _versions[key] = (pr && pr.version) || (serverVersion + 1);
            }).catch(function () {
              _versions[key] = serverVersion; // 推送失败保留本地，后续 schedulePush 会重试
            });
          }
          _versions[key] = serverVersion;
        })
        .catch(function () { /* 拉取失败不阻断，保留本地 */ });
    });
    return Promise.all(tasks).then(function () { refreshModuleMemory(); });
  }

  // 本地某 key 变更 → 节流推送云端
  function schedulePush(base) {
    if (!loggedIn()) return;
    if (SYNC_KEYS.indexOf(base) < 0) return;
    if (_pushTimers[base]) clearTimeout(_pushTimers[base]);
    _pushTimers[base] = setTimeout(function () {
      _pushTimers[base] = null;
      pushNow(base);
    }, PUSH_DELAY);
  }

  function pushNow(base) {
    if (!loggedIn()) return Promise.resolve();
    var profileId = serverProfileId(base);
    var raw;
    try { raw = localStorage.getItem(pkey(base)); } catch (e) { raw = null; }
    var data; try { data = raw ? JSON.parse(raw) : {}; } catch (e) { data = {}; }
    return window.ApiClient.request('PUT', '/api/sync/' + base, {
      profileId: profileId,
      data: data,
      baseVersion: _versions[base] || 0,
    }).then(function (r) {
      _versions[base] = r.version || (_versions[base] || 0) + 1;
    }).catch(function (err) {
      // 版本冲突（409）：服务端更新更晚 → 用服务端数据与本地合并后刷新本地
      if (err && err.status === 409) {
        try {
          var payload = JSON.parse(err.body && err.body.error && err.body.error.message);
          if (payload && payload.serverData != null) {
            var localRaw = null;
            try { localRaw = localStorage.getItem(pkey(base)); } catch (e) {}
            var localData = null;
            try { localData = localRaw ? JSON.parse(localRaw) : null; } catch (e) {}
            var merged = mergeByKey(base, payload.serverData, localData);
            localStorage.setItem(pkey(base), JSON.stringify(merged));
            _versions[base] = payload.serverVersion || _versions[base];
            refreshModuleMemory();
          }
        } catch (e) {}
      }
    });
  }

  // 登录成功后调用：本地↔云端合并（存量上云）+ 后续启用推送
  function onLogin() {
    return pullAll();
  }

  // 登出：清版本记录（不动本地数据，用户仍可本地使用）
  function onLogout() {
    _versions = {};
  }

  // —— 自动拉取：页面从后台切回前台（visibilitychange/focus）时自动与云端合并 ——
  // 解决「A 浏览器推了错题、B 浏览器开着页面却不知道」的缺口。30s 节流防频繁拉取。
  var PULL_INTERVAL = 30000;
  var _lastPullAt = 0;
  function maybeAutoPull() {
    if (!loggedIn()) return;
    var now = Date.now();
    if (now - _lastPullAt < PULL_INTERVAL) return;
    _lastPullAt = now;
    pullAll();
  }
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') maybeAutoPull();
    });
    window.addEventListener('focus', maybeAutoPull);
  } catch (e) {}

  window.CloudSync = {
    keys: SYNC_KEYS,
    pullAll: pullAll,
    schedulePush: schedulePush,
    pushNow: pushNow,
    onLogin: onLogin,
    onLogout: onLogout,
    isEnabled: loggedIn,
  };
})();
