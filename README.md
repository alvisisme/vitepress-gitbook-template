# GitBook Style Docs

> 基于 **VitePress** 的 GitBook 风格静态文档站点模板 —— 目录自动编号、代码高亮、Mermaid 流程图、数学公式开箱即用，并提供多阶段 Dockerfile 完成构建与测试。

一个可以直接拿来写书的文档工程：clone 下来改个标题，就能开始写内容。

---

## ✨ 特性

| | 特性 | 说明 |
| --- | --- | --- |
| 📖 | **目录自动编号** | 侧边栏按 `1` / `1.1` / `1.1.1` 自动编号，只维护一份目录树，新增页面不用手写数字 |
| 🎨 | **GitBook 观感** | 左目录 + 右大纲 + 正文三栏布局，配色、圆角、间距集中在 `vars.css` |
| 💻 | **代码高亮** | Shiki 构建期高亮，支持行高亮、行号、diff、代码组，双主题跟随明暗模式 |
| 📊 | **Mermaid 图表** | 流程图、时序图、状态图、类图、ER 图、甘特图、饼图，懒加载不拖慢首屏 |
| 🧮 | **数学公式** | MathJax 构建期渲染，产物不依赖客户端字体 |
| 🔍 | **本地搜索** | MiniSearch 纯前端搜索，针对中文做了单字分词 |
| 🧩 | **自定义组件** | 内置 `<Card>` / `<CardGrid>`，加自己的全局组件只需三步 |
| 🐳 | **Docker 构建与测试** | 多阶段构建 + Nginx 托管 + 独立的冒烟测试阶段 |
| 🔧 | **易于扩展** | 主题采用「继承 + 覆盖」，不 fork VitePress，升级无痛 |

## 🚀 快速开始

```bash
# 环境要求：Node.js >= 22，pnpm >= 9
node -v
pnpm -v

# 安装依赖
pnpm install

# 启动开发服务器 → http://localhost:5173
pnpm dev

# 构建静态产物 → docs/.vitepress/dist
pnpm build

# 本地预览构建产物 → http://localhost:4173
pnpm preview

# 对构建产物做冒烟测试
pnpm test
```

## 🐳 Docker

```bash
# 构建并运行 → http://localhost:8080
docker compose up -d --build

# 或者手动
docker build -t docs-site:latest .
docker run --rm -p 8080:80 docs-site:latest

# 一条命令跑完「构建 → 测试 → 起容器 → HTTP 校验」
pnpm run docker:verify
```

Dockerfile 分五个阶段：

```text
base ──► deps ──► build ──┬──► test      （只跑产物冒烟测试）
   │                      │
   └──────────────────────┴──► runtime   （nginx + 静态文件，最终镜像）
```

最终镜像**不含 Node、源码和 node_modules**，只有 Nginx 加静态产物。

## 📁 目录结构

```text
.
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts            # ★ 站点总配置
│   │   ├── sidebar.mts           # ★ 目录树 + 自动编号
│   │   ├── plugins/mermaid.mts   # Mermaid markdown-it 插件
│   │   └── theme/
│   │       ├── index.ts          # ★ 主题入口（继承默认主题 + 注册组件）
│   │       ├── components/       # Mermaid / Card / CardGrid
│   │       └── styles/           # 分层的样式文件
│   ├── public/                   # 原样拷贝到产物根目录
│   ├── index.md                  # 首页
│   ├── guide/                    # 1. 快速开始
│   ├── features/                 # 2. 功能特性
│   ├── deploy/                   # 3. 部署指南
│   └── reference/                # 4. 配置参考
├── docker/nginx.conf             # 运行时 Nginx 配置
├── scripts/                      # 清理与 Docker 校验脚本
├── tests/smoke.mjs               # 构建产物冒烟测试
├── Dockerfile
└── docker-compose.yml
```

## ⚙️ 最常改的几个地方

| 我想改… | 改这个文件 |
| --- | --- |
| 站点名称 / 描述 / 域名 | [`docs/.vitepress/config.mts`](docs/.vitepress/config.mts) 顶部的 `SITE` 对象 |
| 目录顺序与章节标题 | [`docs/.vitepress/sidebar.mts`](docs/.vitepress/sidebar.mts) 的 `docTree` |
| 主色 / 字体 / 圆角 | [`docs/.vitepress/theme/styles/vars.css`](docs/.vitepress/theme/styles/vars.css) |
| 首页文案与卡片 | [`docs/index.md`](docs/index.md) |
| 代码高亮主题 | `config.mts` 里的 `markdown.theme` |
| 新增全局组件 | `theme/components/` + [`theme/index.ts`](docs/.vitepress/theme/index.ts) |
| 线上缓存策略 / 安全头 | [`docker/nginx.conf`](docker/nginx.conf) |

### 目录编号是怎么来的

只需要维护一份数组，顺序就是编号：

```ts
// docs/.vitepress/sidebar.mts
export const docTree: DocNode[] = [
  {
    text: '快速开始',                    // → 1.
    link: '/guide/',
    items: [
      { text: '模板简介', link: '/guide/introduction' },       // → 1.1
      { text: '环境要求与安装', link: '/guide/installation' }  // → 1.2
    ]
  }
  // ...
]
```

插入一行，后面的编号自动顺延。详见 [4.2 目录与自动编号](docs/reference/sidebar.md)。

### 换主色

```css
/* docs/.vitepress/theme/styles/vars.css */
:root {
  --vp-c-brand-1: #2f5fe0;
  --vp-c-brand-2: #2450c8;
  --vp-c-brand-3: #1d43ab;
  --vp-c-brand-soft: rgba(47, 95, 224, 0.14);
}
```

## 📝 写作

````markdown
# 页面标题

普通 Markdown 直接写。代码块：

```ts{2}
const a = 1
const b = 2   // 这一行会高亮
```

流程图：

```mermaid
flowchart LR
  A[开始] --> B{判断}
  B -->|是| C[执行]
```

公式：$E = mc^2$

提示块：

::: tip 小技巧
内容
:::
````

完整语法见站点里的 **2. 功能特性** 章节。

## 🧪 测试

`tests/smoke.mjs` 不依赖任何第三方包，直接检查构建产物，覆盖：

1. 22 个预期页面是否全部生成；
2. 侧边栏编号（`1.` ~ `4.`、`1.1` ~ `1.4`）是否正确；
3. 首页 Hero、代码高亮、Mermaid 占位、MathJax 公式是否渲染；
4. HTML 里有没有 `{{ }}` 或未解析组件等编译残留；
5. 遍历所有 `href` / `src`，确认**站内链接无死链**；
6. 静态资源与懒加载 chunk 是否正确产出。

```bash
pnpm build && pnpm test
```

## 📦 部署

产物是纯静态文件，支持任意静态托管：

- **Docker + Nginx**（推荐，见上）
- **GitHub Pages** —— 示例工作流在 [`.github/workflows/`](.github/workflows/)
- **Vercel / Netlify** —— `outputDirectory` 指向 `docs/.vitepress/dist`
- **对象存储 + CDN** —— 上传 `dist` 目录内容，错误文档设为 `404.html`

::: 部署前记得
把 `config.mts` 里的 `SITE.url` 和 `SITE.repo` 改成真实地址；如果部署在子路径，还要设置 `base: '/子路径/'`。
:::

## 📄 许可证

[MIT](LICENSE)
