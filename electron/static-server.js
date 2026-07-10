// electron/static-server.js
// 内嵌本地静态 HTTP 服务（Phase 1 命门）。
//
// 背景：现有前端全站用 fetch('data/**.json') 等相对路径加载数据。
// Chromium 在 file:// 协议下禁止 fetch，若用 loadFile() 会导致所有题库/教材/
// 考试数据加载失败。解法：在主进程内起一个只读的本地静态服务，前端仍以
// http://127.0.0.1:<port> 方式加载，现有 fetch 相对路径【零改动】即可工作。
//
// 设计要点：
// - 零第三方依赖，仅用 Node 内置 http/fs/path，避免给桌面壳引入额外体积/风险。
// - 绑定 127.0.0.1（仅本机可访问，不监听外网）。
// - 端口 0 让系统分配随机空闲端口，避免与用户其它服务冲突。
// - 只读 GET/HEAD，禁止路径穿越（.. 逃逸 rootDir）。

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 常见静态资源 MIME
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

/**
 * 启动内嵌静态服务。
 * @param {string} rootDir 静态资源根目录（现有前端所在目录）
 * @returns {Promise<{server: import('http').Server, port: number, origin: string}>}
 */
function startStaticServer(rootDir) {
  const root = path.resolve(rootDir);

  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method Not Allowed');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch (e) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    if (pathname === '/' || pathname === '') pathname = '/index.html';

    // 解析为绝对路径并做穿越防护：必须仍位于 root 之内
    const safePath = path.normalize(path.join(root, pathname));
    if (safePath !== root && !safePath.startsWith(root + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.stat(safePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType(safePath),
        'Content-Length': stat.size,
        // 本地服务不需要缓存策略，交由前端 __withVer / 内容自身处理
        'Cache-Control': 'no-cache',
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(safePath);
      stream.on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      stream.pipe(res);
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    // 端口 0 = 系统分配随机空闲端口；仅绑定回环地址
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port, origin: `http://127.0.0.1:${port}` });
    });
  });
}

module.exports = { startStaticServer };
