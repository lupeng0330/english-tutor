#!/bin/bash
# 乐学英语 · Mac 开发启动脚本
# 用法：双击此文件即可启动本地服务器并打开浏览器

cd "$(dirname "$0")"

echo "🚀 启动乐学英语开发服务器..."
echo "📁 项目路径: $(pwd)"
echo ""

# 用 Mac 自带 Python 3 启动
python3 -m http.server 8765 &
SERVER_PID=$!

# 等服务器就绪
sleep 2

echo ""
echo "✅ 服务器已启动，PID=$SERVER_PID"
echo "🌐 访问地址: http://localhost:8765/index.html"
echo ""
echo "📱 手机访问（需要和电脑同WiFi）:"
echo "   先执行 ifconfig | grep 'inet 192' 查看IP"
echo "   然后手机访问 http://你的IP:8765/index.html"
echo ""
echo "⏹  停止服务: 按 Ctrl+C 或关闭此窗口"
echo ""

# 打开浏览器
open "http://localhost:8765/index.html"

# 保持运行
wait $SERVER_PID
