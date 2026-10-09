---
title: Markdown 扩展语法
description: VitePress 提供的提示块、代码组、徽章、折叠面板等 Markdown 扩展语法速查。
---

# 2.1 Markdown 扩展语法

除了标准 Markdown，VitePress 还提供了一批扩展语法，模板已经全部做了样式适配。

## 提示块（Custom Containers）

五种类型，写法一致：

::: tip 小技巧
`tip` 适合放「推荐做法」「省时间的技巧」。
:::

::: info 补充说明
`info` 适合放背景知识或额外说明。
:::

::: warning 请注意
`warning` 适合放「容易踩坑」「版本限制」这类提醒。
:::

::: danger 危险操作
`danger` 用于会造成数据丢失或不可逆后果的操作。
:::

::: important 重要
`important` 用于必须遵守的约定。
:::

<details>
<summary>展开查看源码</summary>

````markdown
::: tip 小技巧
`tip` 适合放「推荐做法」「省时间的技巧」。
:::

::: info 补充说明
`info` 适合放背景知识或额外说明。
:::

::: warning 请注意
`warning` 适合放「容易踩坑」「版本限制」这类提醒。
:::

::: danger 危险操作
`danger` 用于会造成数据丢失或不可逆后果的操作。
:::

::: important 重要
`important` 用于必须遵守的约定。
:::
````

</details>

### 自定义标题

`:::` 后面的内容会作为标题显示；不写标题时使用类型默认名：

```markdown
::: warning 这里会构建失败
`link` 指向的路径必须真实存在。
:::
```

### 可折叠的提示块

用 `details` 类型，默认收起：

::: details 点开看详细步骤
1. 打开终端
2. 执行 `pnpm install`
3. 执行 `pnpm dev`
:::

## 代码组（Code Groups）

同一件事有多种写法时，用代码组把它们叠在一起，读者可以切换标签：

::: code-group

```bash [pnpm]
pnpm install
pnpm dev
```

```bash [npm]
npm install
npm run dev
```

```bash [yarn]
yarn
yarn dev
```

:::

写法是用 `::: code-group` 包住多个代码块，代码块后面的 `[标签名]` 就是标签文字。

## 徽章（Badge）

VitePress 内置了 `<Badge>` 组件，适合标注状态：

| 语法 | 效果 |
| --- | --- |
| `<Badge type="tip" text="稳定" />` | <Badge type="tip" text="稳定" /> |
| `<Badge type="warning" text="实验性" />` | <Badge type="warning" text="实验性" /> |
| `<Badge type="danger" text="已废弃" />` | <Badge type="danger" text="已废弃" /> |
| `<Badge text="默认" />` | <Badge text="默认" /> |

也可以写在标题后面：

```markdown
## 新特性 <Badge type="tip" text="v2" />
```

## 文本样式

| 写法 | 效果 | 说明 |
| --- | --- | --- |
| `**加粗**` | **加粗** | |
| `*斜体*` | *斜体* | |
| `~~删除~~` | ~~删除~~ | |
| `` `行内代码` `` | `行内代码` | 模板加了边框与浅底 |
| `==高亮==` | 需要 `markdown-it-mark` 插件 | 本模板未内置 |
| `<kbd>Ctrl</kbd>` | <kbd>Ctrl</kbd> + <kbd>C</kbd> | 键盘按键样式已适配 |
| `<mark>标记</mark>` | <mark>标记</mark> | 已适配主题色 |

## 表格与对齐

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| A | B | C |
```

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 内容 | 内容 | 内容 |
| 更长的内容 | 更长的内容 | 1,024 |

模板把表格改成了「整块圆角 + 表头浅底」的样式，并且会自动处理横向溢出。

## 折叠面板

用原生 HTML 的 `<details>` 即可，模板没有额外封装：

```html
<details>
<summary>点击展开</summary>
这里是被折叠的内容，可以放任意 Markdown。
</details>
```

::: tip 需要经常折叠吗？
如果文档里有大量折叠内容，建议改成拆成多篇文档。折叠会隐藏信息，对搜索也不友好。
:::

## 任务列表

```markdown
- [x] 已完成的项
- [ ] 待办的项
```

- [x] 目录自动编号
- [x] 代码高亮
- [x] Mermaid 图表
- [ ] 多语言支持

## Emoji

可以直接写 Unicode emoji，也可以用短代码：

```markdown
:tada: 支持 emoji 短代码
```

:tada: :rocket: :memo: :sparkles:

## 下一步

- [2.2 代码高亮](/features/code)
- [2.3 Mermaid 图表](/features/mermaid)
