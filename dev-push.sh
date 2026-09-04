#!/usr/bin/env bash
# dev-push.sh — 一键 commit + push（Mac/Linux 版，对等 dev-push.ps1）
# ============================================================
# 版本号统一由 GitHub Actions（.github/workflows/update-version.yml）管理：
#   - 推送后 CI 对 feat/fix/perf/refactor 等「功能性提交」自动 bump version.txt
#     （单行格式："20260628V02.40 <hash> (<utc>)"），docs/chore/ci/test/style/build 不 bump。
#   - 本脚本【绝不本地写 version.txt】，避免与 CI 的格式/递增规则冲突（曾导致 rebase 冲突）。
#
# 用法：
#   ./dev-push.sh                 # 无参数 -> chore: dev update @ 时间戳
#   ./dev-push.sh "feat: xxx"     # 指定提交信息
#
# 首次需赋可执行权限：chmod +x dev-push.sh
set -euo pipefail
cd "$(dirname "$0")"

# ---------- 安全护栏：禁止手改 version.txt（铁律9）----------
# version.txt 完全由 CI 托管。若它出现在待提交改动里（已暂存或未暂存），
# 几乎一定是误操作，直接拦下并自动还原，从源头杜绝 rebase 版本冲突。
if ! git diff --quiet -- version.txt 2>/dev/null || ! git diff --cached --quiet -- version.txt 2>/dev/null; then
  echo "[dev-push] ⛔ 检测到 version.txt 被本地修改 —— 该文件由 CI 自动管理，禁止手改（铁律9）。"
  echo "[dev-push]    正在自动还原 version.txt ..."
  git restore --staged version.txt 2>/dev/null || true
  git checkout -- version.txt 2>/dev/null || true
  echo "[dev-push]    已还原。继续推送。"
fi

# ---------- 提交业务改动 ----------
if [ -z "$(git status --porcelain)" ]; then
  echo "[dev-push] no changes to commit"
else
  MSG="${1:-}"
  if [ -z "$MSG" ]; then
    MSG="chore: dev update @ $(date '+%Y-%m-%d %H:%M')"
  fi
  git add -A
  git commit -m "$MSG" >/dev/null
  echo "[dev-push] committed: $MSG"
fi

# ---------- 同步远端 + 推送 ----------
echo "[dev-push] git pull --rebase origin main ..."
git pull --rebase origin main
echo "[dev-push] git push origin main ..."
git push origin main

# ---------- 提示 ----------
CUR_VER=""
[ -f version.txt ] && CUR_VER="$(head -n1 version.txt 2>/dev/null || true)"
HEAD_SHORT="$(git rev-parse --short HEAD)"

echo ""
echo "================ PUSHED ================"
echo " HEAD        : $HEAD_SHORT"
echo " version.txt : $CUR_VER"
echo "               (功能性提交推送后，CI 会自动 bump 为下一个版本号)"
echo " Pages       : https://lupeng0330.github.io/english-tutor/"
echo "======================================="
echo ""
echo "TIP 版本号规则（由 CI 统一管理，见 .github/workflows/update-version.yml）："
echo "    - feat/fix/perf/refactor -> CI 自动 +1（同月小版本 +1，跨月大版本 +1）"
echo "    - docs/chore/ci/test/...  -> 不 bump"
echo ""
