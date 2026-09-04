/* =========================================================
 * 乐学英语 · storage.js（P2-1 前端 Storage 抽象层，v01.32）
 * ---------------------------------------------------------
 * 职责：把散落在 15 个模块里的 localStorage 直接调用统一到 window.YXStorage 之下。
 *
 * 设计原则（最小侵入 · 渐进增强）：
 *   1) 不改变任何业务模块的既有 key 与既有行为；纯新增能力层。
 *   2) 集中承接三类知识：
 *      ① GLOBAL_KEYS  —— 全局 key（档案元数据 + 云端 token 等，无 profile 后缀）
 *      ② PROFILE_SCOPED_KEYS —— 档案级 key（存储时自动加 :profileId 后缀）
 *      ③ ENVELOPE_KEYS —— 信封值 {v,t}（云同步 last-writer-wins；theme/smartpick 使用）
 *   3) 老模块内部的 _pkey() / _scopedKey() 逻辑不动；core.js 的全局 _pkey 委托到本层的 keyOf，
 *      从而所有既有模块透明地经过统一入口，风险最低。
 *   4) 所有 IO 均 try/catch 兜底：读失败 → fallback；写失败 → console.warn + 返回 false；
 *      任何异常都不允许把调用点顶层 onerror。
 *
 * 加载顺序（index.html 已保证）：
 *     textbook → state → profile → **storage** → theme → player → core → api-client → ...
 *   —— profile.js 在前（提供 ProfileManager.active().id）；core.js 在后（其 _pkey 委托到本层）。
 *
 * 暴露：window.YXStorage
 *   分类：       isGlobal(base) / isScoped(base) / isEnvelope(base)
 *   key 生成：   keyOf(base, profileId?)
 *   主 API：     get(base, fallback?) / set(base, value) / remove(base)
 *   原始 API：   getRaw(key) / setRaw(key, val) / removeRaw(key)   —— 用于 token 等标量场景
 *   信封 API：   setEnvelope(base, v) / getEnvelope(base) / getEnvelopeValue(base, fallback?)
 *   档案清理：   removeProfileData(profileId)
 *   常量：       GLOBAL_KEYS / PROFILE_SCOPED_KEYS / ENVELOPE_KEYS
 *   调试：       _debugAll() / _debugProfile(id)
 * ========================================================= */
(function () {
  'use strict';

  // ============ Key 分类白名单 ============
  // GLOBAL：无 profile 后缀（跨档案共享的元数据/登录态/全局设置）
  var GLOBAL_KEYS = [
    // 档案元数据（profile.js 拥有）
    'yxyy_profiles_v1',           // 档案列表
    'yxyy_active_profile_v1',     // 当前激活档案 id
    'yxyy_migrated_legacy_v1',    // legacy → :default 迁移标记
    // 云端登录态（api-client.js 拥有；跨档案共享）
    'yxyy_cloud_access_v1',
    'yxyy_cloud_refresh_v1',
    'yxyy_cloud_user_v1'
    // 说明：offline-audio 的 audio-meta-key / mobile.html 的 QR 折叠状态是"局部全局"，
    //       它们仍走自己的 localStorage.getItem/setItem，本层暂不接管，避免破坏 SW/离线包机制。
  ];

  // PROFILE_SCOPED：写入时会追加 :profileId 后缀（与既有 _pkey 惯例完全一致）
  // 与 profile.js 的 DATA_KEYS、sync-client.js 的 PROFILE_SCOPED_KEYS 保持同步；三处均为白名单来源。
  var PROFILE_SCOPED_KEYS = [
    'yxyy_wrongbook_v1',   // 错题本
    'yxyy_stats_v1',       // 学习统计
    'yxyy_ctx',            // 学习上下文（年级/学期/教材）
    'yxyy_mastery_v1',     // 单词掌握度
    'yxyy_smartpick_v1',   // 智能推题开关（envelope）
    'yxyy_srs_v1',         // 记忆曲线 SRS
    'yxyy_theme_v1',       // 主题（envelope）
    'yxyy_exam_history'    // 考试历史
  ];

  // ENVELOPE：值以 {v: 实际值, t: epochMs} 包裹，云同步做 last-writer-wins
  var ENVELOPE_KEYS = ['yxyy_theme_v1', 'yxyy_smartpick_v1'];

  // ============ 内部工具 ============
  function _activeProfileId() {
    try {
      return (window.ProfileManager
              && typeof window.ProfileManager.active === 'function'
              && window.ProfileManager.active().id) || 'default';
    } catch (e) { return 'default'; }
  }

  function isGlobal(base) { return GLOBAL_KEYS.indexOf(base) >= 0; }
  function isScoped(base) { return PROFILE_SCOPED_KEYS.indexOf(base) >= 0; }
  function isEnvelope(base) { return ENVELOPE_KEYS.indexOf(base) >= 0; }

  /**
   * 生成实际 localStorage key。
   * - 白名单命中 GLOBAL：直接返回 base（无后缀）
   * - 其他（含白名单 SCOPED 与未注册的新 base）：追加 :profileId 后缀
   *   —— 未注册默认按 SCOPED 处理，兼容 exam.js 里 'yxyy_exam_history' 早于 v01.32 写死的用法。
   */
  function keyOf(base, profileId) {
    if (isGlobal(base)) return base;
    var pid = profileId || _activeProfileId();
    return base + ':' + pid;
  }

  // ============ 原始 API（不做 JSON 编解码；用于 token 等标量） ============
  function getRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function setRaw(key, val) {
    try { localStorage.setItem(key, val); return true; }
    catch (e) { try { console.warn('[YXStorage] setRaw failed for', key, e); } catch (_) {} return false; }
  }
  function removeRaw(key) { try { localStorage.removeItem(key); } catch (e) {} }

  // ============ JSON API（base → keyOf 自动映射，含 try/catch） ============
  function get(base, fallback) {
    try {
      var raw = localStorage.getItem(keyOf(base));
      if (raw == null) return (fallback === undefined ? null : fallback);
      try { return JSON.parse(raw); }
      catch (e) {
        // 兼容历史「裸串」写法（如旧版 theme='ink'），原样返回让上层自己处理
        return raw;
      }
    } catch (e) { return (fallback === undefined ? null : fallback); }
  }
  function set(base, value) {
    try {
      var s = (typeof value === 'string') ? value : JSON.stringify(value);
      localStorage.setItem(keyOf(base), s);
      return true;
    } catch (e) {
      try { console.warn('[YXStorage] set failed for', base, e); } catch (_) {}
      return false;
    }
  }
  function remove(base) { try { localStorage.removeItem(keyOf(base)); } catch (e) {} }

  // ============ 信封 API（{v,t}，供云同步 last-writer-wins） ============
  function setEnvelope(base, v) {
    return set(base, { v: v, t: Date.now() });
  }
  /**
   * 读信封。支持三种历史形态：
   *   ① 标准 {v,t}                → 原样返回
   *   ② 双重编码字符串 '"rouge"'   → 视为 {v:'rouge', t:0}
   *   ③ 旧裸串 'rouge'            → 视为 {v:'rouge', t:0}
   * 无值返回 fallback（默认 null）。
   */
  function getEnvelope(base, fallback) {
    var raw;
    try { raw = localStorage.getItem(keyOf(base)); }
    catch (e) { raw = null; }
    if (raw == null) return (fallback === undefined ? null : fallback);
    // 双重编码自愈
    var s = String(raw);
    if (s.length > 1 && s.charAt(0) === '"') {
      try { var p = JSON.parse(s); if (typeof p === 'string') s = p; } catch (e) {}
    }
    if (s.charAt(0) === '{') {
      try {
        var o = JSON.parse(s);
        if (o && typeof o.v !== 'undefined') return { v: o.v, t: o.t || 0 };
      } catch (e) {}
      return (fallback === undefined ? null : fallback);
    }
    return { v: s, t: 0 };
  }
  function getEnvelopeValue(base, fallback) {
    var env = getEnvelope(base, null);
    return env ? env.v : (fallback === undefined ? null : fallback);
  }

  // ============ 档案数据清理（删档时用；与 profile.js remove() 语义一致） ============
  function removeProfileData(profileId) {
    if (!profileId) return;
    for (var i = 0; i < PROFILE_SCOPED_KEYS.length; i++) {
      try { localStorage.removeItem(PROFILE_SCOPED_KEYS[i] + ':' + profileId); } catch (e) {}
    }
  }

  // ============ 调试（Console 排查用） ============
  function _debugAll() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('yxyy_') === 0)) {
          try { out[k] = localStorage.getItem(k); } catch (e) {}
        }
      }
    } catch (e) {}
    return out;
  }
  function _debugProfile(id) {
    id = id || _activeProfileId();
    var out = { profileId: id };
    for (var i = 0; i < PROFILE_SCOPED_KEYS.length; i++) {
      var base = PROFILE_SCOPED_KEYS[i];
      try { out[base] = localStorage.getItem(base + ':' + id); } catch (e) {}
    }
    return out;
  }

  // ============ 导出 ============
  window.YXStorage = {
    // 分类查询
    isGlobal: isGlobal,
    isScoped: isScoped,
    isEnvelope: isEnvelope,
    // Key 生成
    keyOf: keyOf,
    // JSON 主 API
    get: get,
    set: set,
    remove: remove,
    // 原始 API（token 等标量）
    getRaw: getRaw,
    setRaw: setRaw,
    removeRaw: removeRaw,
    // 信封 API
    setEnvelope: setEnvelope,
    getEnvelope: getEnvelope,
    getEnvelopeValue: getEnvelopeValue,
    // 档案清理
    removeProfileData: removeProfileData,
    // 常量
    GLOBAL_KEYS: GLOBAL_KEYS.slice(),
    PROFILE_SCOPED_KEYS: PROFILE_SCOPED_KEYS.slice(),
    ENVELOPE_KEYS: ENVELOPE_KEYS.slice(),
    // 调试
    _debugAll: _debugAll,
    _debugProfile: _debugProfile
  };
})();
