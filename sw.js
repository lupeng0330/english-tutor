/* =========================================================
 * 乐学英语 · Service Worker (Phase 3.5)
 * ---------------------------------------------------------
 * 设计目标：
 *   1. 首次访问后「加到主屏」，离线能背单词
 *   2. 不破坏主 app 已有的 __APP_VERSION / __withVer 缓存破坏机制
 *   3. 版本号与 version.txt 首行保持一致，推送新版本后下次自动升级
 *
 * 缓存策略：
 *   - 原子预缓存：完整应用壳 + 默认教科版教材/核心题库；关键项失败不激活
 *   - data/*.json → stale-while-revalidate：运行缓存 → 预缓存 → 网络
 *   - audio/*.mp3 → 用户下载的稳定离线包优先；普通播放不再隐式长期占空间
 *   - 其它同源 GET → network-first，fallback 预缓存
 *   - version.txt → 永不拦截（主 app 依赖它做 no-store 版本探测）
 *   - 非同源（Tailwind / Chart.js CDN）→ 不拦截，由浏览器默认处理
 * ======================================================= */

'use strict';

// 占位版本号；真实版本号在 install 时异步读 version.txt 写入
const BOOTSTRAP_VERSION = 'bootstrap';

// 应用壳与默认教材必须原子安装：任一失败都不激活新 SW，上一版完整缓存继续可用。
const CRITICAL_ASSETS = [
  './', './index.html', './tailwind.css', './styles.css', './app.js', './questionBank.js',
  './js/textbook.js', './js/state.js', './js/profile.js', './js/storage.js', './js/theme.js', './js/player.js',
  './js/core.js', './js/api-client.js', './js/wrongbook.js', './js/mastery.js', './js/smartpick.js',
  './js/stats.js', './js/sync-client.js', './js/offline-audio.js', './js/srs.js', './js/home.js',
  './js/lesson.js', './js/practice.js', './js/exam.js', './js/grammar.js',
  './js/vendor/chart.umd.min.js', './manifest.json', './data/offline-audio-packs.json',
  './data/textbooks/jk.json',
  './data/questions/jk_spelling.json', './data/questions/jk_listening.json',
  './data/questions/jk_grammar.json', './data/questions/jk_reading.json'
];

// 非首屏增强资源失败不阻断更新；联网后仍会由 stale-while-revalidate 补齐。
const OPTIONAL_ASSETS = [
  './icon.svg', './icon-192.png', './icon-512.png',
  './data/questions/jk_blank_fill.json', './data/questions/jk_cloze_passage.json',
  './data/questions/jk_cloze.json', './data/questions/jk_dialog_complete.json',
  './data/questions/jk_listen_fill.json', './data/questions/jk_listen_judge.json',
  './data/questions/jk_listen_pic.json', './data/questions/jk_matching.json',
  './data/questions/jk_sentence_order.json', './data/questions/jk_sentence_transform.json',
  './data/questions/jk_writing.json',
  './data/examples/jk_grade3_shang.json', './data/examples/jk_grade3_xia.json',
  './data/examples/jk_grade4_shang.json', './data/examples/jk_grade4_xia.json',
  './data/examples/jk_grade5_shang.json', './data/examples/jk_grade5_xia.json',
  './data/examples/jk_grade6_shang.json', './data/examples/jk_grade6_xia.json',
  './data/extras/jk_grade3_shang_exercises.json', './data/extras/jk_grade3_xia_exercises.json',
  './data/extras/jk_grade4_shang_exercises.json', './data/extras/jk_grade4_xia_exercises.json',
  './data/extras/jk_grade5_shang_exercises.json', './data/extras/jk_grade5_xia_exercises.json',
  './data/extras/jk_grade6_shang_exercises.json', './data/extras/jk_grade6_xia_exercises.json',
  './data/extras/jk_grade6_xia_irregular_verbs.json',
  './data/grammar/grammar_knowledge.json', './data/exams/exam_config.json', './data/exams/exam_templates.json'
];

/**
 * 读 version.txt 首行当做缓存版本号；失败退化为当日日期。
 * Service Worker 作用域已经是站点根，所以相对路径直接可用。
 */
async function readAppVersion() {
  try {
    const res = await fetch('./version.txt?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    const first = (txt || '').split(/\r?\n/)[0].trim();
    if (first) return first;
  } catch (_) { /* fallthrough */ }
  const d = new Date();
  return d.getFullYear()
       + String(d.getMonth() + 1).padStart(2, '0')
       + String(d.getDate()).padStart(2, '0');
}

const OFFLINE_AUDIO_CACHE = 'lexue-audio-offline-v1';
const OFFLINE_DATA_CACHE = 'lexue-data-offline-v1';
let activeVersionPromise = null;

function staticCacheName(v) { return 'lexue-static-' + v; }
function runtimeCacheName(v) { return 'lexue-runtime-' + v; }

// fetch 阶段优先复用当前已安装的静态缓存版本；避免每个资源请求都访问 version.txt，
// 也避免断网时退化为“当天日期”并误开一个空缓存。
function activeVersion() {
  if (!activeVersionPromise) {
    activeVersionPromise = caches.keys().then(function (names) {
      const current = names.find(function (name) { return name.startsWith('lexue-static-'); });
      return current ? current.slice('lexue-static-'.length) : readAppVersion();
    });
  }
  return activeVersionPromise;
}

/* ------------------- install ------------------- */
self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const version = await readAppVersion();
    const name = staticCacheName(version);
    const cache = await caches.open(name);
    const versionedRequest = function (url) {
      const absolute = new URL(url, self.registration.scope);
      absolute.searchParams.set('swv', version);
      return new Request(absolute.href, { cache: 'reload' });
    };
    try {
      // 所有请求携带同一应用版本并强制绕过 HTTP 缓存，防止旧资源写进新版本缓存名。
      await Promise.all(CRITICAL_ASSETS.map(function (url) { return cache.add(versionedRequest(url)); }));
      await Promise.all(OPTIONAL_ASSETS.map(function (url) {
        return cache.add(versionedRequest(url)).catch(function (err) {
          console.warn('[SW] 可选预缓存跳过:', url, err && err.message);
        });
      }));
      console.log('[SW] install 完成，静态缓存版本 =', version);
      // 不立即接管已打开页面；浏览器在旧页面关闭/刷新后自然激活，避免新 SW 配旧页面的混合版本。
      return;
    } catch (err) {
      await caches.delete(name);
      console.error('[SW] 关键应用壳安装失败，保留上一版:', err && err.message);
      throw err;
    }
  })());
});

/* ------------------- activate ------------------- */
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const names = await caches.keys();
    let version = await readAppVersion();
    // 离线激活时保留 install 已创建的静态缓存，不使用日期 fallback 清掉可用应用壳。
    if (names.indexOf(staticCacheName(version)) < 0) {
      const installed = names.filter(function (name) { return name.startsWith('lexue-static-'); });
      if (installed.length) version = installed[installed.length - 1].slice('lexue-static-'.length);
    }
    const keep = new Set([staticCacheName(version), runtimeCacheName(version), OFFLINE_AUDIO_CACHE, OFFLINE_DATA_CACHE]);
    await Promise.all(names.map(function (name) {
      if (!keep.has(name) && name.startsWith('lexue-')) {
        console.log('[SW] 清理旧缓存:', name);
        return caches.delete(name);
      }
    }));
    activeVersionPromise = Promise.resolve(version);
    await self.clients.claim();
    console.log('[SW] activate 完成，当前版本 =', version);
  })());
});

/* ------------------- fetch routing ------------------- */
self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // 跨源请求（CDN）：不拦截，走浏览器默认
  if (url.origin !== self.location.origin) return;

  // version.txt 必须永远走网络（主 app 依赖它检测新版本）
  if (url.pathname.endsWith('/version.txt')) return;

  // 离线包下载/更新必须直通网络，不能被旧 data/audio 缓存截获。
  if (url.searchParams.has('offline-download')) return;

  // data/*.json → 用户离线包优先，再 stale-while-revalidate
  if (url.pathname.indexOf('/data/') !== -1 && url.pathname.endsWith('.json')) {
    event.respondWith(offlineDataFirst(req, event));
    return;
  }

  // audio/*.mp3 → 用户离线包优先，其次版本化运行缓存，最后网络
  if (url.pathname.indexOf('/audio/') !== -1 && url.pathname.endsWith('.mp3')) {
    event.respondWith(audioCacheFirst(req));
    return;
  }

  // 其它同源 GET → network-first
  event.respondWith(networkFirst(req));
});

/* ------------------- strategies ------------------- */

async function offlineDataFirst(req, event) {
  const downloaded = await caches.open(OFFLINE_DATA_CACHE);
  const offline = await downloaded.match(req, { ignoreSearch: true });
  if (offline) return offline;
  return staleWhileRevalidate(req, event);
}

async function staleWhileRevalidate(req, event) {
  const version = await activeVersion();
  const runtime = await caches.open(runtimeCacheName(version));
  const cached = await runtime.match(req, { ignoreSearch: true });
  const staticCache = await caches.open(staticCacheName(version));
  const precached = cached ? null : await staticCache.match(req, { ignoreSearch: true });
  const networkPromise = fetch(req).then(async function (res) {
    if (res && res.ok) await runtime.put(req, res.clone());
    return res;
  }).catch(function () { return null; });
  if (cached || precached) {
    if (event && event.waitUntil) event.waitUntil(networkPromise);
    return cached || precached;
  }
  const network = await networkPromise;
  return network || new Response('', { status: 504, statusText: 'offline' });
}

async function audioCacheFirst(req) {
  const offline = await caches.open(OFFLINE_AUDIO_CACHE);
  const downloaded = await offline.match(req, { ignoreSearch: true });
  if (downloaded) return downloaded;

  // 兼容升级前自动缓存过的音频，但新版本不再隐式持久化；持久离线由用户主动下载包管理。
  const version = await activeVersion();
  const runtime = await caches.open(runtimeCacheName(version));
  const legacyCached = await runtime.match(req, { ignoreSearch: true });
  if (legacyCached) return legacyCached;
  try {
    return await fetch(req);
  } catch (err) {
    return new Response('', { status: 504, statusText: 'offline-audio' });
  }
}

async function networkFirst(req) {
  const version = await activeVersion();
  const staticCache = await caches.open(staticCacheName(version));
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      let pathname = '';
      try { pathname = new URL(req.url).pathname; } catch (_) {}
      if (/\.(?:js|css|html|svg|png|json)$/.test(pathname) || pathname.endsWith('/')) {
        await staticCache.put(req, res.clone());
      }
    }
    return res;
  } catch (err) {
    const cached = await staticCache.match(req, { ignoreSearch: true }) || await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    // 对 HTML 请求最后兜底到首页
    if (req.headers.get('accept') && req.headers.get('accept').indexOf('text/html') !== -1) {
      const index = await staticCache.match('./index.html', { ignoreSearch: true });
      if (index) return index;
    }
    return new Response('', { status: 504, statusText: 'offline' });
  }
}
