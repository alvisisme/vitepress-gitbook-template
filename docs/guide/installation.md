---
title: 环境要求与安装
description: Node.js 与 pnpm 的版本要求，以及安装、开发、构建、预览的完整命令说明。
---

# 1.2 环境要求与安装

## 版本要求

| 工具 | 最低版本 | 推荐版本 | 说明 |
| --- | --- | --- | --- |
| Node.js | 22.0.0 | 24.x LTS | VitePress 1.x 要求 Node 18+，本模板按 22+ 校验 |
| pnpm | 9.0.0 | 10.x / 12.x | 也可用 npm / yarn，但锁文件与 Dockerfile 按 pnpm 编写 |
| Git | 2.30+ | 最新版 | 只有 `lastUpdated` 需要；缺失时模板会自动关掉它 |

::: warning 注意
`package.json` 里通过 `engines` 字段声明了版本要求。如果你的 Node 版本过低，安装时会直接报错，避免出现莫名其妙的构建失败。
:::

检查当前版本：

```bash
node -v    # v24.x.x
pnpm -v    # 10.x 或更高
git --version
```

## 安装 Node.js

推荐用版本管理工具，避免污染系统环境：

::: code-group

```bash [fnm]
# 安装 fnm（macOS）
brew install fnm
# 让 fnm 接管 shell（写入 ~/.zshrc）
eval "$(fnm env --use-on-cd)"

# 在项目目录下会自动读取 .nvmrc
fnm install
fnm use
```

```bash [nvm]
# 安装 nvm 后
nvm install 24
nvm use 24
```

```bash [官方安装包]
# 直接到 https://nodejs.org 下载 LTS 版本安装即可
node -v
```

:::

项目根目录已经提供 `.nvmrc`，内容为 `24`，所以 `fnm use` / `nvm use` 会自动切到正确的版本。

## 安装 pnpm

Node 16.13 之后自带 Corepack，可以直接启用：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

也可以独立安装：

```bash
npm install -g pnpm
```

## 安装依赖

在项目根目录执行：

```bash
pnpm install
```

如果需要指定镜像源（例如国内网络）：

```bash
pnpm config set registry https://registry.npmmirror.com
```

## 四条常用命令

```bash
pnpm dev        # 启动开发服务器，默认 http://localhost:5173
pnpm build      # 构建静态产物到 docs/.vitepress/dist
pnpm preview    # 本地预览构建产物，默认 http://localhost:4173
pnpm test       # 对构建产物做冒烟测试（需要先 build）
```

::: tip 为什么 build 之后还要 test
`pnpm build` 只能证明「没有报错」，不能证明「页面内容是对的」。`pnpm test` 会检查产物里关键页面是否存在、导航结构是否完整、Mermaid 占位符有没有生成，适合放进 CI。
:::

其他辅助命令：

| 命令 | 作用 |
| --- | --- |
| `pnpm run clean` | 清理 `dist` 与 VitePress 缓存目录 |
| `pnpm run verify` | 等价于 `build` + `test` |
| `pnpm run docker:build` | 构建生产镜像 |
| `pnpm run docker:verify` | 构建镜像、启动容器并做 HTTP 校验 |

## 常见安装问题

::: details 报错 `Unsupported engine` / `notsup`
Node 版本低于 `engines` 要求。用 `node -v` 确认，并通过 fnm / nvm 切到 22 以上。
:::

::: details pnpm 提示 peer dependency 警告
一般可以忽略。VitePress 的部分插件 peer 范围较宽，pnpm 会给出提示但不影响构建。
:::

::: details 首次 `pnpm dev` 很慢
首次启动 Vite 需要预构建依赖（VitePress、Vue、Shiki 等），通常 10~30 秒。之后启动会走缓存，通常在 2 秒内。
:::

## 下一步

装好之后，先看一眼 [1.3 目录结构说明](/guide/structure)，知道每个文件放在哪里。
