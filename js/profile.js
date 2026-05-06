/**
 * profile.js — 多用户档案数据层（v01.20）
 *
 * 职责：
 *   - 维护「档案列表」「当前激活档案 id」「老数据迁移标记」三组元数据
 *   - 提供 list / active / setActive / create / update / remove / migrateLegacyOnce 七个 API
 *   - 删除档案时自动清理对应的 :id 后缀数据 key（wrongbook / stats / ctx）
 *
 * 设计纪律（来自 PROJECT_STATUS.md §10 v01.20 复盘）：
 *   1. IIFE 内 **零副作用** —— 不自动 migrate / 不自动写默认档案 / 不自动 setActive
 *   2. 所有写操作只在外部显式调用时执行（如 bootstrap 调 migrateLegacyOnce()）
 *   3. 任何异常都用 try-catch 兜底，绝不让 app.js 顶层 onerror
 *   4. 仅依赖 localStorage，不依赖 ProfileManager 外的任何全局
 *
 * 暴露：window.ProfileManager
 */
(function () {
  'use strict';

  // ============ 元数据 key ============
  var KEY_PROFILES = 'yxyy_profiles_v1';            // 档案列表 [{id,name,createdAt}]
  var KEY_ACTIVE   = 'yxyy_active_profile_v1';      // 当前激活档案 id
  var KEY_MIGRATED = 'yxyy_migrated_legacy_v1';     // 迁移完成标记（"1" 即已迁移）

  // ============ 受迁移影响的「业务数据 key」base 列表 ============
  // 这三对 key 在 app.js 中通过 _pkey() 加 :profileId 后缀；
  // 删除档案时也按此清单清掉 :id 后缀数据。
  var DATA_KEYS = ['yxyy_wrongbook_v1', 'yxyy_stats_v1', 'yxyy_ctx'];

  // ============ 内部工具 ============
  function _readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[ProfileManager] _readJSON failed for', key, e);
      return fallback;
    }
  }

  function _writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[ProfileManager] _writeJSON failed for', key, e);
      return false;
    }
  }

  function _genId() {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  function _ensureDefaultProfile() {
    // 内部工具：确保至少有一个档案 + 有 active id；只在被调用时执行，IIFE 不自动调用。
    var list = _readJSON(KEY_PROFILES, null);
    if (!Array.isArray(list) || list.length === 0) {
      list = [{ id: 'default', name: '默认档案', createdAt: Date.now() }];
      _writeJSON(KEY_PROFILES, list);
    }
    var activeId = localStorage.getItem(KEY_ACTIVE);
    var hit = list.some(function (p) { return p && p.id === activeId; });
    if (!activeId || !hit) {
      try { localStorage.setItem(KEY_ACTIVE, list[0].id); } catch (e) {}
    }
    return list;
  }

  // ============ 公开 API ============
  var ProfileManager = {

    /**
     * 返回档案列表（数组）。第一次调用时若空则会写入「默认档案」。
     */
    list: function () {
      return _ensureDefaultProfile();
    },

    /**
     * 返回当前激活档案对象 {id,name,createdAt}。
     * 永不返回 null：若一切异常会回退到 {id:'default',name:'默认档案',createdAt:0}
     */
    active: function () {
      try {
        var list = _ensureDefaultProfile();
        var id = localStorage.getItem(KEY_ACTIVE) || list[0].id;
        var hit = null;
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].id === id) { hit = list[i]; break; }
        }
        return hit || list[0];
      } catch (e) {
        console.warn('[ProfileManager] active() fallback', e);
        return { id: 'default', name: '默认档案', createdAt: 0 };
      }
    },

    /**
     * 切换当前激活档案。返回是否成功。
     * 注意：不负责重新加载业务数据，那是 app.js 中 switchToProfile() 的责任。
     */
    setActive: function (id) {
      if (!id) return false;
      var list = _ensureDefaultProfile();
      var hit = list.some(function (p) { return p && p.id === id; });
      if (!hit) return false;
      try { localStorage.setItem(KEY_ACTIVE, id); return true; }
      catch (e) { return false; }
    },

    /**
     * 新建档案。name 去空白后非空才创建。返回新档案对象（失败返回 null）。
     */
    create: function (name) {
      var trimmed = (name || '').trim();
      if (!trimmed) return null;
      var list = _ensureDefaultProfile();
      // 同名允许（避免误判），但 id 必然不重复
      var prof = { id: _genId(), name: trimmed, createdAt: Date.now() };
      list.push(prof);
      _writeJSON(KEY_PROFILES, list);
      return prof;
    },

    /**
     * 修改档案信息（目前仅支持改 name）。
     */
    update: function (id, patch) {
      if (!id || !patch) return false;
      var list = _ensureDefaultProfile();
      var changed = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id === id) {
          if (typeof patch.name === 'string') {
            var n = patch.name.trim();
            if (n) { list[i].name = n; changed = true; }
          }
          break;
        }
      }
      if (changed) _writeJSON(KEY_PROFILES, list);
      return changed;
    },

    /**
     * 删除档案。规则：
     *   - 至少保留 1 个档案，全删时拒绝
     *   - 若删除当前激活档案，自动切到列表第一个剩余档案
     *   - 同步清理该档案对应的 yxyy_wrongbook_v1:id / yxyy_stats_v1:id / yxyy_ctx:id 三个 key
     */
    remove: function (id) {
      if (!id) return false;
      var list = _ensureDefaultProfile();
      if (list.length <= 1) return false;            // 保护：不允许删到 0 个
      var idx = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id === id) { idx = i; break; }
      }
      if (idx === -1) return false;

      list.splice(idx, 1);
      _writeJSON(KEY_PROFILES, list);

      // 清理对应数据
      for (var k = 0; k < DATA_KEYS.length; k++) {
        try { localStorage.removeItem(DATA_KEYS[k] + ':' + id); } catch (e) {}
      }

      // 若删的是当前激活档案，切到剩余的第一个
      var curActive = localStorage.getItem(KEY_ACTIVE);
      if (curActive === id) {
        try { localStorage.setItem(KEY_ACTIVE, list[0].id); } catch (e) {}
      }
      return true;
    },

    /**
     * 老数据一次性迁移：把无后缀的旧 key 搬到 :default。
     * 幂等：第二次调用直接返回 false。
     * 必须由 bootstrap() 在 loadCtx() 之前显式调用。
     */
    migrateLegacyOnce: function () {
      try {
        if (localStorage.getItem(KEY_MIGRATED) === '1') return false;

        // 确保 default 档案存在并设为 active（如果当前没 active）
        var list = _readJSON(KEY_PROFILES, null);
        if (!Array.isArray(list) || list.length === 0) {
          list = [{ id: 'default', name: '默认档案', createdAt: Date.now() }];
          _writeJSON(KEY_PROFILES, list);
        }
        if (!localStorage.getItem(KEY_ACTIVE)) {
          try { localStorage.setItem(KEY_ACTIVE, 'default'); } catch (e) {}
        }

        // 把无后缀的老数据搬到 :default（仅在目标不存在且源存在时搬）
        for (var i = 0; i < DATA_KEYS.length; i++) {
          var base = DATA_KEYS[i];
          var dst = base + ':default';
          var hasOld = localStorage.getItem(base);
          var hasNew = localStorage.getItem(dst);
          if (hasOld != null && hasNew == null) {
            try { localStorage.setItem(dst, hasOld); } catch (e) {}
          }
          // 不删除老 key，留作 fallback / 用户手动恢复入口
        }

        try { localStorage.setItem(KEY_MIGRATED, '1'); } catch (e) {}
        return true;
      } catch (e) {
        console.warn('[ProfileManager] migrateLegacyOnce failed', e);
        return false;
      }
    },

    // 调试/测试用：暴露常量便于 Console 排查（不影响主流程）
    _DEBUG: {
      KEY_PROFILES: KEY_PROFILES,
      KEY_ACTIVE: KEY_ACTIVE,
      KEY_MIGRATED: KEY_MIGRATED,
      DATA_KEYS: DATA_KEYS
    }
  };

  // 仅暴露，不做任何 localStorage 写入（关键纪律）
  window.ProfileManager = ProfileManager;
})();
