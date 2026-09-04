/* =========================================================
 * theme.js · 多主题（换肤）管理器
 * ---------------------------------------------------------
 * 职责：主题列表 / 读取 / 应用 / 保存偏好（localStorage: yxyy_theme_v1）
 * 通过在 <html> 上设置 data-theme 切换 styles.css 里的 [data-theme] 变量组。
 * 约定：经典脚本（非 ES Module），顶层 window.ThemeManager 全局可用。
 * 首屏防 FOUC 的预应用在 index.html <head> 内联脚本已处理，本模块负责运行时切换。
 * ========================================================= */
(function () {
  var STORAGE_KEY = 'yxyy_theme_v1';

  // 主题清单（id 必须与 styles.css 的 [data-theme="id"] 一致；sunny=默认:root）
  var THEMES = [
    { id: 'sunny',     name: '晴空蓝',   desc: '清新活泼（默认）', c1: '#3b82f6', c2: '#6366f1' },
    { id: 'vermilion', name: '朱砂橘红', desc: '中国红·国潮',     c1: '#e2483a', c2: '#f97316' },
    { id: 'celadon',   name: '青瓷青绿', desc: '青瓷·山水雅致',   c1: '#0d9488', c2: '#14b8a6' },
    { id: 'ink',       name: '水墨黛',   desc: '水墨·护眼深色',   c1: '#475569', c2: '#1e293b' },
    { id: 'navy',      name: '藏青金',   desc: '沉稳·华贵',       c1: '#1e3a8a', c2: '#c9a227' },
    { id: 'rouge',     name: '胭脂粉',   desc: '柔和·暖调',       c1: '#db2777', c2: '#f472b6' }
  ];
  var VALID = THEMES.map(function (t) { return t.id; });
  var DEFAULT = 'sunny';

  function list() { return THEMES.slice(); }

  // Phase3：主题按档案隔离（_pkey 加 :profileId 后缀），兼容旧全局 key 一次性迁移
  function _scopedKey() {
    try { return (typeof _pkey === 'function') ? _pkey(STORAGE_KEY) : STORAGE_KEY; } catch (e) { return STORAGE_KEY; }
  }

  // 读取的值可能是被旧版同步逻辑污染的双重编码（'"ink"'），做一次 JSON 还原自愈
  function _normalize(v) {
    if (typeof v === 'string' && v.length > 1 && v.charAt(0) === '"') {
      try { var p = JSON.parse(v); if (typeof p === 'string') return p; } catch (e) {}
    }
    return v;
  }

  // Phase3 信封存储：{v:'rouge', t:epochMs}（t 供云端 last-writer-wins 合并）；
  // 兼容旧裸串/双重编码（视为 t=0 最旧，不遮挡他端新数据）
  function _read() {
    try {
      var raw = _normalize(localStorage.getItem(_scopedKey()));
      if (raw) {
        if (raw.charAt(0) === '{') {
          try {
            var o = JSON.parse(raw);
            if (o && typeof o.v === 'string' && VALID.indexOf(o.v) >= 0) return { v: o.v, t: o.t || 0 };
          } catch (e) {}
        }
        if (VALID.indexOf(raw) >= 0) return { v: raw, t: 0 };
      }
      // 旧全局 key 迁移：包信封（t=0）写入当前档案并沿用（只迁移一次）
      var legacy = _normalize(localStorage.getItem(STORAGE_KEY));
      if (legacy && VALID.indexOf(legacy) >= 0) {
        var env = { v: legacy, t: 0 };
        try { localStorage.setItem(_scopedKey(), JSON.stringify(env)); } catch (e) {}
        return env;
      }
    } catch (e) {}
    return { v: DEFAULT, t: 0 };
  }

  function get() { return _read().v; }

  // 仅设置 <html data-theme>（sunny 用默认，移除属性即可）
  function apply(id) {
    if (VALID.indexOf(id) < 0) id = DEFAULT;
    try {
      if (id === DEFAULT) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', id);
    } catch (e) {}
    return id;
  }

  // 切换主题：应用 + 持久化（按档案）+ 广播事件（供 UI 刷新高亮）
  function set(id) {
    if (VALID.indexOf(id) < 0) id = DEFAULT;
    apply(id);
    try { localStorage.setItem(_scopedKey(), JSON.stringify({ v: id, t: Date.now() })); } catch (e) {}
    // Phase3 云同步：写后节流推送云端（未登录时 no-op）
    try { if (window.CloudSync) window.CloudSync.schedulePush(STORAGE_KEY); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { id: id } }));
    } catch (e) {}
    return id;
  }

  // 初始应用（与 <head> 预应用一致，兜底确保运行时也对齐）
  apply(get());

  window.ThemeManager = { list: list, get: get, set: set, apply: apply, DEFAULT: DEFAULT };
})();
