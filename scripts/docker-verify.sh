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
expect_contains "/this-page-does-not-exist" "404"

# 校验响应头：$1=完整响应头 $2=头名称 $3=期望包含的值 $4=说明
check_header() {
  local haystack="$1" name="$2" needle="$3" label="$4"
  if printf '%s' "${haystack}" | grep -qi "^${name}:.*${needle}"; then
    echo "  ✓ ${label}"
  else
    echo "  ✗ ${label}（响应头里没有 ${name}: …${needle}）"
    fail=1
  fi
}

echo "-- 缓存与安全响应头 --"
asset_css="$(curl -sS "${BASE}/" | grep -o '/assets/[^"]*\.css' | head -1 || true)"
if [ -z "${asset_css}" ]; then
  echo "  ✗ 首页没有引用 CSS 资源"
  fail=1
else
  echo "  抽查资源：${asset_css}"
  asset_hdr="$(curl -sSI "${BASE}${asset_css}")"
  check_header "${asset_hdr}" "cache-control" "immutable" "带 hash 的资源长缓存（immutable）"
  check_header "${asset_hdr}" "x-content-type-options" "nosniff" "安全头在 /assets/ 下依然存在"
  check_header "${asset_hdr}" "x-frame-options" "SAMEORIGIN" "X-Frame-Options 生效"
fi

html_hdr="$(curl -sSI "${BASE}/guide/introduction.html")"
check_header "${html_hdr}" "cache-control" "no-cache" "HTML 不被缓存"
check_header "${html_hdr}" "x-content-type-options" "nosniff" "HTML 带安全响应头"

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
