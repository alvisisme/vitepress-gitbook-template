import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'
import { mermaidPlugin } from './plugins/mermaid'

/**
 * ============================================================
 *  站点基础信息 —— 改这里就够了
 * ============================================================
 */
const SITE = {
  /** 部署后的完整域名，用于生成 sitemap 与 og 标签 */
  url: 'https://your-domain.example',
  title: 'GitBook Style Docs',
  description:
    '基于 VitePress 的 GitBook 风格静态文档模板：目录自动编号、代码高亮、Mermaid 流程图、数学公式，支持 Docker 构建与测试。',
  /** 仓库地址，用于「编辑此页」与社交链接 */
  repo: 'https://github.com/your-org/vitepress-gitbook-template',
  lang: 'zh-CN'
}

/**
 * 中文（CJK）分词器。
 *
 * VitePress 本地搜索底层是 MiniSearch，默认按空格切词，
 * 中文整句会被当成一个 token，导致「输入两个字搜不到」。
 * 这里把 CJK 片段拆成单字，检索体验和 GitBook 接近。
 */
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

function tokenize(text: string): string[] {
  return text
    .split(/[\s\u3000\-_/.,;:!?'"()[\]{}<>|@#$%^&*+=~`\\]+/)
    .flatMap((chunk) => (CJK_RE.test(chunk) ? chunk.split('') : [chunk]))
    .map((token) => token.trim())
    .filter(Boolean)
}

export default defineConfig({
  // ---------------- 基础信息 ----------------
  lang: SITE.lang,
  title: SITE.title,
  description: SITE.description,
  base: '/',
  // 产物中保留 .html，兼容 GitHub Pages / Nginx / 对象存储等所有静态托管
  cleanUrls: false,
  lastUpdated: true,
  sitemap: { hostname: SITE.url },
  // 文档里经常需要写 http://localhost:5173 这类本地地址，
  // 它们不是站内链接，跳过死链校验。
  ignoreDeadLinks: [/^https?:\/\/localhost(:\d+)?/, /^https?:\/\/127\.0\.0\.1(:\d+)?/],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#2f5fe0' }],
    ['meta', { name: 'author', content: SITE.title }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: SITE.title }],
    ['meta', { property: 'og:description', content: SITE.description }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  // ---------------- Markdown 渲染 ----------------
  markdown: {
    // 代码高亮：Shiki 双主题，跟随浅色 / 深色模式自动切换
    theme: { light: 'github-light', dark: 'github-dark' },
    // 行号默认关闭，需要时在代码块上写 `:line-numbers` 单独开启
    lineNumbers: false,
    // 数学公式（依赖 markdown-it-mathjax3，构建期渲染成内联 SVG）
    math: true,
    // 图片懒加载
    image: { lazyLoading: true },
    // 注意：不要关闭 anchor.permalink（默认是开启的）。
    // 标题里的锚点链接是 VitePress 本地搜索切分章节的依据，
    // 关掉之后搜索索引会变成空的。隐藏锚点是靠 CSS 做的。
    // 自定义 markdown-it 插件在这里注册
    config: (md) => {
      md.use(mermaidPlugin)
    }
  },

  // ---------------- 主题 ----------------
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'GitBook Style Docs',

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: '功能', link: '/features/', activeMatch: '^/features/' },
      { text: '部署', link: '/deploy/', activeMatch: '^/deploy/' },
      { text: '参考', link: '/reference/', activeMatch: '^/reference/' }
    ],

    // 由 sidebar.mts 自动生成，带 1. / 1.1 / 1.1.1 顺序编号
    sidebar,

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize,
            // 标题权重更高，正文次之
            processTerm: (term: string) => term.toLowerCase()
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },
        detailedView: true
      }
    },

    socialLinks: [{ icon: 'github', link: SITE.repo }],

    editLink: {
      pattern: `${SITE.repo}/edit/main/docs/:path`,
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' }
    },

    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    langMenuLabel: '切换语言',
    externalLinkIcon: true,

    footer: {
      message: '基于 VitePress 构建 · 采用 MIT 许可证发布',
      copyright: `Copyright © ${new Date().getFullYear()} GitBook Style Docs`
    },

    notFound: {
      title: '页面走丢了',
      quote: '你访问的地址不存在，或者内容已经被移动到别处。',
      linkLabel: '回到首页',
      linkText: '返回首页'
    }
  },

  // ---------------- 构建 ----------------
  vite: {
    build: {
      // mermaid 是懒加载的大 chunk，提高告警阈值避免噪音
      chunkSizeWarningLimit: 2000
    }
  }
})
