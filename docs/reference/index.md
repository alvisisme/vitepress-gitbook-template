---
title: 配置参考
description: 站点配置项、目录编号机制与常见问题的完整参考。
---

# 4. 配置参考

这一章是查阅用的，不需要按顺序读。

## 4.1 本章内容

<CardGrid>
  <Card icon="⚙️" title="站点与主题配置" href="/reference/site" desc="config.mts 里每一项配置的作用与可选值。" />
  <Card icon="🔢" title="目录与自动编号" href="/reference/sidebar" desc="编号规则、嵌套层级、折叠控制与常见改法。" />
  <Card icon="❓" title="常见问题" href="/reference/faq" desc="构建、样式、部署过程中的高频问题汇总。" />
</CardGrid>

## 4.2 配置文件速查

| 文件 | 作用 | 什么时候改它 |
| --- | --- | --- |
| `docs/.vitepress/config.mts` | 站点总配置 | 改标题、导航、搜索、Markdown 行为 |
| `docs/.vitepress/sidebar.mts` | 目录树与编号 | 增删文档、调整章节顺序 |
| `docs/.vitepress/theme/index.ts` | 主题入口 | 注册全局组件、覆盖 Layout |
| `docs/.vitepress/theme/styles/vars.css` | 设计变量 | 换配色、换字体、改圆角 |
| `docs/.vitepress/plugins/mermaid.mts` | Mermaid 编译规则 | 改图表代码块的写法 |
| `docs/.vitepress/theme/components/Mermaid.vue` | 图表渲染 | 改图表的主题与布局参数 |
| `docker/nginx.conf` | 线上 Nginx 行为 | 改缓存策略、端口、安全头 |
| `Dockerfile` | 镜像构建 | 换 Node/Nginx 版本、调整构建步骤 |
| `tests/smoke.mjs` | 产物校验 | 加了重要页面后补充断言 |

## 4.3 默认值一览

| 配置 | 模板默认值 | VitePress 默认值 |
| --- | --- | --- |
| `lang` | `zh-CN` | `en-US` |
| `cleanUrls` | `false` | `false` |
| `lastUpdated` | `true` | `false` |
| `markdown.lineNumbers` | `false` | `false` |
| `markdown.math` | `true` | `false` |
| `markdown.theme` | `github-light` / `github-dark` | 同 |
| `themeConfig.search.provider` | `local` | 无 |
| `themeConfig.outline.level` | `[2, 3]` | `[2, 3]` |
| `--vp-sidebar-width` | `304px` | `272px` |
| `--gb-content-max-width` | `860px` | `688px` |

## 下一步

- [4.1 站点与主题配置](/reference/site)
- [4.2 目录与自动编号](/reference/sidebar)
- [4.3 常见问题](/reference/faq)
