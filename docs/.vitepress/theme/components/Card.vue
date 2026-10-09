<script setup lang="ts">
import { computed } from 'vue'

/**
 * 文档内的卡片，可单独使用，也可以配合 <CardGrid> 排列。
 *
 * 用法：
 *   <CardGrid>
 *     <Card icon="🚀" title="快速开始" href="/guide/">三步跑起来</Card>
 *   </CardGrid>
 */
const props = defineProps<{
  /** 标题 */
  title?: string
  /** 图标（emoji 或任意字符） */
  icon?: string
  /** 简短的描述文字 */
  desc?: string
  /** 传了 href 就渲染成 <a>，否则是普通区块 */
  href?: string
}>()

const tag = computed(() => (props.href ? 'a' : 'div'))
</script>

<template>
  <component :is="tag" class="gb-card" :href="href">
    <span v-if="icon" class="gb-card__icon" aria-hidden="true">{{ icon }}</span>
    <span v-if="title" class="gb-card__title">{{ title }}</span>
    <span v-if="desc" class="gb-card__desc">{{ desc }}</span>
    <span class="gb-card__body"><slot /></span>
  </component>
</template>
