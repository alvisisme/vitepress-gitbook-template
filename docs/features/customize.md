---
title: 组件与主题定制
description: 内置 Card 组件用法、如何添加自己的全局组件，以及通过 CSS 变量换肤。
---

# 2.5 组件与主题定制

## 内置的 Card 组件

模板注册了两个全局组件，用于首页和章节导览：

```html
<CardGrid>
  <Card icon="🚀" title="快速开始" href="/guide/" desc="五分钟把站点跑起来。" />
  <Card icon="📦" title="部署" href="/deploy/" desc="Docker 与静态托管的完整方案。" />
</CardGrid>
```

<CardGrid>
  <Card icon="🚀" title="快速开始" href="/guide/" desc="五分钟把站点跑起来。" />
  <Card icon="📦" title="部署" href="/deploy/" desc="Docker 与静态托管的完整方案。" />
</CardGrid>

### Card 的属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 卡片标题 |
| `icon` | `string` | 图标，通常写 emoji |
| `desc` | `string` | 一行描述 |
| `href` | `string` | 传了就渲染成 `<a>`，可点击跳转；不传则是静态区块 |

`<Card>` 也支持默认插槽，可以放更长的内容（插槽内容会按 Markdown 之外的纯文本/HTML 处理）：

```html
<Card title="注意事项">
  卡片正文可以写多行文字。
</Card>
```

::: tip 卡片宽度自适应
`<CardGrid>` 用的是 `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`，会根据容器宽度自动决定一行放几张，不需要手动控制。
:::

## 添加自己的全局组件

假设你要做一个「命令速查」组件。

**第一步**：新建 `docs/.vitepress/theme/components/CommandRef.vue`

```vue
<script setup lang="ts">
defineProps<{
  cmd: string
  desc: string
}>()
</script>

<template>
  <div class="command-ref">
    <code class="command-ref__cmd">{{ cmd }}</code>
    <span class="command-ref__desc">{{ desc }}</span>
  </div>
</template>

<style scoped>
.command-ref {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 10px 14px;
  border: 1px solid var(--gb-border);
  border-radius: 8px;
  margin: 8px 0;
}
.command-ref__cmd {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.command-ref__desc {
  font-size: 14px;
  color: var(--gb-text-muted);
}
</style>
```

**第二步**：在 `docs/.vitepress/theme/index.ts` 注册

```ts {3,10}
import CommandRef from './components/CommandRef.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CommandRef', CommandRef)
  }
}
```

**第三步**：在任意 Markdown 里直接使用

```html
<CommandRef cmd="pnpm dev" desc="启动开发服务器" />
```

::: details 为什么组件样式能用 `var(--gb-border)`
`<style scoped>` 只隔离**选择器**，不隔离 CSS 变量。变量定义在 `:root` 上，所以组件里可以直接引用，换肤时组件会自动跟随。
:::

## 覆盖默认布局

VitePress 的默认主题提供了若干插槽，可以通过自定义 `Layout` 组件来使用：

```ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout
}
```

```vue
<!-- docs/.vitepress/theme/Layout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <div class="my-banner">更新公告</div>
    </template>
    <template #aside-outline-before>
      <div>自定义大纲前缀</div>
    </template>
  </Layout>
</template>
```

常用插槽：`doc-before`、`doc-after`、`doc-top`、`doc-bottom`、`aside-top`、`aside-bottom`、`aside-outline-before`、`aside-outline-after`、`home-hero-before`、`home-hero-after`、`home-features-before`、`home-features-after`、`layout-top`、`layout-bottom`。

## 换肤：只改 CSS 变量

所有设计变量集中在 `docs/.vitepress/theme/styles/vars.css`。换一个主色只需要改四行：

```css
:root {
  --vp-c-brand-1: #2f5fe0;   /* 主色：链接、选中态、按钮 */
  --vp-c-brand-2: #2450c8;   /* 悬停加深 */
  --vp-c-brand-3: #1d43ab;   /* 更深的强调色 */
  --vp-c-brand-soft: rgba(47, 95, 224, 0.14);  /* 半透明底：选中背景、提示块 */
}
```

改完刷新即可，整站的链接、按钮、目录选中态、提示块会一起变。

### 可用的变量一览

::: details 模板自有变量（`gb-` 前缀）
| 变量 | 用途 |
| --- | --- |
| `--gb-sidebar-bg` | 左侧目录背景色 |
| `--gb-border` | 常规边框色 |
| `--gb-border-strong` | 强调边框色（悬停、键盘按键） |
| `--gb-content-max-width` | 正文最大宽度，默认 `860px` |
| `--gb-radius` / `--gb-radius-lg` | 中等 / 大圆角 |
| `--gb-text-muted` | 次要文字颜色 |
| `--gb-tint` | 浅色填充（表格斑马纹、行内代码底） |
| `--gb-shadow` | 卡片悬停阴影 |
| `--gb-callout-*` | 五种提示块的左侧色条颜色 |
:::

::: details VitePress 官方变量（部分常用）
| 变量 | 用途 |
| --- | --- |
| `--vp-c-brand-1/2/3` | 品牌色三档 |
| `--vp-c-brand-soft` | 品牌色半透明底 |
| `--vp-c-bg` / `--vp-c-bg-alt` / `--vp-c-bg-soft` | 三级背景 |
| `--vp-c-text-1/2/3` | 三级文字 |
| `--vp-c-divider` | 分割线 |
| `--vp-sidebar-width` | 侧边栏宽度，默认 `304px` |
| `--vp-layout-max-width` | 整体最大宽度 |
| `--vp-font-family-base` | 正文字体栈 |
| `--vp-font-family-mono` | 等宽字体栈 |
:::

### 换成自定义字体

```css
:root {
  --vp-font-family-base: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

::: warning 不要直接引用在线字体
`@import` Google Fonts 会让站点在离线环境和国内网络下变慢。建议把字体文件放到 `docs/public/fonts/`，用 `@font-face` 本地加载。
:::

## 样式文件的组织约定

```
styles/
├── index.css       # 入口，只做 @import，调整顺序即可调整覆盖关系
├── vars.css        # 设计变量
├── base.css        # 全局基础、布局宽度、右侧大纲
├── sidebar.css     # 左侧目录
├── content.css     # 正文排版（标题、表格、代码块、引用）
├── home.css        # 首页
└── components.css  # 自定义组件与提示块
```

新加样式时按这个边界放：**改颜色进 `vars.css`，改排版进 `content.css`，新组件样式进 `components.css`。**

::: tip 优先级不够怎么办
自定义样式通过 `theme/index.ts` 在默认主题之后加载，同优先级时后者生效。如果某条规则不生效，先检查 VitePress 是否用了更高的选择器权重，再决定是否加一层 `.vp-doc` 前缀，而**不要**直接上 `!important`。
:::

## 下一步

- [3. 部署指南](/deploy/)
- [4. 配置参考](/reference/)
