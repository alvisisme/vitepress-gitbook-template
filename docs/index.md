---
layout: home

hero:
  name: GitBook Style Docs
  text: VitePress 文档站点模板
  tagline: 目录自动编号、代码高亮、Mermaid 流程图、数学公式开箱即用。一条命令本地预览，一个 Dockerfile 完成构建与测试。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/introduction
    - theme: alt
      text: 目录结构
      link: /guide/structure

features:
  - icon: 📖
    title: 目录自动编号
    details: 侧边栏按 1 / 1.1 / 1.1.1 自动编号，顺序由一份目录树决定，新增页面不用手写任何数字。
  - icon: 🎨
    title: GitBook 观感
    details: 左目录 + 右大纲 + 正文的三栏布局，配色、圆角、间距全部收敛在一个变量文件里。
  - icon: 🧩
    title: 插件开箱即用
    details: 代码高亮、Mermaid 图表、数学公式、提示块、自定义 Vue 组件都已经配置好。
  - icon: ⚡
    title: 极速开发体验
    details: 基于 Vite，Markdown 改完即见；产物是纯静态 HTML，可以直接丢给任意 CDN。
  - icon: 🐳
    title: Docker 构建与测试
    details: 多阶段 Dockerfile，Nginx 托管产物，并内置冒烟测试阶段，可直接接入 CI 流水线。
  - icon: 🔧
    title: 易于扩展修改
    details: 配置拆分清晰，主题采用「继承 + 覆盖」，加组件、加页面、换配色都只需要改一处。
---

<div class="gb-home">
  <div class="gb-home__section">
    <p class="gb-home__title">30 秒跑起来</p>
    <p class="gb-home__subtitle">需要 Node.js 22+ 与 pnpm</p>
    <div class="gb-home__code">

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地预览（默认 http://localhost:5173）
pnpm dev

# 3. 构建静态产物（输出到 docs/.vitepress/dist）
pnpm build
```

  </div>
  </div>

  <div class="gb-home__section">
    <p class="gb-home__title">从这里开始</p>
    <p class="gb-home__subtitle">按顺序读，大约 15 分钟可以完整上手</p>

<CardGrid>
  <Card icon="🚀" title="1 · 模板简介" href="/guide/introduction" desc="这个模板解决什么问题，适合谁用。" />
  <Card icon="📦" title="2 · 环境与安装" href="/guide/installation" desc="Node、pnpm 版本要求与安装步骤。" />
  <Card icon="🗂️" title="3 · 目录结构" href="/guide/structure" desc="每个文件负责什么，改哪里最省事。" />
  <Card icon="✍️" title="4 · 编写内容" href="/guide/writing" desc="新增一篇文档需要动哪些地方。" />
</CardGrid>

  </div>

  <div class="gb-home__section">
    <p class="gb-home__title">部署方式</p>
    <p class="gb-home__subtitle">三种常见场景，都有现成配置</p>

<CardGrid>
  <Card icon="🐳" title="Docker + Nginx" href="/deploy/docker" desc="多阶段构建、镜像瘦身、容器内冒烟测试。" />
  <Card icon="🌐" title="静态托管" href="/deploy/hosting" desc="GitHub Pages、Vercel、对象存储的接入方式。" />
  <Card icon="🔍" title="配置参考" href="/reference/site" desc="站点信息、主题选项、目录编号的完整说明。" />
</CardGrid>

  </div>
</div>
