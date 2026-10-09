---
title: Mermaid 图表
description: 用文本描述流程图、时序图、状态图、类图、甘特图，模板已内置懒加载渲染。
---

# 2.3 Mermaid 图表

[Mermaid](https://mermaid.js.org/) 让你用**文本**画图。好处很直接：图表能进 Git、能 review、能 diff，改一个节点不用重新导出图片。

## 基础用法

用 ` ```mermaid ` 代码块即可，模板会自动把它变成一个图表：

````markdown
```mermaid
flowchart LR
  A[开始] --> B{判断}
  B -->|是| C[执行]
  B -->|否| D[结束]
```
````

```mermaid
flowchart LR
  A[开始] --> B{判断}
  B -->|是| C[执行]
  B -->|否| D[结束]
```

## 加标题

在 `mermaid` 后面写文字，会作为图表上方的说明：

````markdown
```mermaid 用户登录流程
flowchart TD
  A[输入账号密码] --> B{校验}
  B -->|成功| C[签发 Token]
  B -->|失败| D[提示错误]
```
````

```mermaid 用户登录流程
flowchart TD
  A[输入账号密码] --> B{校验}
  B -->|成功| C[签发 Token]
  B -->|失败| D[提示错误]
```

## 流程图

支持四种方向：`TD`（上到下）、`BT`、`LR`（左到右）、`RL`。

```mermaid
flowchart TD
  Start([开始]) --> Input[/读取配置/]
  Input --> Check{配置存在?}
  Check -->|否| Default[使用默认值]
  Check -->|是| Parse[解析配置]
  Default --> Parse
  Parse --> Build[[执行构建]]
  Build --> Result([结束])
```

节点形状速查：

| 写法 | 形状 |
| --- | --- |
| `A[文本]` | 矩形 |
| `A(文本)` | 圆角矩形 |
| `A([文本])` | 胶囊形 |
| `A[[文本]]` | 子程序框 |
| `A{文本}` | 菱形（判断） |
| `A[/文本/]` | 平行四边形 |
| `A((文本))` | 圆形 |

## 时序图

```mermaid
sequenceDiagram
  autonumber
  participant U as 用户
  participant W as 浏览器
  participant S as 服务端
  participant D as 数据库

  U->>W: 提交表单
  W->>S: POST /api/login
  activate S
  S->>D: 查询用户
  D-->>S: 用户记录
  S-->>W: 200 OK + Token
  deactivate S
  W-->>U: 跳转到首页
```

## 状态图

```mermaid
stateDiagram-v2
  [*] --> 草稿
  草稿 --> 待审核: 提交
  待审核 --> 已发布: 审核通过
  待审核 --> 草稿: 打回修改
  已发布 --> 已归档: 下线
  已归档 --> [*]
```

## 类图

```mermaid
classDiagram
  class Document {
    +String title
    +String path
    +render() String
  }
  class Chapter {
    +String name
    +Document[] pages
  }
  class Sidebar {
    +numberSidebar(tree) Item[]
  }

  Chapter "1" o-- "*" Document : contains
  Sidebar ..> Chapter : numbers
```

## ER 图

```mermaid
erDiagram
  USER ||--o{ DOCUMENT : writes
  DOCUMENT ||--|{ CHAPTER : contains
  CHAPTER ||--|{ PAGE : contains

  USER {
    string id PK
    string name
  }
  DOCUMENT {
    string id PK
    string title
    string status
  }
```

## 甘特图

```mermaid
gantt
  title 文档站点建设排期
  dateFormat YYYY-MM-DD
  axisFormat %m-%d

  section 准备
  需求梳理        :a1, 2025-03-01, 4d
  技术选型        :a2, after a1, 3d

  section 建设
  模板与主题      :b1, after a2, 8d
  内容撰写        :b2, after b1, 12d

  section 上线
  构建与测试      :c1, after b2, 3d
  部署            :milestone, after c1, 0d
```

## 饼图

```mermaid
pie title 文档访问来源
  "搜索引擎" : 48
  "直接访问" : 27
  "站内跳转" : 18
  "其他" : 7
```

## 渲染原理

模板对 Mermaid 的处理方式和其他插件不太一样，值得了解：

```mermaid
flowchart LR
  A["```mermaid 代码块"] --> B["markdown-it 插件<br/>plugins/mermaid.mts"]
  B --> C["&lt;Mermaid code='base64' /&gt;"]
  C --> D["构建产物<br/>只有占位符"]
  D --> E["浏览器端<br/>动态 import('mermaid')"]
  E --> F["绘制 SVG"]
```

三个关键设计：

1. **源码用 base64 编码后放进组件属性**。Mermaid 语法里大量出现 `"`、`<`、`>`、`&`，直接写进 HTML 属性会破坏模板编译；base64 只含 `A-Za-z0-9+/=`，天然安全。
2. **渲染发生在浏览器端**。构建时不需要 headless 浏览器，构建速度和稳定性都不受影响。
3. **`mermaid` 是懒加载的独立 chunk**。页面里没有图表就不会下载它，首屏不受影响。

::: warning 别在构建产物里找 SVG
`pnpm build` 生成的 HTML 里，图表位置只有 `<Mermaid code="...">` 占位，没有 `<svg>`。这是预期行为，不是构建失败。
:::

## 自定义渲染参数

图表的外观参数在 `docs/.vitepress/theme/components/Mermaid.vue` 里：

```ts
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',                      // 允许标签里写 HTML
  theme: isDark.value ? 'dark' : 'default',    // 跟随明暗模式
  fontFamily: 'inherit',                       // 使用站点字体
  flowchart: { useMaxWidth: true, htmlLabels: true }
})
```

### 换成其他内置主题

把 `theme` 换成 Mermaid 自带的主题名即可：

| 主题 | 观感 |
| --- | --- |
| `default` | 默认，配色柔和 |
| `neutral` | 黑白灰，适合打印 |
| `dark` | 深色 |
| `forest` | 绿色系 |
| `base` | 无样式底座，配合 `themeVariables` 完全自定义 |

### 用主题变量对齐站点主色

```ts
mermaid.initialize({
  theme: 'base',
  themeVariables: {
    primaryColor: '#e8efff',
    primaryBorderColor: '#2f5fe0',
    primaryTextColor: '#1f2430',
    lineColor: '#5b6b8c'
  }
})
```

::: tip 深色模式要重绘
组件里已经 `watch(isDark)` 并在切换时重新渲染，所以不需要你在 Markdown 里做任何额外处理。
:::

## 语法报错怎么办

图表渲染失败时，组件会把原始错误信息显示在页面相应位置，并标红边框。常见原因：

::: details Parse error：多半是中文或特殊字符没加引号
节点文字里包含空格、括号、冒号等符号时，用引号包起来：

```text
A[这是一个 带空格 的节点]     ✗
A["这是一个 带空格 的节点"]   ✓
```
:::

::: details 用了 Mermaid 不支持的方向关键字
`flowchart` 只支持 `TD` / `TB` / `BT` / `LR` / `RL`。写成 `flowchart XY` 会直接报错。
:::

::: details 缩进混乱
Mermaid 对缩进不敏感，但对**换行**敏感。`sequenceDiagram` 里的 `participant` 声明必须在消息之前。
:::

## 下一步

- [2.4 数学公式](/features/math)
- [2.5 组件与主题定制](/features/customize)
