---
title: 站点与主题配置
description: docs/.vitepress/config.mts 中每一项配置的作用、可选值与修改示例。
---

# 4.1 站点与主题配置

配置文件是 `docs/.vitepress/config.mts`，分成四块。下面按块说明。

## 站点基础信息

```ts
const SITE = {
  url: 'https://your-domain.example',
  title: 'GitBook Style Docs',
  description: '基于 VitePress 的 GitBook 风格静态文档模板……',
  repo: 'https://github.com/your-org/vitepress-gitbook-template',
  lang: 'zh-CN'
}
```

| 字段 | 作用 | 注意 |
| --- | --- | --- |
| `url` | 生成 `sitemap.xml` 和 og 标签的基准地址 | **部署前必须改成真实域名** |
| `title` | 站点名称，显示在顶部导航和浏览器标签 | |
| `description` | 默认页面描述，用于 SEO | |
| `repo` | 仓库地址，用于「编辑此页」和社交链接 | 改成自己的仓库 |
| `lang` | HTML 的 `lang` 属性，同时决定 VitePress 内置文案语言 | 改 `zh-CN` 会失去中文界面文案 |

::: tip 中文界面文案
VitePress 内置了中文翻译，`lang: 'zh-CN'` 时「上一篇 / 下一篇」「回到顶部」等会自动显示中文。模板又额外覆盖了几个标签（`docFooter`、`outline.label` 等），所以即使不设 `lang` 也是中文。
:::

## 路由与 URL

```ts
export default defineConfig({
  base: '/',
  cleanUrls: false,
  lastUpdated: true,
  sitemap: { hostname: SITE.url }
})
```

### `base`

部署在子路径时必填：

```ts
base: '/my-docs/'    // 部署在 https://example.com/my-docs/
```

::: danger 前后斜杠都不能少
写成 `'my-docs'` 或 `'/my-docs'` 都会导致资源路径错误、页面白屏。
:::

### `cleanUrls`

| 值 | 产物 URL | 适用场景 |
| --- | --- | --- |
| `false`（默认） | `/guide/introduction.html` | 所有静态托管都能用 |
| `true` | `/guide/introduction` | 需要服务器支持无扩展名路由 |

模板选择 `false`，因为它在 GitHub Pages、对象存储、`python -m http.server` 上都不会出问题。如果换成 `true`，记得同步调整 `docker/nginx.conf` —— 模板里的 `try_files $uri $uri/ $uri.html` 已经兼容两种写法。

### `lastUpdated`

需要 git 历史。在 CI 里记得 `fetch-depth: 0`，否则时间会不准。在 Docker 构建中，因为 `.git` 被 `.dockerignore` 排除，这项会静默跳过（不会报错）。

## Markdown 渲染

```ts
markdown: {
  theme: { light: 'github-light', dark: 'github-dark' },
  lineNumbers: false,
  math: true,
  image: { lazyLoading: true },
  anchor: { permalink: false },
  config: (md) => {
    md.use(mermaidPlugin)
  }
}
```

| 配置 | 说明 |
| --- | --- |
| `theme` | Shiki 高亮主题，浅色 / 深色各一个 |
| `lineNumbers` | 是否全局显示行号；建议保持 `false`，按块用 `:line-numbers` 开启 |
| `math` | 是否启用数学公式，需要 `markdown-it-mathjax3` |
| `image.lazyLoading` | 图片懒加载 |
| `anchor.permalink` | 标题锚点链接图标；模板用 CSS 控制成「悬停才出现」 |
| `config` | 注册额外 markdown-it 插件的地方 |

::: tip 想加更多 Markdown 语法
在 `config` 回调里继续 `md.use(...)` 即可，比如加脚注、下标、任务列表增强等：

```ts
import footnote from 'markdown-it-footnote'

config: (md) => {
  md.use(mermaidPlugin)
  md.use(footnote)
}
```
:::

## 主题配置

### 顶部导航

```ts
nav: [
  { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
  { text: '功能', link: '/features/', activeMatch: '^/features/' }
]
```

`activeMatch` 是正则，决定当前路径命中时哪个导航项高亮。加下拉菜单：

```ts
{
  text: '资源',
  items: [
    { text: '更新日志', link: '/reference/changelog' },
    { text: 'GitHub', link: 'https://github.com/...' }
  ]
}
```

### 侧边栏

模板把侧边栏放在 `sidebar.mts` 里生成，见 [4.2 目录与自动编号](/reference/sidebar)。

### 右侧大纲

```ts
outline: {
  level: [2, 3],       // 显示 h2、h3
  label: '本页目录'
}
```

只显示 h2 用 `level: 2`；想显示到 h4 用 `[2, 4]`。层级越深右侧越拥挤，一般不建议超过 4。

单个页面可以用 frontmatter 覆盖：

```yaml
---
outline: [2, 3]
---
```

### 本地搜索

```ts
search: {
  provider: 'local',
  options: {
    miniSearch: {
      options: { tokenize, processTerm: (t) => t.toLowerCase() },
      searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
    },
    detailedView: true
  }
}
```

模板自定义了 `tokenize`：把中文按**单字**切分。因为 MiniSearch 默认按空格切词，中文整句会变成一个 token，导致搜「模板」搜不到「这是一个模板工程」。

| 选项 | 说明 |
| --- | --- |
| `fuzzy` | 模糊匹配强度，`0.2` 允许一个字符的差异 |
| `prefix` | 前缀匹配，输入「配」能匹配到「配置」 |
| `boost` | 字段权重，标题命中排更前 |
| `detailedView` | 搜索结果展开显示上下文 |

::: tip 想换成 Algolia
把 `provider` 换成 `'algolia'` 并填入 `appId` / `apiKey` / `indexName`。中文分词由 Algolia 侧处理，不需要 `tokenize`。
:::

### 编辑链接与页脚

```ts
editLink: {
  pattern: 'https://github.com/your-org/repo/edit/main/docs/:path',
  text: '在 GitHub 上编辑此页'
},
footer: {
  message: '基于 VitePress 构建 · 采用 MIT 许可证发布',
  copyright: 'Copyright © 2025 GitBook Style Docs'
}
```

`:path` 会被替换成文件相对于 `docs/` 的路径，例如 `guide/introduction.md`。

### 中文界面标签

```ts
docFooter: { prev: '上一篇', next: '下一篇' },
returnToTopLabel: '回到顶部',
sidebarMenuLabel: '目录',
darkModeSwitchLabel: '外观',
lightModeSwitchTitle: '切换到浅色模式',
darkModeSwitchTitle: '切换到深色模式',
langMenuLabel: '切换语言',
externalLinkIcon: true
```

### 404 页面

```ts
notFound: {
  title: '页面走丢了',
  quote: '你访问的地址不存在，或者内容已经被移动到别处。',
  linkLabel: '回到首页',
  linkText: '返回首页'
}
```

## 构建选项

```ts
vite: {
  build: {
    chunkSizeWarningLimit: 2000
  }
}
```

Mermaid 是个大依赖（约 1MB+），但它是懒加载的独立 chunk，所以把告警阈值调高避免噪音。

需要调优构建时还可以加：

```ts
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 把不常变的依赖单独打包，利用浏览器缓存
        }
      }
    }
  }
}
```

## 完整配置示例

把上面几块拼起来的最小可用配置：

```ts
import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'
import { mermaidPlugin } from './plugins/mermaid'

export default defineConfig({
  lang: 'zh-CN',
  title: '我的文档',
  description: '基于 VitePress 的文档站点',
  lastUpdated: true,
  sitemap: { hostname: 'https://docs.example.com' },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    math: true,
    config: (md) => md.use(mermaidPlugin)
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: [{ text: '指南', link: '/guide/' }],
    sidebar,
    outline: { level: [2, 3], label: '本页目录' },
    search: { provider: 'local' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    footer: { message: '基于 VitePress 构建' }
  }
})
```

## 下一步

- [4.2 目录与自动编号](/reference/sidebar)
- [4.3 常见问题](/reference/faq)
