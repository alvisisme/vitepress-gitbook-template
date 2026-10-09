---
title: 代码高亮
description: 行高亮、行号、diff、聚焦、代码组，以及如何更换 Shiki 高亮主题。
---

# 2.2 代码高亮

代码高亮由 VitePress 内置的 [Shiki](https://shiki.style/) 完成，**在构建期**就渲染成带样式的 HTML，所以运行时零成本，也不需要加载高亮库。

## 基础用法

````markdown
```ts
export function greet(name: string): string {
  return `Hello, ${name}!`
}
```
````

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`
}
```

语言标记写在开头三个反引号之后。不写语言时不会高亮，但仍然按代码块排版。

```text
这是纯文本代码块，没有语法高亮。
```

## 行高亮

在语言后面加 `{行号}`，支持逗号与区间：

````markdown
```ts{2,5-7}
````

```ts{2,5-7}
interface User {
  id: number
  name: string
  email: string
  roles: string[]
  createdAt: Date
  updatedAt: Date
}
```

| 写法 | 含义 |
| --- | --- |
| `{2}` | 只高亮第 2 行 |
| `{2,5}` | 高亮第 2 行和第 5 行 |
| `{5-7}` | 高亮第 5 到 7 行 |
| `{2,5-7}` | 混合使用 |

## 行号

模板默认**不显示行号**（文档里大多数代码块并不需要）。需要时按块开启：

````markdown
```ts:line-numbers
```
````

```ts:line-numbers
type Level = 'debug' | 'info' | 'warn' | 'error'

export function log(level: Level, message: string): void {
  const time = new Date().toISOString()
  console.log(`[${time}] ${level.toUpperCase()} ${message}`)
}
```

从指定数字开始编号：

```ts:line-numbers=100
const first = 1
const second = 2
```

也可以全局打开——修改 `docs/.vitepress/config.mts`：

```ts
export default defineConfig({
  markdown: {
    lineNumbers: true   // 默认对全部代码块开启行号
  }
})
```

## 自定义标题

语言后面用 `[标题]`，会显示在代码块右上角：

````markdown
```ts[config.mts]
````

```ts[config.mts]
export default defineConfig({
  markdown: { theme: { light: 'github-light', dark: 'github-dark' } }
})
```

## diff 高亮

用 `diff` 语言标记，`+` / `-` 开头会自动着色：

```diff
export default defineConfig({
-  title: 'My Docs',
+  title: 'GitBook Style Docs',
   description: '基于 VitePress 的文档模板',
+  lastUpdated: true,
})
```

## 聚焦与错误 / 警告标记

用 `[!code focus]`、`[!code error]`、`[!code warning]` 这类行内注释来标记某一行：

```ts
export function parse(input: string) {
  const data = JSON.parse(input) // [!code error]
  const result = data.value // [!code warning]
  return result
}
```

写法就是在行尾加注释：

```markdown
const data = JSON.parse(input) // [!code error]
const result = data.value      // [!code warning]
```

## 代码组

多个等价方案放在一起，读者自行切换：

::: code-group

```ts [Node 内置]
import { readFile } from 'node:fs/promises'

const text = await readFile('README.md', 'utf8')
```

```ts [pnpm API]
import { readFile } from 'node:fs/promises'

const text = await readFile(new URL('../README.md', import.meta.url), 'utf8')
```

```ts [流式读取]
import { createReadStream } from 'node:fs'

const stream = createReadStream('README.md', 'utf8')
```

:::

## 在代码块里写代码块

外层用**四个反引号**，内层用三个：

`````markdown
````markdown
```ts
console.log('hello')
```
````
`````

## 更换高亮主题

Shiki 主题在 `docs/.vitepress/config.mts` 里配置，浅色 / 深色各一个：

```ts
export default defineConfig({
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
```

常用的成对主题：

| 浅色 | 深色 | 风格 |
| --- | --- | --- |
| `github-light` | `github-dark` | GitHub 风格（模板默认） |
| `one-light` | `one-dark-pro` | VS Code 风格 |
| `vitepress-light` | `vitepress-dark` | VitePress 官方配色 |
| `catppuccin-latte` | `catppuccin-mocha` | 柔和低对比 |

完整的主题列表见 [Shiki 主题库](https://shiki.style/themes)。

::: tip 想要更细的控制
`markdown.theme` 也可以传一个对象，用 `{ light, dark }` 之外的键做更细的配置，例如给特定语言指定不同主题。具体可参考 VitePress 的 Markdown 扩展文档。
:::

## 下一步

- [2.3 Mermaid 图表](/features/mermaid)
- [2.4 数学公式](/features/math)
