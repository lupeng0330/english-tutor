#!/bin/bash
# dev-open.sh — Mac 端一键启动本地验证环境（免缓存版）
# 用法：./dev-open.sh
#   ./dev-open.sh pc    (仅电脑端)
#   ./dev-open.sh mb    (仅手机端)
#   ./dev-open.sh v=abc (自定义版本号)
# ============================================================
# 不碰 version.txt、不 bump 版本、不开浏览器以外的副作用。
# <铁律 3> 仅用于本地验证；上线走 dev-push.sh。

set -e
cd "$(dirname "$0")"

# 版本参数：默认今天日期
VER="${1:-}"
if [ "$VER" = "pc" ] || [ "$VER" = "mb" ]; then
  MODE="$VER"
  VER="$(date +%Y%m%d)"
elif [[ "$VER" =~ ^v= ]]; then
  MODE=""
else
  MODE="$VER"
  VER="$(date +%Y%m%d)"
fi

PORT=8765
BASE="http://localhost:${PORT}"
PC_URL="${BASE}/index.html?v=${VER}"
MB_URL="${BASE}/mobile.html?v=${VER}"

# 启动 HTTP 服务（如果还没起）
if ! lsof -i :$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[dev-open] 启动本地服务 :$PORT ..."
  python3 -m http.server $PORT >/dev/null 2>&1 &
  sleep 1
  echo "[dev-open] 服务已启动"
else
  echo "[dev-open] 服务已在运行 :$PORT"
fi

echo "[dev-open] 版本参数: ?v=${VER}  (不修改 version.txt)"
echo "[dev-open] ==============================="

if [ "$MODE" = "mb" ]; then
  echo "[dev-open] 📱 手机端: ${MB_URL}"
  open "$MB_URL"
elif [ "$MODE" = "pc" ]; then
  echo "[dev-open] 💻 电脑端: ${PC_URL}"
  open "$PC_URL"
else
  echo "[dev-open] 💻 电脑端: ${PC_URL}"
  echo "[dev-open] 📱 手机端: ${MB_URL}"
  open "$PC_URL"
  open "$MB_URL"
fi

echo "[dev-open] ==============================="
echo "[dev-open] 提示: Cmd+R 刷新即可看到最新代码"
echo "[dev-open]       关闭浏览器后服务仍在运行 :$PORT"
echo "[dev-open]       停止服务: lsof -ti:$PORT | xargs kill"
