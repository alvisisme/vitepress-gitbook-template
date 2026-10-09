#!/usr/bin/env bash
# =============================================================================
#  Docker 构建 + 测试 + 运行时校验（一条命令跑完全流程）
#
#    bash scripts/docker-verify.sh
#
#  可用环境变量覆盖：
#    IMAGE=my-docs:latest  TEST_IMAGE=my-docs:test  PORT=18080  CONTAINER=my-docs-verify
# =============================================================================

set -euo pipefail

IMAGE="${IMAGE:-vitepress-gitbook-template:latest}"
TEST_IMAGE="${TEST_IMAGE:-vitepress-gitbook-template:test}"
CONTAINER="${CONTAINER:-vitepress-gitbook-verify}"
PORT="${PORT:-18080}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BASE="http://127.0.0.1:${PORT}"

cleanup() {
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo ""
echo "=============================================================="
echo " 1/4  运行冒烟测试阶段（docker build --target test）"
echo "=============================================================="
docker build --target test -t "${TEST_IMAGE}" "${ROOT}"

echo ""
echo "=============================================================="
echo " 2/4  构建运行时镜像（docker build --target runtime）"
echo "=============================================================="
docker build --target runtime -t "${IMAGE}" "${ROOT}"

echo ""
echo "=============================================================="
echo " 3/4  启动容器 ${CONTAINER}（映射到本机 ${PORT}）"
echo "=============================================================="
cleanup
docker run -d --name "${CONTAINER}" -p "${PORT}:80" "${IMAGE}" >/dev/null

printf '等待容器就绪'
ready=0
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "${BASE}/" 2>/dev/null; then
    ready=1
    break
  fi
  printf '.'
  sleep 1
done
printf '\n'

if [ "${ready}" -ne 1 ]; then
  echo "容器未能在 30 秒内就绪，输出日志："
  docker logs "${CONTAINER}" || true
  exit 1
fi
echo "容器已就绪"

echo ""
echo "=============================================================="
echo " 4/4  HTTP 校验"
echo "=============================================================="

fail=0

expect_status() {
  local path="$1" want="$2" code
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${path}")"
  if [ "${code}" = "${want}" ]; then
    echo "  ✓ ${path}  →  ${code}"
  else
    echo "  ✗ ${path}  期望 ${want}，实际 ${code}"
    fail=1
  fi
}

expect_contains() {
  local path="$1" needle="$2" body
  body="$(curl -sS "${BASE}${path}")"
  if printf '%s' "${body}" | grep -q -- "${needle}"; then
    echo "  ✓ ${path}  包含「${needle}」"
  else
    echo "  ✗ ${path}  未包含「${needle}」"
    fail=1
  fi
}

echo "-- 状态码 --"
expect_status "/" 200
expect_status "/guide/" 200
expect_status "/guide/introduction.html" 200
expect_status "/guide/introduction" 200
expect_status "/features/mermaid.html" 200
expect_status "/reference/faq.html" 200
expect_status "/this-page-does-not-exist" 404

echo "-- 内容 --"
expect_contains "/" "GitBook Style Docs"
expect_contains "/guide/introduction.html" "1.1 模板简介"
expect_contains "/features/code.html" "shiki"
expect_contains "/features/mermaid.html" "gb-mermaid"

echo "-- 响应头 --"
hdr="$(curl -sSI "${BASE}/assets/")"
if printf '%s' "${hdr}" | grep -qi 'x-content-type-options'; then
  echo "  ✓ 安全响应头存在"
else
  echo "  ✗ 缺少安全响应头"
  fail=1
fi

asset_css="$(curl -sS "${BASE}/" | grep -o '/assets/[^"]*\.css' | head -1 || true)"
if [ -n "${asset_css}" ]; then
  cache_hdr="$(curl -sSI "${BASE}${asset_css}")"
  if printf '%s' "${cache_hdr}" | grep -qi 'immutable'; then
    echo "  ✓ 静态资源长缓存生效（${asset_css}）"
  else
    echo "  ✗ 静态资源缺少 immutable 缓存头"
    fail=1
  fi
else
  echo "  ✗ 首页没有引用 CSS 资源"
  fail=1
fi

echo ""
if [ "${fail}" -ne 0 ]; then
  echo "校验未通过 ✗"
  docker logs "${CONTAINER}" || true
  exit 1
fi

echo "全部校验通过 ✓"
echo "镜像：${IMAGE}"
echo "如需手动查看：docker run --rm -p 8080:80 ${IMAGE}"
echo ""
