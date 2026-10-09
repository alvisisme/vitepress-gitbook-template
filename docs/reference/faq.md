---
title: 常见问题
description: 构建、样式、插件、部署过程中的高频问题与解决办法。
---

# 4.3 常见问题

## 安装与依赖

::: details pnpm install 报 `Unsupported engine`
Node 版本低于 `package.json` 里的 `engines` 要求。用 `node -v` 确认，然后：

```bash
fnm use          # 读取项目根目录的 .nvmrc
# 或
nvm use 24
```
:::

::: details 想换成 npm 或 yarn 可以吗
可以。VitePress 本身不绑定包管理器。但要注意：

1. `Dockerfile` 里用的是 pnpm，需要同步改成 `npm ci`；
2. 生成并提交 `package-lock.json` 或 `yarn.lock`；
3. `package.json` 的 `packageManager` 字段删掉。
:::

::: details 安装很慢 / 卡住
换镜像源：

```bash
pnpm config set registry https://registry.npmmirror.com
```

Mermaid 和 MathJax 是两个较大的依赖，首次安装慢是正常的。
:::

## 开发与构建

::: details 构建报错 `Found dead link /xxx in file yyy.md`
VitePress 会校验 Markdown 里所有**以 `/` 开头**的内部链接。报错会给出文件和行号，把链接改对即可。

如果链接目标是外部站点，写成完整 URL（`https://...`）就不会被校验。
:::

::: details 构建报错 `Failed to resolve component: Xxx`
在 Markdown 里用了未注册的组件。两种解法：

1. 到 `docs/.vitepress/theme/index.ts` 的 `enhanceApp` 里注册；
2. 如果是 VitePress 内置组件（如 `<Badge>`），检查拼写和大小写。
:::

::: details 构建成功但页面是空白的
按顺序检查：

1. `base` 配置是否与部署路径一致（子路径部署最容易踩）；
2. 浏览器控制台是否有 404 的资源请求；
3. `docs/.vitepress/dist/index.html` 里是否有内容。

```bash
pnpm run clean && pnpm build    # 先排除缓存问题
```
:::

::: details 构建很慢
主要耗时在 MathJax 渲染公式和 Shiki 高亮代码。如果文档里没有公式：

```ts
markdown: { math: false }
```

并从 `package.json` 移除 `markdown-it-mathjax3`。

文档量特别大时还需要提高 Node 内存：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```
:::

::: details 改了 Markdown 但页面没更新
按可能性排序：

1. 浏览器缓存 —— 硬刷新（<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>）；
2. 改的是 `sidebar.ts` 或 `config.mts` —— 这两个文件在配置阶段执行，需要重启 `pnpm dev`；
3. VitePress 缓存损坏 —— `pnpm run clean` 后重来。
:::

## 目录与编号

::: details 新增了 Markdown 文件，但目录里没有
模板用的是**显式目录树**，不会扫描文件系统。需要在 `docs/.vitepress/sidebar.ts` 的 `docTree` 里手动加一项。这是刻意的设计：目录顺序可控、可 review。
:::

::: details 编号能不能从 0 开始，或者用「第一章」
`numberSidebar()` 里的模板字符串控制格式。想改成中文数字：

```ts
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const num = prefix ? `${prefix}.${index + 1}` : CN[index + 1] ?? String(index + 1)
// 结果：一. 快速开始 / 一.1 模板简介
```

想完全去掉编号，直接 `text: node.text` 即可。
:::

::: details 侧边栏编号和正文标题的编号重复了
正文标题不要再写序号。侧边栏已经负责编号，正文只写 `# 模板简介`。详见 [4.2 目录与自动编号](/reference/sidebar)。
:::

::: details 想让某几个章节不参与编号
两种做法：

1. 把不需要编号的节点放到单独的 sidebar 分组里，不走 `numberSidebar()`；
2. 在 `DocNode` 上加一个 `noNumber?: boolean` 字段，在函数里判断跳过。需要自己扩展 `numberSidebar()`。
:::

## Mermaid 图表

::: details 图表区域一片空白
按顺序排查：

1. **是不是还没渲染完** —— 图表是浏览器端绘制的，慢网络下会先显示「正在渲染图表…」；
2. **打开浏览器控制台** —— 看 `mermaid` chunk 是否 404，或者有没有 JS 报错；
3. **语法是否正确** —— 语法错误时模板会把错误信息显示在图表位置并标红边框。
:::

::: details 构建产物 HTML 里没有 `<svg>`
这是**预期行为**。图表在浏览器端渲染，产物里只有 `<figure class="gb-mermaid">` 占位。详见 [2.3 Mermaid 图表](/features/mermaid)。
:::

::: details 图表是英文的 / 配色和站点不搭
图表内部文字来自你的 Mermaid 源码，模板不做翻译。配色在 `Mermaid.vue` 的 `initialize()` 里改：

```ts
mermaid.initialize({
  theme: isDark.value ? 'dark' : 'default',
  themeVariables: { primaryColor: '#e8efff' }
})
```
:::

::: details 节点里的中文或括号报错
Mermaid 对特殊字符敏感，用引号包起来：

```text
A[带 空格 的节点]      ✗
A["带 空格 的节点"]    ✓
```

还有一个特别容易踩的坑：**节点文字里不能出现三个反引号**。想在文档里展示 ` ```mermaid ` 这种字面量时，很容易顺手写进节点标签，Mermaid 词法器会直接报 `Lexical error on line N`，页面上那个位置会显示红色错误信息。

```text
A["mermaid 代码块"]      ✓  不带反引号
A["```mermaid 代码块"]   ✗  词法器报 Lexical error
A["`**加粗** 说明`"]     ✓  用 Mermaid 自己的 markdown 字符串语法
```

冒烟测试（`pnpm test`）会解码产物里所有 Mermaid 源码，拦住「源码含三个反引号」这类问题。
:::

::: details 深色模式下图表没变
组件已经 `watch(isDark)` 并在切换时重绘。如果没生效，检查是不是自己改过 `Mermaid.vue`。硬刷新一次再看看。
:::

## 数学公式

::: details 正文里的 `$` 被当成公式了
数学公式开启后 `$` 是定界符，字面美元符号要转义：

```markdown
价格是 \$19.99
```
:::

::: details 公式没有渲染，原样显示了
检查：

1. `config.mts` 里 `markdown.math` 是否为 `true`；
2. `markdown-it-mathjax3` 是否安装成功；
3. 行内公式必须写在同一行，块级公式的 `$$` 必须**单独成行**。
:::

::: details 公式太宽，溢出了
MathJax 输出的 SVG 默认不换行。给容器加横向滚动：

```css
.vp-doc mjx-container[display='true'] {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}
```
:::

## 样式与主题

::: details 我的自定义样式不生效
按顺序检查：

1. 样式文件是否被 `styles/index.css` `@import` 了；
2. 选择器优先级是否低于 VitePress 默认主题 —— 加一层 `.vp-doc` 前缀通常能解决；
3. 是不是需要 scoped 的组件样式写在了全局文件里。
:::

::: details 换主色之后有些地方没跟着变
`--vp-c-brand-1/2/3` 和 `--vp-c-brand-soft` **四个都要改**，缺一个会出现「按钮变了但选中背景没变」这类情况。
:::

::: details 想加在线字体
不推荐 `@import` 外部字体（国内网络慢、离线不可用）。建议把字体文件放 `docs/public/fonts/`，用 `@font-face` 本地加载：

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
}

:root {
  --vp-font-family-base: 'Inter', 'PingFang SC', sans-serif;
}
```
:::

::: details 侧边栏太窄 / 正文太宽
```css
:root {
  --vp-sidebar-width: 320px;       /* 侧边栏宽度 */
  --gb-content-max-width: 900px;   /* 正文最大宽度 */
}
```
:::

## 部署

::: details 部署后页面白屏，控制台一堆 404
99% 是 `base` 没设对。部署在 `https://example.com/my-docs/` 就必须配 `base: '/my-docs/'`。
:::

::: details 刷新内页 404
服务器没有配置路由回退。Nginx 加：

```nginx
location / {
    try_files $uri $uri/ $uri.html =404;
}
```

对象存储需要在控制台把「错误文档」设为 `404.html`。
:::

::: details Docker 构建报 `ERR_PNPM_OUTDATED_LOCKFILE`
`pnpm-lock.yaml` 与 `package.json` 不一致。本地执行 `pnpm install` 更新锁文件并提交。

另外要确认 `Dockerfile` 里的 `PNPM_VERSION` 与本地生成锁文件时用的大版本一致。
:::

::: details 容器健康检查一直 unhealthy
进入容器手动验证：

```bash
docker exec -it <容器名> sh
wget -qO- http://127.0.0.1/ | head
nginx -t
ls /usr/share/nginx/html
```
:::

::: details lastUpdated 不显示
需要仓库里有 `.git` 且环境装了 git。CI 里加 `fetch-depth: 0` 拉完整历史。

Docker 构建因为 `.dockerignore` 排除了 `.git`，模板会自动关掉这一项；想强制控制可以用 `VITEPRESS_LAST_UPDATED=1` / `=0`。
:::

## 二次开发

::: details 想加一个新的 markdown-it 插件
```ts
// docs/.vitepress/plugins/my-plugin.ts
import type MarkdownIt from 'markdown-it'

export function myPlugin(md: MarkdownIt) {
  // ...
}
```

```ts
// config.mts
markdown: {
  config: (md) => {
    md.use(mermaidPlugin)
    md.use(myPlugin)
  }
}
```
:::

::: details 想加一个新的 Vue 组件
1. 在 `theme/components/` 下新建 `.vue` 文件；
2. 在 `theme/index.ts` 的 `enhanceApp` 里 `app.component('MyComp', MyComp)`；
3. 在 Markdown 里直接写 `<MyComp />`。

详见 [2.5 组件与主题定制](/features/customize)。
:::

::: details 想升级 VitePress
```bash
pnpm up vitepress
pnpm build && pnpm test
```

主题用的是 `extends: DefaultTheme` 的继承方式，没有 fork，所以小版本升级通常无感。大版本升级（比如 2.x）需要关注 `markdown.theme` 等配置项的写法变化。
:::

## 还有问题？

按这个顺序排查通常能解决大部分情况：

1. `pnpm run clean && pnpm install && pnpm build` —— 排除环境问题；
2. 打开浏览器控制台看报错；
3. 执行 `pnpm test` 看是哪个环节的产物不对；
4. 对照官方文档：<https://vitepress.dev/>
