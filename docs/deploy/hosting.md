---
title: 部署到静态托管
description: GitHub Pages、Vercel、Nginx、对象存储等静态托管平台的接入方式。
---

# 3.3 部署到静态托管

产物是纯静态文件，所以绝大多数平台的接入方式都一样：**构建出 `docs/.vitepress/dist`，把它发布出去**。

## 通用注意事项

### 子路径部署要设置 `base`

如果站点不是部署在域名根目录，而是形如 `https://example.com/my-docs/`，必须修改 `docs/.vitepress/config.mts`：

```ts
export default defineConfig({
  base: '/my-docs/',   // 前后都要有斜杠
  // ...
})
```

::: danger 忘记设置 base 会白屏
资源路径全部会指向 `/assets/...` 而不是 `/my-docs/assets/...`，页面打开是空白。这是子路径部署最常见的问题。
:::

### 支持 404 回退

VitePress 会生成 `404.html`。多数平台（GitHub Pages、Netlify、Vercel、Nginx）都会自动使用它。对象存储通常需要在控制台里单独设置「错误文档」为 `404.html`。

## GitHub Pages

在仓库里新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy docs to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0          # lastUpdated 需要完整的 git 历史

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

::: tip `fetch-depth: 0` 很重要
如果不拉取完整历史，`lastUpdated` 会显示不出来（或全部显示为构建时间）。
:::

如果部署在 `https://<user>.github.io/<repo>/`，记得设置 `base: '/<repo>/'`。

## Vercel / Netlify

两个平台都能自动识别，配置极简：

::: code-group

```json [vercel.json]
{
  "buildCommand": "pnpm build",
  "outputDirectory": "docs/.vitepress/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null
}
```

```toml [netlify.toml]
[build]
  command = "pnpm build"
  publish = "docs/.vitepress/dist"

[build.environment]
  NODE_VERSION = "22"
```

:::

两个平台都会为每个 PR 生成预览环境，适合在合并前检查文档效果。

## 自有服务器 + Nginx

把 `dist` 目录上传到服务器，然后配置：

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs;
    index index.html;

    # 找不到的文件回退到 404 页面
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    error_page 404 /404.html;

    # 带 hash 的资源可以长期缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

::: tip 直接抄模板里的配置
模板的 `docker/nginx.conf` 已经包含了一套生产可用的配置（缓存策略、gzip、安全响应头、404 回退），可以直接拿去改。
:::

## 对象存储 + CDN

以阿里云 OSS / 腾讯云 COS / AWS S3 为例：

1. 执行 `pnpm build`；
2. 把 `docs/.vitepress/dist` **目录里的内容**（不是目录本身）上传到存储桶根目录；
3. 开启静态网站托管，默认首页设为 `index.html`，默认 404 页设为 `404.html`；
4. 接入 CDN，并配置「缓存 HTML 不缓存、缓存 assets 长期缓存」的规则。

```bash
# 以 ossutil 为例
pnpm build
ossutil cp -r docs/.vitepress/dist/ oss://my-docs-bucket/ --update
```

::: warning Content-Type 要正确
上传工具如果没识别扩展名，`.js` 可能被存成 `application/octet-stream`，浏览器会拒绝执行，页面白屏。上传后务必抽查几个文件的 Content-Type。
:::

## 用 Docker 部署到自有服务器

```bash
# 本地构建镜像并导出
docker build -t docs-site:latest .
docker save docs-site:latest | gzip > docs-site.tar.gz

# 上传到服务器后
gunzip -c docs-site.tar.gz | docker load
docker run -d --name docs-site --restart unless-stopped -p 80:80 docs-site:latest
```

或者直接在服务器上构建（需要服务器能访问代码仓库）：

```bash
git clone <your-repo> && cd <your-repo>
docker compose up -d --build
```

## 部署后自检

上线后花两分钟确认这几件事：

- [ ] 首页能打开，且样式正常（不是裸 HTML）
- [ ] 任意内页能打开，左侧目录有 `1.` / `1.1` 编号
- [ ] 刷新一个内页 URL（比如 `/guide/structure`）不会 404
- [ ] 顶部搜索框能搜到中文关键词
- [ ] 打开带 Mermaid 图表的页面，图能正常画出来
- [ ] 切到深色模式，图表跟着变深色
- [ ] 随便输一个不存在的地址，能看到 404 页面

## 下一步

- [4. 配置参考](/reference/)
- [4.3 常见问题](/reference/faq)
