/* =========================================================
 * 乐学英语 · Service Worker (v01.14)
 * ---------------------------------------------------------
 * 设计目标：
 *   1. 首次访问后「加到主屏」，离线能背单词
 *   2. 不破坏主 app 已有的 __APP_VERSION / __withVer 缓存破坏机制
 *   3. 版本号与 version.txt 首行保持一致，推送新版本后下次自动升级
 *
 * 缓存策略：
 *   - 预缓存（install 时拉取）：首屏关键路径（index/styles/app/3 个 js 模块/
 *     questionBank/manifest/3 个图标）。不包括 data/*.json 和 audio/*.mp3，
 *     避免首次安装卡十几秒。
 *   - data/*.json → stale-while-revalidate：先返 cache，后台异步更新
 *   - audio/*.mp3 → cache-first：命中即返，节省流量 + 离线可播
 *   - 其它同源 GET → network-first，fallback 预缓存
 *   - version.txt → 永不拦截（主 app 依赖它做 no-store 版本探测）
 *   - 非同源（Tailwind / Chart.js CDN）→ 不拦截，由浏览器默认处理
 * ======================================================= */

'use strict';

// 占位版本号；真实版本号在 install 时异步读 version.txt 写入
const BOOTSTRAP_VERSION = 'bootstrap';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './questionBank.js',
  './js/textbook.js',
  './js/state.js',
  './js/profile.js',
  './js/player.js',
  './js/core.js',
  './js/wrongbook.js',
  './js/mastery.js',
  './js/smartpick.js',
  './js/stats.js',
  './js/home.js',
  './js/lesson.js',
  './js/practice.js',
  './js/vendor/chart.umd.min.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
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

function staticCacheName(v) { return 'lexue-static-' + v; }
function runtimeCacheName(v) { return 'lexue-runtime-' + v; }

/* ------------------- install ------------------- */
self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const version = await readAppVersion();
    const cache = await caches.open(staticCacheName(version));
    // 逐个 add 避免某一项（例如 PNG 未生成）把整批拖挂
    await Promise.all(STATIC_ASSETS.map(function (url) {
      return cache.add(url).catch(function (err) {
        console.warn('[SW] 预缓存跳过:', url, err && err.message);
      });
    }));
    console.log('[SW] install 完成，静态缓存版本 =', version);
    // 立即跳过 waiting，让 activate 尽快生效
    self.skipWaiting();
  })());
});

/* ------------------- activate ------------------- */
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const version = await readAppVersion();
    const keep = new Set([staticCacheName(version), runtimeCacheName(version)]);
    const names = await caches.keys();
    await Promise.all(names.map(function (name) {
      if (!keep.has(name) && name.startsWith('lexue-')) {
        console.log('[SW] 清理旧缓存:', name);
        return caches.delete(name);
      }
    }));
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

  // data/*.json → stale-while-revalidate
  if (url.pathname.indexOf('/data/') !== -1 && url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // audio/*.mp3 → cache-first
  if (url.pathname.indexOf('/audio/') !== -1 && url.pathname.endsWith('.mp3')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 其它同源 GET → network-first
  event.respondWith(networkFirst(req));
});

/* ------------------- strategies ------------------- */

async function staleWhileRevalidate(req) {
  const version = await readAppVersion();
  const cache = await caches.open(runtimeCacheName(version));
  const cached = await cache.match(req);
  const network = fetch(req).then(function (res) {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(function () { return null; });
  return cached || network || new Response('', { status: 504, statusText: 'offline' });
}

async function cacheFirst(req) {
  const version = await readAppVersion();
  const cache = await caches.open(runtimeCacheName(version));
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return new Response('', { status: 504, statusText: 'offline-audio' });
  }
}

async function networkFirst(req) {
  const version = await readAppVersion();
  const staticCache = await caches.open(staticCacheName(version));
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      // 只缓存预定义的静态清单，避免把任意 URL 塞进来
      // （其它首次访问就进运行时缓存意义不大，network-first 的快路径已足够）
    }
    return res;
  } catch (err) {
    const cached = await staticCache.match(req) || await caches.match(req);
    if (cached) return cached;
    // 对 HTML 请求最后兜底到首页
    if (req.headers.get('accept') && req.headers.get('accept').indexOf('text/html') !== -1) {
      const index = await staticCache.match('./index.html');
      if (index) return index;
    }
    return new Response('', { status: 504, statusText: 'offline' });
  }
}
