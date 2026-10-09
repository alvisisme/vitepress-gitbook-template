#!/usr/bin/env node
/**
 * 清理构建产物与缓存。
 * 用 Node 而不是 rm -rf，保证 Windows / macOS / Linux 行为一致。
 */

import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const targets = [
  'docs/.vitepress/dist',
  'docs/.vitepress/cache',
  'docs/.vitepress/.temp'
]

const root = process.cwd()

for (const target of targets) {
  const full = resolve(root, target)
  // 安全兜底：只删项目目录内的东西
  if (!full.startsWith(root)) {
    console.error(`跳过不安全的路径：${full}`)
    continue
  }
  rmSync(full, { recursive: true, force: true })
  console.log(`已清理 ${target}`)
}

console.log('完成。')
