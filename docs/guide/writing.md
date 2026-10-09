---
title: 编写与组织内容
description: 新增文档、新增章节、插入图片与附件的完整操作流程。
---

# 1.4 编写与组织内容

## 新增一篇文档

只有两步，不需要改任何编号。

**第一步**：新建 Markdown 文件，例如 `docs/guide/deploy-tips.md`。

```markdown
---
title: 部署小技巧
description: 几个能省时间的部署经验。
---

# 部署小技巧

正文从这里开始。
```

**第二步**：在 `docs/.vitepress/sidebar.ts` 的 `docTree` 里，把它插到想放的位置。

```ts {5}
{
  text: '快速开始',
  link: '/guide/',
  items: [
    { text: '编写与组织内容', link: '/guide/writing' },
    { text: '部署小技巧', link: '/guide/deploy-tips' },   // ← 加这一行
  ]
}
```

保存后开发服务器会自动更新，目录编号也会自动顺延，**不用手写 `1.5`**。

::: tip link 怎么写
`link` 填的是**站点路径**，不是文件路径：

- `docs/guide/writing.md` → `/guide/writing`
- `docs/guide/index.md` → `/guide/`
- `docs/index.md` → `/`

不需要写 `.html` 后缀，VitePress 会自动处理。
:::

## 新增一个章节

和新增文档一样，只是多一层 `items`：

```ts
{
  text: '进阶用法',            // 会自动变成 "5. 进阶用法"
  link: '/advanced/',          // 章节首页（可选）
  items: [
    { text: '性能优化', link: '/advanced/performance' },
    { text: '自定义插件', link: '/advanced/plugins' }
  ]
}
```

对应的文件放在 `docs/advanced/` 目录下即可。**目录名和章节名不需要一致**，但保持一致会更好维护。

## 控制序号与折叠

序号由数组位置自动决定，但你可以控制折叠行为：

```ts
{
  text: '配置参考',
  link: '/reference/',
  collapsed: false,        // false = 默认展开；true = 默认折叠；不写 = 继承默认
  items: [
    { text: '站点配置', link: '/reference/site' }
  ]
}
```

::: warning 关于 `collapsed` 的默认值
VitePress 默认在**当前页面不属于该分组**时折叠它。所以通常不需要显式设置，保持「当前章节自动展开」的体验即可。
:::

## Frontmatter 常用字段

每个 Markdown 文件开头可以用 `---` 包裹一段 YAML：

```yaml
---
title: 页面标题          # 用于 <title> 和浏览器标签
description: 页面描述     # 用于 SEO 与搜索结果摘要
outline: [2, 3]          # 只显示 h2/h3 到右侧大纲
lastUpdated: true        # 是否显示最后更新时间
editLink: true           # 是否显示「在 GitHub 上编辑此页」
---
```

只想让某个页面用不同的布局（比如首页的 `layout: home`）：

```yaml
---
layout: home
---
```

## 插入图片与静态资源

两种方式，按是否需要构建期处理来选：

::: code-group

```markdown [放在 public 目录]
<!-- 文件位置：docs/public/images/arch.png -->
![架构图](/images/arch.png)
```

```markdown [放在文档旁边]
<!-- 文件位置：docs/guide/images/arch.png -->
![架构图](./images/arch.png)
```

:::

| 方式 | 引用路径 | 特点 |
| --- | --- | --- |
| `docs/public/` | 以 `/` 开头 | 原样拷贝，路径稳定，适合 Logo、favicon |
| 文档同级目录 | 以 `./` 开头 | 参与 Vite 打包，可压缩、可加 hash，适合正文配图 |

## 内部链接

用相对路径或站点绝对路径都可以，VitePress 会在构建时校验**绝对路径链接**是否有效：

```markdown
见 [目录结构](/guide/structure)          <!-- 推荐：构建时会检查 -->
见 [目录结构](../guide/structure.md)     <!-- 也可以：相对文件路径 -->
```

::: danger 死链会中断构建
如果你把 `/guide/structure` 写成了 `/guide/structur`，`pnpm build` 会直接报错并指出文件位置。这是有意为之——避免上线后才发现点不开。
:::

## 代码块的基本用法

常见需求一览，详细说明见 [2.2 代码高亮](/features/code)。

````markdown
```ts{2,4-5}                    // 高亮第 2 行和第 4~5 行
```ts:line-numbers             // 显示行号
```ts:line-numbers=100         // 行号从 100 开始
```ts[config.mts]              // 自定义标题（显示在右上角）
```diff                       // diff 高亮
```
````

## 修改已有页面的顺序

直接把 `docTree` 里对应的那一行**上下移动**即可，编号会自动重排。不需要改文件名，也不需要改页面里的任何内容。

## 下一步

内容组织方式清楚了，接下来看 [2. 功能特性](/features/)，了解 Markdown 还能写出什么效果。
