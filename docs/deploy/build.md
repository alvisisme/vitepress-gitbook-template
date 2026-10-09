---
title: 本地构建与预览
description: 构建流程、产物结构、构建报错排查方法。
---

# 3.1 本地构建与预览

## 构建命令

```bash
pnpm build
```

这条命令背后发生了三件事：

1. Vite 以 `docs/` 为根目录打包客户端资源；
2. VitePress 启动 SSR 渲染，把每个 Markdown 页面渲染成静态 HTML；
3. 产物写入 `docs/.vitepress/dist`。

构建完成后本地预览：

```bash
pnpm preview      # 默认 http://localhost:4173
```

::: warning 一定要用 preview 验证，不要直接开文件
直接双击 `dist/index.html` 用 `file://` 打开会因为资源路径问题显示异常。`pnpm preview` 会起一个静态服务器，行为和线上一致。
:::

## 构建产物结构

```text
docs/.vitepress/dist/
├── index.html
├── 404.html
├── sitemap.xml
├── guide/
│   ├── index.html
│   ├── introduction.html
│   └── ...
├── assets/
│   ├── style.<hash>.css
│   └── chunks/
│       ├── theme.<hash>.js
│       ├── Mermaid.<hash>.js          # 懒加载
│       ├── @localSearchIndex.<hash>.js  # 本地搜索索引
│       └── ...
├── logo.svg
└── favicon.svg
```

| 文件 | 说明 |
| --- | --- |
| `*.html` | 每个路由一个静态页面，SEO 友好 |
| `404.html` | 未匹配路由的兜底页，多数平台会自动使用 |
| `sitemap.xml` | 由 `config.mts` 的 `sitemap.hostname` 生成 |
| `assets/chunks/Mermaid.*.js` | 图表渲染库，只有页面里出现图表才会加载 |
| `assets/chunks/@localSearchIndex.*.js` | 搜索索引，打开搜索框时加载 |

## 构建提速

### 使用缓存

VitePress 会把依赖预构建结果缓存到 `docs/.vitepress/cache`。**不要把这个目录加进 `.gitignore` 之外的清理动作里**，它能显著缩短二次构建时间。

```bash
# 只有怀疑缓存损坏时才清理
pnpm run clean
```

### 关闭不需要的功能

| 功能 | 关闭方式 | 收益 |
| --- | --- | --- |
| 数学公式 | `markdown.math: false` + 移除 `markdown-it-mathjax3` | 安装体积与构建时间明显下降 |
| Sitemap | 删除 `sitemap` 配置 | 几乎无感知 |
| 本地搜索 | `themeConfig.search` 设为 `false` | 产物体积略降 |

## 常见构建报错

::: details `found dead link` / 死链报错
VitePress 会校验所有**绝对路径**内部链接。报错会指出具体文件和行号：

```text
(!) Found dead link /guide/structur in file guide/writing.md
```

修正链接即可。如果确实需要链接到不存在的页面（比如占位），把它改成完整 URL。
:::

::: details `Failed to resolve component: Xxx`
在 Markdown 里用了没有注册的组件。到 `docs/.vitepress/theme/index.ts` 的 `enhanceApp` 里注册，或者检查组件名拼写。
:::

::: details `Unexpected token` / Vue 模板编译错误
多数出现在 Markdown 里混写了 HTML 标签但没有正确闭合。检查最近的改动，特别是 `<div>` 与 `</div>` 的配对。
:::

::: details 构建时内存溢出（`JavaScript heap out of memory`）
文档量很大时会遇到。提高 Node 内存上限：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

Docker 构建时通过 `--build-arg` 或环境变量传入同样的设置。
:::

## 在 CI 中构建

任何 CI 都可以用这三步：

```yaml
- run: corepack enable
- run: pnpm install --frozen-lockfile
- run: pnpm build && pnpm test
```

::: tip 一定要加 `--frozen-lockfile`
它会确保 CI 严格按 `pnpm-lock.yaml` 安装，锁文件与 `package.json` 不一致时直接失败，避免「本地能跑、CI 挂掉」。
:::

## 下一步

- [3.2 Docker 构建与测试](/deploy/docker)
- [3.3 部署到静态托管](/deploy/hosting)
