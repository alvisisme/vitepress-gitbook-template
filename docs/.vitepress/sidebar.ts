import type { DefaultTheme } from 'vitepress'

/**
 * 目录树中的一个节点。
 *
 * - `text`：章节名称，**不要手写序号**，序号由 `numberSidebar()` 自动生成。
 * - `link`：对应页面路径；省略时该节点只作为分组标题。
 * - `items`：子章节。
 * - `collapsed`：是否默认折叠（不写则继承 VitePress 默认行为）。
 */
export interface DocNode {
  text: string
  link?: string
  items?: DocNode[]
  collapsed?: boolean
}

/**
 * ============================================================
 *  整站目录（唯一需要维护的地方）
 * ============================================================
 *
 * 规则很简单：**数组顺序 = 目录标号顺序**。
 *
 *   - 第 1 个一级章节 → `1.`
 *   - 它下面的第 2 个子节点 → `1.2`
 *   - 再下面一层 → `1.2.3`
 *
 * 新增一篇文档：在对应位置插入一个 `{ text, link }` 即可，
 * 后面的编号会自动顺延，不需要手工改任何数字。
 */
export const docTree: DocNode[] = [
  {
    text: '快速开始',
    link: '/guide/',
    items: [
      { text: '模板简介', link: '/guide/introduction' },
      { text: '环境要求与安装', link: '/guide/installation' },
      { text: '目录结构说明', link: '/guide/structure' },
      { text: '编写与组织内容', link: '/guide/writing' }
    ]
  },
  {
    text: '功能特性',
    link: '/features/',
    items: [
      { text: 'Markdown 扩展语法', link: '/features/markdown' },
      { text: '代码高亮', link: '/features/code' },
      { text: 'Mermaid 图表', link: '/features/mermaid' },
      { text: '数学公式', link: '/features/math' },
      { text: '组件与主题定制', link: '/features/customize' }
    ]
  },
  {
    text: '部署指南',
    link: '/deploy/',
    items: [
      { text: '本地构建与预览', link: '/deploy/build' },
      { text: 'Docker 构建与测试', link: '/deploy/docker' },
      { text: '部署到静态托管', link: '/deploy/hosting' }
    ]
  },
  {
    text: '配置参考',
    link: '/reference/',
    items: [
      { text: '站点与主题配置', link: '/reference/site' },
      { text: '目录与自动编号', link: '/reference/sidebar' },
      { text: '常见问题', link: '/reference/faq' }
    ]
  }
]

/**
 * 把目录树转换为 VitePress 的 sidebar 结构，并递归地加上 `1.` / `1.1` / `1.1.1` 形式的序号。
 *
 * @param nodes  目录树
 * @param prefix 父级序号，顶层为空字符串
 */
export function numberSidebar(nodes: DocNode[], prefix = ''): DefaultTheme.SidebarItem[] {
  return nodes.map((node, index) => {
    const num = prefix ? `${prefix}.${index + 1}` : `${index + 1}`

    // 顶层写 "1. 快速开始"，子级写 "1.1 模板简介"、"1.1.1 xxx"：
    // 只有顶层带结尾点号，避免出现 "1.1. 模板简介" 这种双重标点。
    const label = prefix ? `${num} ${node.text}` : `${num}. ${node.text}`

    const item: DefaultTheme.SidebarItem = { text: label }

    if (node.link) item.link = node.link
    if (node.collapsed !== undefined) item.collapsed = node.collapsed
    if (node.items?.length) item.items = numberSidebar(node.items, num)

    return item
  })
}

/** 生成好的侧边栏配置，直接交给 `themeConfig.sidebar` 使用 */
export const sidebar: DefaultTheme.SidebarItem[] = numberSidebar(docTree)
