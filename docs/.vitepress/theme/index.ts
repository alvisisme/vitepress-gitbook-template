import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Mermaid from './components/Mermaid.vue'
import Card from './components/Card.vue'
import CardGrid from './components/CardGrid.vue'

import './styles/index.css'

/**
 * 自定义主题入口。
 *
 * 采用「继承默认主题 + 覆盖」的方式：
 * 只做增量定制，VitePress 升级时基本不需要改代码。
 *
 * 想加自己的全局组件，就在 `enhanceApp` 里 `app.component(...)`，
 * 然后就能在任意 markdown 里直接写 `<MyComponent />`。
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Mermaid', Mermaid)
    app.component('Card', Card)
    app.component('CardGrid', CardGrid)
  }
} satisfies Theme
