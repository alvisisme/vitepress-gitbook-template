---
title: 快速开始
description: 从零开始了解这个 GitBook 风格文档模板，并在五分钟内把站点跑起来。
---

# 1. 快速开始

这一章帮你把模板跑起来，并弄清楚「什么内容放在什么文件里」。读完本章你就能独立往里写文档了。

## 1.1 本章内容

<CardGrid>
  <Card icon="🚀" title="模板简介" href="/guide/introduction" desc="模板能做什么、技术选型，以及它和原生 VitePress 的差别。" />
  <Card icon="📦" title="环境要求与安装" href="/guide/installation" desc="Node / pnpm 版本要求，安装、开发、构建、预览四条命令。" />
  <Card icon="🗂️" title="目录结构说明" href="/guide/structure" desc="每个目录和文件负责什么，想改某样东西该去哪里。" />
  <Card icon="✍️" title="编写与组织内容" href="/guide/writing" desc="新增一篇文档、新增一个章节的完整操作流程。" />
</CardGrid>

## 1.2 五分钟上手

假设你已经装好了 Node.js 24（最低支持 22）和 pnpm 12，那么只需要四条命令：

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器，默认 http://localhost:5173
pnpm build       # 构建静态产物到 docs/.vitepress/dist
pnpm preview     # 本地预览构建产物
```

::: tip 提示
`pnpm dev` 有热更新，改完 Markdown 保存即可在浏览器里看到效果，不需要重启。
:::

## 1.3 这个模板解决了什么

原生 VitePress 已经足够强大，但要拿来当「书写工具」还差几件事，这个模板把它们补齐了：

| 问题 | 模板的做法 |
| --- | --- |
| 侧边栏要手写全部标题，改顺序很痛苦 | 只维护一份目录树，序号 `1.` / `1.1` 自动生成 |
| 默认主题偏「产品官网」，不像文档 | 定制为 GitBook 观感：左目录、右大纲、克制的配色 |
| 流程图、公式要自己接插件 | Mermaid、MathJax 已接好，直接写代码块就能用 |
| 部署要自己写 Dockerfile | 提供多阶段 Dockerfile + Nginx + 冒烟测试 |
| 换个主色要翻遍 CSS | 所有设计变量集中在 `vars.css` |

## 1.4 下一步

如果你只想赶紧开始写内容，直接跳到 [1.3 目录结构说明](/guide/structure)；如果你想先了解整体设计，从 [1.1 模板简介](/guide/introduction) 开始按顺序读。

准备好了吗？继续看 [2. 功能特性](/features/) 了解 Markdown 语法和各类插件。
