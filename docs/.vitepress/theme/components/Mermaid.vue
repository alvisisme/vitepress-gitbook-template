<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

/**
 * Mermaid 图表组件。
 *
 * - markdown 侧的 `plugins/mermaid.mts` 会把 ```mermaid 代码块编译成
 *   `<Mermaid code="<base64>" />`。
 * - 这里在**浏览器端**动态 `import('mermaid')`，构建时完全不执行 mermaid，
 *   所以 SSR 不会碰到 DOM，也不会拖慢首屏（独立 chunk，按需加载）。
 */

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void
  render: (id: string, text: string) => Promise<{ svg: string }>
}

const props = defineProps<{
  /** base64 编码的 mermaid 源码 */
  code: string
  /** 可选的图表标题 */
  title?: string
}>()

const { isDark } = useData()

const svg = ref('')
const error = ref('')

let api: MermaidApi | null = null
let seq = 0

/** base64 -> UTF-8 字符串（正确处理中文） */
function decode(input: string): string {
  const binary = atob(input)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function getApi(): Promise<MermaidApi> {
  if (!api) {
    const mod = (await import('mermaid')) as unknown as { default: MermaidApi }
    api = mod.default
  }
  return api
}

async function draw(): Promise<void> {
  error.value = ''
  try {
    const mermaid = await getApi()
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark.value ? 'dark' : 'default',
      fontFamily: 'inherit',
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
      class: { useMaxWidth: true },
      state: { useMaxWidth: true },
      er: { useMaxWidth: true }
    })

    seq += 1
    const id = `gb-mermaid-${seq}-${Math.random().toString(36).slice(2, 8)}`
    const { svg: rendered } = await mermaid.render(id, decode(props.code))
    svg.value = rendered
  } catch (err) {
    svg.value = ''
    error.value = err instanceof Error ? err.message : String(err)
  }
}

onMounted(draw)
// 跟随浅色 / 深色模式重绘
watch(isDark, () => void draw())
</script>

<template>
  <figure class="gb-mermaid" :class="{ 'is-error': !!error }">
    <figcaption v-if="title" class="gb-mermaid__caption">{{ title }}</figcaption>
    <div v-if="svg" class="gb-mermaid__canvas" v-html="svg" />
    <pre v-else-if="error" class="gb-mermaid__error">{{ error }}</pre>
    <div v-else class="gb-mermaid__loading" aria-busy="true">正在渲染图表…</div>
  </figure>
</template>
