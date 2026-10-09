# =============================================================================
#  GitBook Style Docs —— 多阶段 Dockerfile
#
#  阶段说明：
#    base     安装 pnpm，作为所有 Node 阶段的基础
#    deps     只复制依赖清单 → 安装依赖（源码变化不会让这一层失效）
#    build    复制源码 → 执行 vitepress build
#    test     只带上产物跑冒烟测试（docker build --target test .）
#    runtime  最终镜像：Nginx + 静态产物，不含 Node，体积最小
#
#  常用命令：
#    docker build -t docs:latest .
#    docker build --target test -t docs:test .       # 只跑测试
#    docker run --rm -p 8080:80 docs:latest
# =============================================================================

ARG NODE_IMAGE=node:24-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine
ARG PNPM_VERSION=12.9.1


# ---------------------------------------------------------------- base
FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# 关闭 pnpm 的交互式提示，CI 环境必须
ENV CI=true

RUN npm install -g "pnpm@${PNPM_VERSION}" \
 && pnpm config set store-dir /pnpm/store \
 && node -v \
 && pnpm --version

WORKDIR /app


# ---------------------------------------------------------------- deps
# 只复制清单文件：只要依赖没变，这一层就能命中缓存。
# 注意 pnpm-workspace.yaml 必须一起复制，pnpm 11+ 的配置（allowBuilds 等）都在里面。
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false


# ---------------------------------------------------------------- build
FROM deps AS build

COPY . .

RUN pnpm run build \
 && test -f docs/.vitepress/dist/index.html


# ---------------------------------------------------------------- test
# 独立的测试阶段：不复制源码与 node_modules，只带产物，
# 确保测的是「构建结果」本身，而不是本地环境。
FROM base AS test

WORKDIR /app

COPY --from=build /app/docs/.vitepress/dist ./docs/.vitepress/dist
COPY tests ./tests
COPY package.json ./

RUN node tests/smoke.mjs


# ---------------------------------------------------------------- runtime
FROM ${NGINX_IMAGE} AS runtime

LABEL org.opencontainers.image.title="vitepress-gitbook-template" \
      org.opencontainers.image.description="GitBook 风格的 VitePress 静态文档站点" \
      org.opencontainers.image.licenses="MIT"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/docs/.vitepress/dist /usr/share/nginx/html

# 让 nginx 能读、能写缓存目录
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && nginx -t

EXPOSE 80

# 容器自身的健康检查：首页能返回 200 才算健康
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
