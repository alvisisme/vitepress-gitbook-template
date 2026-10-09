import type MarkdownIt from 'markdown-it'

/**
 * Mermaid 图表插件（markdown-it 插件）
 *
 * 把
 *
 *   ```mermaid
 *   graph TD; A-->B;
 *   ```
 *
 * 编译成主题中注册的全局组件：
 *
 *   `<Mermaid code="<base64>" />`
 *
 * 为什么用 base64？
 * Mermaid 源码里经常出现 `"`、`<`、`>`、`&` 这些字符，直接写进 HTML 属性会把
 * 模板编译搞坏；base64 只包含 `A-Za-z0-9+/=`，天然安全，也免去了转义问题。
 *
 * 真正的渲染发生在浏览器端（`theme/components/Mermaid.vue`），
 * 这样构建时不需要 headless 浏览器，产物里只保留一份懒加载的 mermaid chunk。
 */

const MERMAID_INFO_RE = /^mermaid\b/

/** 转义 HTML 属性值中的危险字符 */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function mermaidPlugin(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim()

    if (!MERMAID_INFO_RE.test(info)) {
      return defaultFence
        ? defaultFence(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options)
    }

    const code = token.content.trim()
    const base64 = Buffer.from(code, 'utf8').toString('base64')

    // 允许写 ```mermaid 标题文字，作为图表上方的说明
    const title = info.slice('mermaid'.length).trim()
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''

    return `<Mermaid code="${base64}"${titleAttr} />\n`
  }
}
