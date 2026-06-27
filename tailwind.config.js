/**
 * Tailwind 静态编译配置（替代运行时 CDN cdn.tailwindcss.com）
 * 目的：离线/弱网下样式 100% 可用（产物 tailwind.css 入 SW 预缓存）。
 *
 * 重新生成命令（需 Node）：
 *   npm i -D tailwindcss@3
 *   npx tailwindcss -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
 *
 * 注意：JS 里有用变量拼接的颜色类（如 'text-' + color），扫描器抓不到，
 *       故用 safelist 显式兜底常用调色板，避免离线缺类。
 */
module.exports = {
  // 内容扫描会抓取所有"字面量"类名（含 JS 模板串/函数里返回的整串类名，
  // 如 _posBadgeClass 返回 'bg-blue-100 text-blue-700 ...'），故无需 broad safelist。
  content: ['./index.html', './mobile.html', './js/**/*.js'],
  theme: { extend: {} },
  plugins: [],
};
