---
title: 目录与自动编号
description: sidebar.mts 的编号规则、嵌套层级、折叠控制，以及常见的目录调整场景。
---

# 4.2 目录与自动编号

整站目录由 `docs/.vitepress/sidebar.mts` 一个文件决定。这一节把规则讲清楚。

## 数据结构

```ts
export interface DocNode {
  text: string          // 章节名（不要写序号）
  link?: string         // 站点路径，省略则只作为分组
  items?: DocNode[]     // 子节点
  collapsed?: boolean   // 是否默认折叠
}
```

## 编号规则

规则只有一条：**数组里的位置决定序号，层级决定前缀**。

```ts
export const docTree: DocNode[] = [
  {
    text: '快速开始',              // → 1.
    link: '/guide/',
    items: [
      { text: '模板简介', link: '/guide/introduction' },      // → 1.1
      { text: '环境要求与安装', link: '/guide/installation' } // → 1.2
    ]
  },
  {
    text: '功能特性',              // → 2.
    link: '/features/',
    items: [
      { text: 'Markdown 扩展语法', link: '/features/markdown' } // → 2.1
    ]
  }
]
```

渲染出来的侧边栏：

```text
1. 快速开始
  1.1 模板简介
  1.2 环境要求与安装
2. 功能特性
  2.1 Markdown 扩展语法
```

::: tip 序号是写进文本的，不是 CSS 计数器
`numberSidebar()` 会把 `text` 改写成 `"1.1 模板简介"` 再交给 VitePress。这样做的好处是：序号出现在真实 DOM 里，可以被搜索、被复制、被测试脚本断言，也不会因为折叠状态导致编号错乱。
:::

## 编号函数

```ts
export function numberSidebar(nodes: DocNode[], prefix = ''): DefaultTheme.SidebarItem[] {
  return nodes.map((node, index) => {
    const num = prefix ? `${prefix}.${index + 1}` : `${index + 1}`

    const item: DefaultTheme.SidebarItem = { text: `${num}. ${node.text}` }
    if (node.link) item.link = node.link
    if (node.collapsed !== undefined) item.collapsed = node.collapsed
    if (node.items?.length) item.items = numberSidebar(node.items, num)

    return item
  })
}
```

它做三件事：算出当前节点的序号 → 改写 `text` → 递归处理子节点（把当前序号当作子节点的前缀）。

## 嵌套层级

VitePress 支持多层嵌套。三层的样子：

```ts
{
  text: '部署指南',            // 3.
  link: '/deploy/',
  items: [
    {
      text: '容器化',          // 3.1（无 link，纯分组）
      items: [
        { text: 'Docker 构建', link: '/deploy/docker' },   // 3.1.1
        { text: 'Nginx 配置', link: '/deploy/nginx' }      // 3.1.2
      ]
    },
    { text: '静态托管', link: '/deploy/hosting' }          // 3.2
  ]
}
```

```text
3. 部署指南
  3.1. 容器化
    3.1.1. Docker 构建
    3.1.2. Nginx 配置
  3.2. 静态托管
```

::: warning 别嵌太深
超过三层后侧边栏会变得难读，而且缩进会挤压文字宽度。建议控制在两层，最多三层。
:::

## 纯分组（没有对应页面）

不写 `link` 的节点只作为分组标题，不可点击：

```ts
{
  text: '参考资料',
  items: [
    { text: '更新日志', link: '/reference/changelog' }
  ]
}
```

## 折叠控制

```ts
{ text: '配置参考', link: '/reference/', collapsed: false, items: [...] }
```

| 值 | 行为 |
| --- | --- |
| 不写 | 继承默认：**当前页面属于该分组时展开，否则折叠** |
| `false` | 始终默认展开 |
| `true` | 始终默认折叠 |

大多数情况不写最好，VitePress 会自动展开当前所在的章节。

## 常见调整场景

### 插入一篇新文档

在对应位置加一行，后面的编号自动顺延：

```ts
items: [
  { text: '模板简介', link: '/guide/introduction' },
  { text: '迁移指南', link: '/guide/migration' },      // ← 新增，自动变成 1.2
  { text: '环境要求与安装', link: '/guide/installation' } // 自动变成 1.3
]
```

### 调整章节顺序

把整段 `{ ... }` 上下移动即可。**不需要改文件名，也不需要改页面内容。**

### 把一篇文档换到另一个章节

改 `link` 所在的位置，文件本身可以留在原目录，也可以移动。两者互不影响：

```ts
// 文档仍在 docs/guide/docker.md，但目录里挂到「部署指南」下
{ text: 'Docker 构建', link: '/guide/docker' }
```

::: tip 建议还是保持目录与章节一致
虽然技术上可以不对应，但把 `docs/<章节>/<文档>.md` 与目录树保持一致，后期维护会轻松很多。
:::

### 让某篇文档不出现在目录里

从 `docTree` 里删掉即可。页面仍然可以通过直接输入 URL 访问。如果需要**完全屏蔽访问**，VitePress 没有内置机制，可以在页面 frontmatter 里加 `layout: false` 或改用构建脚本过滤。

### 给某个章节加分组标题

VitePress 支持多个 sidebar 分组，但模板用的是单个数组。如果确实需要「分组 + 标题」，可以在 `config.mts` 里把 `sidebar` 从数组改成对象形式：

```ts
sidebar: {
  '/guide/': [{ text: '指南', items: sidebar }],
  '/reference/': [{ text: '参考', items: referenceSidebar }]
}
```

## 开发时的注意事项

::: warning 改了 sidebar.mts 需要重启 dev server
`sidebar.mts` 在**配置加载阶段**执行。VitePress 会监听配置文件变化并重启服务，但如果你发现目录没更新，手动重启一次 `pnpm dev` 就好。
:::

::: tip 新增 Markdown 文件不会自动进目录
模板走的是「显式目录树」而不是「扫描文件系统」，这是刻意的设计——目录顺序可控、可 review。新增页面后记得同步 `docTree`。
:::

## 编号出现在哪些地方

| 位置 | 是否有编号 | 原因 |
| --- | --- | --- |
| 左侧目录 | ✅ 有 | `numberSidebar()` 写进 `text` |
| 右侧「本页目录」 | ❌ 无 | 由页面标题自动生成，正文标题里不用写序号 |
| 上一篇 / 下一篇 | ❌ 无 | 显示页面 `title`，不带序号 |
| 搜索结果 | ✅ 有 | 索引的是侧边栏文本 |

::: tip 正文标题要不要写序号
**不需要**。侧边栏已经承担了编号职责，正文里再写一遍会出现「1.1 1.1 模板简介」这种重复。模板默认的写法是正文只用 `# 标题`，序号交给目录。
:::

## 下一步

- [4.3 常见问题](/reference/faq)
- [1.4 编写与组织内容](/guide/writing)
