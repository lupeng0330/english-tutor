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

  function get() {
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      if (t && VALID.indexOf(t) >= 0) return t;
    } catch (e) {}
    return DEFAULT;
  }

  // 仅设置 <html data-theme>（sunny 用默认，移除属性即可）
  function apply(id) {
    if (VALID.indexOf(id) < 0) id = DEFAULT;
    try {
      if (id === DEFAULT) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', id);
    } catch (e) {}
    return id;
  }

  // 切换主题：应用 + 持久化 + 广播事件（供 UI 刷新高亮）
  function set(id) {
    if (VALID.indexOf(id) < 0) id = DEFAULT;
    apply(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { id: id } }));
    } catch (e) {}
    return id;
  }

  // 初始应用（与 <head> 预应用一致，兜底确保运行时也对齐）
  apply(get());

  window.ThemeManager = { list: list, get: get, set: set, apply: apply, DEFAULT: DEFAULT };
})();
