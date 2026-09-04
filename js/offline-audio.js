// ============================================================
// offline-audio.js · Phase 3.5 按册离线语音包
// ------------------------------------------------------------
// Web/PWA：音频写入独立、跨应用版本保留的 Cache Storage。
// Capacitor：audio 目录随安装包提供，界面仅展示“随包可用”。
// ============================================================
(function () {
  'use strict';

  var CACHE_NAME = 'lexue-audio-offline-v1';
  var DATA_CACHE_NAME = 'lexue-data-offline-v1';
  var META_KEY = 'yxyy_offline_audio_packs_v1';
  var MANIFEST_URL = 'data/offline-audio-packs.json';
  var _manifestPromise = null;
  var _task = null;

  function isNative() {
    try {
      return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    } catch (_) { return false; }
  }

  function supported() {
    return !isNative() && !!(window.caches && window.fetch && window.Promise && window.AbortController);
  }

  function withVersion(url) {
    return window.__withVer ? window.__withVer(url) : url;
  }

  function canonicalUrl(path) {
    return new URL(path, document.baseURI).href;
  }

  function validateManifest(data) {
    if (!data || data.schemaVersion !== 2 || data.cacheName !== CACHE_NAME || data.dataCacheName !== DATA_CACHE_NAME || !Array.isArray(data.packs) || !data.assets) {
      throw new Error('离线语音包清单格式不兼容');
    }
    if (data.packCount !== data.packs.length || !Number.isFinite(data.bytes) || !Number.isFinite(data.dataBytes)) {
      throw new Error('离线语音包清单汇总无效');
    }
    var ids = new Set();
    data.packs.forEach(function (pack) {
      if (!pack) throw new Error('离线语音包条目无效');
      var expectedId = pack.textbook + '-g' + pack.grade + '-' + pack.term;
      if (pack.id !== expectedId || !/^[a-z0-9-]+-[上下]$/.test(pack.id || '') || ids.has(pack.id) || !Array.isArray(pack.files) || !Array.isArray(pack.dataFiles) || !/^[a-f0-9]{16}$/.test(pack.revision || '')) {
        throw new Error('离线语音包条目无效');
      }
      ids.add(pack.id);
      if (pack.fileCount !== pack.files.length || pack.dataFileCount !== pack.dataFiles.length || !pack.files.length || !pack.dataFiles.length) {
        throw new Error('离线语音包文件计数无效');
      }
      var seen = new Set();
      pack.files.concat(pack.dataFiles).forEach(function (file) {
        var audioOk = /^audio\/[A-Za-z0-9_.-]+\.mp3$/.test(file);
        var dataOk = /^data\/[A-Za-z0-9_./-]+\.json$/.test(file) && file.indexOf('..') < 0;
        var asset = data.assets[file];
        if ((!audioOk && !dataOk) || seen.has(file) || !asset || !Number.isFinite(asset.bytes) || !/^[a-f0-9]{16}$/.test(asset.revision || '')) {
          throw new Error('离线资源条目无效');
        }
        seen.add(file);
      });
    });
    return data;
  }

  function loadManifest() {
    if (!_manifestPromise) {
      _manifestPromise = fetch(withVersion(MANIFEST_URL), { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('离线语音包清单加载失败（HTTP ' + res.status + '）');
          return res.json();
        })
        .then(validateManifest)
        .catch(function (err) {
          _manifestPromise = null; // 网络恢复后允许不刷新页面直接重试
          throw err;
        });
    }
    return _manifestPromise;
  }

  // 元数据记录“已开始/已完成”的包及其内容修订号；兼容旧版字符串数组。
  function readMeta() {
    try {
      var value = JSON.parse(localStorage.getItem(META_KEY) || '{}');
      if (Array.isArray(value)) {
        var migrated = { packs: {}, assets: {} };
        value.forEach(function (id) { migrated.packs[id] = { status: 'complete', revision: '' }; });
        return migrated;
      }
      if (value && value.packs && typeof value.packs === 'object') {
        if (!value.assets || typeof value.assets !== 'object') value.assets = {};
        return value;
      }
    } catch (_) {}
    return { packs: {}, assets: {} };
  }

  function writeMeta(meta) {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
      return true;
    } catch (_) { return false; }
  }

  function trackedIds(meta) { return Object.keys((meta && meta.packs) || {}); }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatBytes(bytes) {
    bytes = Number(bytes) || 0;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(bytes >= 100 * 1024 * 1024 ? 0 : 1) + ' MB';
  }

  function getCurrentPack(manifest) {
    // state 由经典脚本用顶层 let 声明，不一定映射为 window.state。
    var ctx = (typeof state !== 'undefined' && state && state.ctx) ? state.ctx : null;
    if (!ctx) return null;
    var id = ctx.textbook + '-g' + ctx.grade + '-' + ctx.term;
    return (manifest.packs || []).find(function (pack) { return pack.id === id; }) || null;
  }

  async function cachedUrlSet(cache) {
    var requests = await cache.keys();
    var result = new Set();
    requests.forEach(function (req) {
      try {
        var url = new URL(req.url);
        result.add(url.origin + url.pathname);
      } catch (_) {}
    });
    return result;
  }

  function fileKey(path) {
    var url = new URL(canonicalUrl(path));
    return url.origin + url.pathname;
  }

  async function getSnapshot(manifest) {
    if (isNative()) {
      return { native: true, cached: new Set(), cachedData: new Set(), cachedBytes: (manifest.bytes || 0) + (manifest.dataBytes || 0), meta: { packs: {}, assets: {} }, installed: (manifest.packs || []).map(function (p) { return p.id; }) };
    }
    if (!supported()) return { unsupported: true, cached: new Set(), cachedData: new Set(), cachedBytes: 0, meta: { packs: {}, assets: {} }, installed: [] };
    var audioCache = await caches.open(CACHE_NAME);
    var dataCache = await caches.open(DATA_CACHE_NAME);
    var cached = await cachedUrlSet(audioCache);
    var cachedData = await cachedUrlSet(dataCache);
    var cachedBytes = Object.keys(manifest.assets || {}).reduce(function (sum, file) {
      var set = file.indexOf('audio/') === 0 ? cached : cachedData;
      return sum + (set.has(fileKey(file)) ? (manifest.assets[file].bytes || 0) : 0);
    }, 0);
    var meta = readMeta();
    return { cached: cached, cachedData: cachedData, cachedBytes: cachedBytes, meta: meta, installed: trackedIds(meta) };
  }

  function packProgress(pack, snapshot) {
    var total = pack.fileCount + pack.dataFileCount;
    if (snapshot.native) return { count: total, total: total, audioCount: pack.fileCount, complete: true, stale: false };
    var audioCount = (pack.files || []).reduce(function (sum, file) {
      return sum + (snapshot.cached.has(fileKey(file)) ? 1 : 0);
    }, 0);
    var dataCount = (pack.dataFiles || []).reduce(function (sum, file) {
      return sum + (snapshot.cachedData.has(fileKey(file)) ? 1 : 0);
    }, 0);
    var record = snapshot.meta && snapshot.meta.packs && snapshot.meta.packs[pack.id];
    var stale = !!(record && record.status === 'complete' && record.revision !== pack.revision);
    var count = audioCount + dataCount;
    var complete = total > 0 && count === total && !!record && record.status === 'complete' && !stale;
    return { count: count, total: total, audioCount: audioCount, complete: complete, stale: stale };
  }

  async function updateSummary(target) {
    if (!target) return;
    try {
      var manifest = await loadManifest();
      var pack = getCurrentPack(manifest);
      if (!pack) {
        target.textContent = '当前教材暂无语音包';
        return;
      }
      if (isNative()) {
        target.textContent = pack.label + '音频已随应用安装';
        return;
      }
      if (!supported()) {
        target.textContent = '当前浏览器不支持离线缓存';
        return;
      }
      var snapshot = await getSnapshot(manifest);
      var progress = packProgress(pack, snapshot);
      if (progress.complete) target.textContent = pack.label + '已离线可用 · ' + formatBytes(pack.totalBytes);
      else if (progress.stale) target.textContent = pack.label + '语音有更新 · 点击管理';
      else if (progress.count) target.textContent = pack.label + '已下载 ' + progress.count + '/' + progress.total;
      else target.textContent = pack.label + '可下载 · ' + formatBytes(pack.totalBytes);
    } catch (err) {
      target.textContent = (err && err.message) || '离线语音状态读取失败';
    }
  }

  function ensureModal() {
    var old = document.getElementById('offlineAudioModal');
    if (old) return old;
    var wrap = document.createElement('div');
    wrap.id = 'offlineAudioModal';
    wrap.className = 'offline-audio-modal hide';
    wrap.innerHTML =
      '<div class="offline-audio-backdrop" data-offline-close></div>' +
      '<section class="offline-audio-dialog" role="dialog" aria-modal="true" aria-labelledby="offlineAudioTitle">' +
        '<div class="offline-audio-head">' +
          '<div><h2 id="offlineAudioTitle">离线语音包</h2><p>按册下载后，断网也能播放已有的课文、单词、例句和听力 MP3。</p></div>' +
          '<button type="button" class="offline-audio-close" data-offline-close aria-label="关闭">×</button>' +
        '</div>' +
        '<div id="offlineAudioStorage" class="offline-audio-storage">正在读取存储空间…</div>' +
        '<div id="offlineAudioMessage" class="offline-audio-message" aria-live="polite"></div>' +
        '<div id="offlineAudioList" class="offline-audio-list"></div>' +
        '<div class="offline-audio-foot"><button id="offlineAudioClear" type="button" class="offline-audio-clear">删除全部下载</button></div>' +
      '</section>';
    document.body.appendChild(wrap);
    wrap.querySelectorAll('[data-offline-close]').forEach(function (el) {
      el.addEventListener('click', closeManager);
    });
    var clear = wrap.querySelector('#offlineAudioClear');
    if (clear) clear.addEventListener('click', clearAll);
    return wrap;
  }

  function setMessage(text, kind) {
    var el = document.getElementById('offlineAudioMessage');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'offline-audio-message' + (kind ? ' ' + kind : '');
  }

  async function storageText(snapshot) {
    if (snapshot.native) return '移动端安装包已内置全部语音，无需额外下载（计入应用安装空间）。';
    var text = '离线语音已占用约 ' + formatBytes(snapshot.cachedBytes);
    try {
      if (navigator.storage && navigator.storage.estimate) {
        var estimate = await navigator.storage.estimate();
        if (estimate.quota) text += ' · 浏览器可用约 ' + formatBytes(Math.max(0, estimate.quota - (estimate.usage || 0)));
      }
    } catch (_) {}
    return text;
  }

  async function renderManager() {
    var modal = ensureModal();
    var list = modal.querySelector('#offlineAudioList');
    var storage = modal.querySelector('#offlineAudioStorage');
    var clear = modal.querySelector('#offlineAudioClear');
    try {
      var manifest = await loadManifest();
      var snapshot = await getSnapshot(manifest);
      storage.textContent = await storageText(snapshot);
      if (clear) clear.disabled = snapshot.native || (snapshot.cached.size === 0 && snapshot.cachedData.size === 0) || !!_task;
      var current = getCurrentPack(manifest);
      var groups = [];
      (manifest.packs || []).forEach(function (pack) {
        var group = groups.find(function (item) { return item.name === pack.textbookName; });
        if (!group) { group = { name: pack.textbookName, packs: [] }; groups.push(group); }
        group.packs.push(pack);
      });
      list.innerHTML = groups.map(function (group) {
        return '<div class="offline-audio-group"><h3>' + escapeHtml(group.name) + '</h3>' + group.packs.map(function (pack) {
          var progress = packProgress(pack, snapshot);
          var isCurrent = current && current.id === pack.id;
          var stateText = snapshot.native ? '随包可用' : (progress.complete ? '已下载' : (progress.stale ? '有更新' : (progress.count ? '已下载 ' + progress.count + '/' + progress.total : '未下载')));
          var safeId = escapeHtml(pack.id);
          var action = '';
          if (!snapshot.native && !snapshot.unsupported) {
            if (progress.complete) {
              action = '<div class="offline-pack-actions"><button type="button" class="offline-pack-btn danger" data-offline-remove="' + safeId + '">删除</button></div>';
            } else {
              action = '<div class="offline-pack-actions"><button type="button" class="offline-pack-btn" data-offline-download="' + safeId + '">' + (progress.stale ? '更新' : (progress.count ? '继续下载' : '下载')) + '</button>' +
                (progress.count ? '<button type="button" class="offline-pack-link" data-offline-remove="' + safeId + '">删除</button>' : '') + '</div>';
            }
          }
          return '<div class="offline-pack-row' + (isCurrent ? ' current' : '') + '">' +
            '<div class="offline-pack-main"><div class="offline-pack-name">' + escapeHtml(pack.label) + (isCurrent ? '<span>当前</span>' : '') + '</div>' +
            '<div class="offline-pack-meta">' + pack.fileCount + ' 个音频 + 学习数据 · ' + formatBytes(pack.totalBytes) + ' · ' + stateText + '</div></div>' + action + '</div>';
        }).join('') + '</div>';
      }).join('');
      list.querySelectorAll('[data-offline-download]').forEach(function (button) {
        button.disabled = !!_task;
        button.addEventListener('click', function () { downloadPack(button.dataset.offlineDownload); });
      });
      list.querySelectorAll('[data-offline-remove]').forEach(function (button) {
        button.disabled = !!_task;
        button.addEventListener('click', function () { removePack(button.dataset.offlineRemove); });
      });
      if (snapshot.unsupported) setMessage('当前浏览器不支持 Cache Storage，无法下载离线语音包。', 'error');
    } catch (err) {
      list.innerHTML = '<div class="offline-audio-empty"></div>';
      var empty = list.querySelector('.offline-audio-empty');
      if (empty) empty.textContent = (err && err.message) || '加载失败';
      setMessage('请联网后重试。', 'error');
    }
  }

  async function fetchWithTimeout(url, timeoutMs) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;
    try {
      return await fetch(url, { cache: 'no-store', signal: controller ? controller.signal : undefined });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function cacheOne(cache, file) {
    var cleanUrl = canonicalUrl(file);
    var separator = cleanUrl.indexOf('?') >= 0 ? '&' : '?';
    var lastError = null;
    for (var attempt = 1; attempt <= 3; attempt += 1) {
      try {
        var response = await fetchWithTimeout(cleanUrl + separator + 'offline-download=1&r=' + attempt, 20000);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await cache.put(cleanUrl, response);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < 3) await new Promise(function (resolve) { setTimeout(resolve, attempt * 500); });
      }
    }
    throw new Error(PathName(cleanUrl) + '（' + ((lastError && lastError.name === 'AbortError') ? '请求超时' : ((lastError && lastError.message) || '下载失败')) + '）');
  }

  function PathName(url) {
    try { return new URL(url).pathname.split('/').pop(); } catch (_) { return url; }
  }

  async function downloadPack(packId) {
    if (_task || !supported()) return;
    var manifest = await loadManifest();
    var pack = (manifest.packs || []).find(function (item) { return item.id === packId; });
    if (!pack) return;
    var task = { cancelled: false };
    _task = task;
    setMessage('正在准备 ' + pack.label + '…');
    await renderManager();
    try {
      var audioCache = await caches.open(CACHE_NAME);
      var dataCache = await caches.open(DATA_CACHE_NAME);
      var snapshot = await getSnapshot(manifest);
      var meta = snapshot.meta || { packs: {}, assets: {} };
      if (!meta.assets) meta.assets = {};
      var oldRecord = meta.packs[pack.id];
      var forceRefresh = !!(oldRecord && (oldRecord.revision !== pack.revision || oldRecord.refreshing));
      meta.packs[pack.id] = { status: 'partial', revision: pack.revision, refreshing: forceRefresh };
      if (!writeMeta(meta)) throw new Error('浏览器无法保存下载状态，请检查隐私/存储设置');
      var allFiles = (pack.files || []).concat(pack.dataFiles || []);
      var pending = allFiles.filter(function (file) {
        var cacheSet = file.indexOf('audio/') === 0 ? snapshot.cached : snapshot.cachedData;
        var asset = manifest.assets[file];
        return !cacheSet.has(fileKey(file)) || meta.assets[file] !== asset.revision;
      });
      var completed = allFiles.length - pending.length;
      var failed = [];
      var cursor = 0;
      var workers = Array.from({ length: Math.min(4, pending.length || 1) }, async function () {
        while (!task.cancelled) {
          var index = cursor++;
          if (index >= pending.length) return;
          var file = pending[index];
          try {
            var cache = file.indexOf('audio/') === 0 ? audioCache : dataCache;
            await cacheOne(cache, file);
            meta.assets[file] = manifest.assets[file].revision;
            completed += 1;
            if (completed % 10 === 0) writeMeta(meta);
            setMessage('正在下载 ' + pack.label + '：' + completed + '/' + allFiles.length);
          } catch (err) {
            failed.push((err && err.message) || file);
          }
        }
      });
      await Promise.all(workers);
      if (!writeMeta(meta)) throw new Error('下载进度保存失败，请检查浏览器存储设置');
      if (failed.length) throw new Error(failed.length + ' 个资源下载失败，请检查网络后继续下载');
      meta.packs[pack.id] = { status: 'complete', revision: pack.revision, refreshing: false };
      if (!writeMeta(meta)) throw new Error('资源已下载，但下载状态保存失败');
      setMessage(pack.label + (forceRefresh ? '更新完成。' : '下载完成，断网也可学习。'), 'success');
    } catch (err) {
      setMessage((err && err.message) || '下载失败，请稍后重试。', 'error');
    } finally {
      _task = null;
      await renderManager();
      refreshVisibleSummary();
    }
  }

  async function deletePackFiles(files, protectedFiles) {
    var names = await caches.keys();
    var targetNames = names.filter(function (name) {
      return name === CACHE_NAME || name === DATA_CACHE_NAME || name.indexOf('lexue-runtime-') === 0;
    });
    await Promise.all(targetNames.map(async function (name) {
      var cache = await caches.open(name);
      await Promise.all((files || []).map(function (file) {
        return protectedFiles && protectedFiles.has(file)
          ? Promise.resolve(false)
          : cache.delete(canonicalUrl(file), { ignoreSearch: true });
      }));
    }));
  }

  async function removePack(packId) {
    if (_task || !supported()) return;
    var manifest = await loadManifest();
    var pack = (manifest.packs || []).find(function (item) { return item.id === packId; });
    if (!pack || !confirm('删除“' + pack.textbookName + ' · ' + pack.label + '”离线语音？')) return;
    _task = { cancelled: false };
    try {
      var snapshot = await getSnapshot(manifest);
      var meta = snapshot.meta || { packs: {}, assets: {} };
      if (!meta.assets) meta.assets = {};
      delete meta.packs[packId];
      var targetList = (pack.files || []).concat(pack.dataFiles || []);
      var targetFiles = new Set(targetList);
      var activeOtherIds = new Set(trackedIds(meta));
      // 元数据丢失时，用“实际缓存了该包的独有文件”恢复部分包归属，避免误删共享资源。
      (manifest.packs || []).forEach(function (item) {
        if (item.id === packId || activeOtherIds.has(item.id)) return;
        var itemFiles = (item.files || []).concat(item.dataFiles || []);
        var hasOwnCachedFile = itemFiles.some(function (file) {
          if (targetFiles.has(file)) return false;
          var cacheSet = file.indexOf('audio/') === 0 ? snapshot.cached : snapshot.cachedData;
          return cacheSet.has(fileKey(file));
        });
        if (hasOwnCachedFile) activeOtherIds.add(item.id);
      });
      var protectedFiles = new Set();
      (manifest.packs || []).forEach(function (item) {
        if (activeOtherIds.has(item.id)) {
          (item.files || []).concat(item.dataFiles || []).forEach(function (file) { protectedFiles.add(file); });
        }
      });
      await deletePackFiles(targetList, protectedFiles);
      targetList.forEach(function (file) { if (!protectedFiles.has(file)) delete meta.assets[file]; });
      if (!writeMeta(meta)) throw new Error('离线包已删除，但下载状态保存失败');
      setMessage(pack.label + '已删除。', 'success');
    } catch (err) {
      setMessage((err && err.message) || '删除失败，请稍后重试。', 'error');
    } finally {
      _task = null;
      await renderManager();
      refreshVisibleSummary();
    }
  }

  async function clearAll() {
    if (_task || !supported()) return;
    if (!confirm('删除全部已下载的离线语音包？')) return;
    _task = { cancelled: false };
    try {
      await Promise.all([caches.delete(CACHE_NAME), caches.delete(DATA_CACHE_NAME)]);
      var names = await caches.keys();
      await Promise.all(names.filter(function (name) { return name.indexOf('lexue-runtime-') === 0; }).map(async function (name) {
        var cache = await caches.open(name);
        var requests = await cache.keys();
        await Promise.all(requests.filter(function (req) {
          try { return new URL(req.url).pathname.indexOf('/audio/') !== -1; } catch (_) { return false; }
        }).map(function (req) { return cache.delete(req); }));
      }));
      if (!writeMeta({ packs: {}, assets: {} })) throw new Error('缓存已清理，但下载状态保存失败');
      setMessage('全部离线语音已删除。', 'success');
    } catch (err) {
      setMessage((err && err.message) || '清理失败，请稍后重试。', 'error');
    } finally {
      _task = null;
      await renderManager();
      refreshVisibleSummary();
    }
  }

  function refreshVisibleSummary() {
    document.querySelectorAll('[data-offline-audio-summary]').forEach(function (target) { updateSummary(target); });
  }

  function openManager() {
    var modal = ensureModal();
    modal.classList.remove('hide');
    document.body.classList.add('offline-audio-open');
    setMessage('');
    renderManager();
  }

  function closeManager() {
    var modal = document.getElementById('offlineAudioModal');
    if (modal) modal.classList.add('hide');
    document.body.classList.remove('offline-audio-open');
  }

  window.OfflineAudio = {
    cacheName: CACHE_NAME,
    dataCacheName: DATA_CACHE_NAME,
    openManager: openManager,
    closeManager: closeManager,
    updateSummary: updateSummary,
    loadManifest: loadManifest,
    getSnapshot: getSnapshot,
    downloadPack: downloadPack,
    removePack: removePack,
    clearAll: clearAll,
    isNative: isNative,
    isSupported: supported
  };
})();
