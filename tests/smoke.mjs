#!/usr/bin/env node
/**
 * 构建产物冒烟测试
 * =============================================================================
 *  `pnpm build` 只证明「没报错」，不能证明「页面是对的」。
 *  这个脚本直接检查 docs/.vitepress/dist 里的 HTML，覆盖：
 *
 *    1. 关键页面是否都生成了
 *    2. 首页 / 目录编号 / 代码高亮 / Mermaid / 公式 是否真的渲染出来
 *    3. 站内链接与静态资源引用是否都能在产物里找到（防死链）
 *    4. 是否有模板没编译干净的残留（{{ }}、未注册组件等）
 *
 *  不依赖任何第三方包，Node 内置模块足够，所以能直接在 Docker 里跑。
 *
 *  用法：
 *    node tests/smoke.mjs [dist 目录]
 *    DIST_DIR=xxx node tests/smoke.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative, dirname } from 'node:path'
import process from 'node:process'

// ----------------------------------------------------------------- 终端颜色
const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const c = (code, text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text)
const green = (t) => c(32, t)
const red = (t) => c(31, t)
const gray = (t) => c(90, t)
const bold = (t) => c(1, t)

// ----------------------------------------------------------------- 测试框架
let passed = 0
const failures = []

function check(name, fn) {
  try {
    const detail = fn()
    passed += 1
    console.log(`  ${green('✓')} ${name}${detail ? ' ' + gray(`(${detail})`) : ''}`)
  } catch (error) {
    failures.push({ name, message: error.message })
    console.log(`  ${red('✗')} ${name}`)
    console.log(`      ${red(error.message)}`)
  }
}

function group(title) {
  console.log(`\n${bold(title)}`)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// ----------------------------------------------------------------- 产物定位
const DIST = resolve(process.argv[2] ?? process.env.DIST_DIR ?? 'docs/.vitepress/dist')

function fileOf(relPath) {
  return join(DIST, relPath)
}

function read(relPath) {
  const file = fileOf(relPath)
  assert(existsSync(file), `缺少文件：${relPath}`)
  return readFileSync(file, 'utf8')
}

/** 把站点路由（/guide/introduction）映射到产物文件，找不到返回 null */
function resolveRoute(route) {
  const clean = route.split('#')[0].split('?')[0]
  if (!clean.startsWith('/')) return null

  const rel = clean.replace(/^\/+/, '')
  const candidates = []

  if (rel === '') {
    candidates.push('index.html')
  } else if (rel.endsWith('/')) {
    candidates.push(join(rel, 'index.html'))
  } else if (/\.[a-z0-9]+$/i.test(rel)) {
    candidates.push(rel) // 带扩展名：css / js / svg / png ...
  } else {
    candidates.push(`${rel}.html`, join(rel, 'index.html'))
  }

  for (const candidate of candidates) {
    const file = fileOf(candidate)
    if (existsSync(file) && statSync(file).isFile()) return candidate
  }
  return null
}

// ----------------------------------------------------------------- 预期页面
const EXPECTED_PAGES = [
  // 首页
  'index.html',
  '404.html',
  // 1. 快速开始
  'guide/index.html',
  'guide/introduction.html',
  'guide/installation.html',
  'guide/structure.html',
  'guide/writing.html',
  // 2. 功能特性
  'features/index.html',
  'features/markdown.html',
  'features/code.html',
  'features/mermaid.html',
  'features/math.html',
  'features/customize.html',
  // 3. 部署指南
  'deploy/index.html',
  'deploy/build.html',
  'deploy/docker.html',
  'deploy/hosting.html',
  // 4. 配置参考
  'reference/index.html',
  'reference/site.html',
  'reference/sidebar.html',
  'reference/faq.html'
]

// ----------------------------------------------------------------- 开始
console.log(bold('\n构建产物冒烟测试'))
console.log(gray(`  产物目录：${DIST}\n`))

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(red(`\n产物目录不存在：${DIST}`))
  console.error(gray('请先执行 pnpm build\n'))
  process.exit(1)
}

// ================================================================ 1. 页面完整性
group('1. 页面完整性')

check('首页与 404 页面存在', () => {
  assert(existsSync(fileOf('index.html')), '缺少 index.html')
  assert(existsSync(fileOf('404.html')), '缺少 404.html')
  return 'index.html, 404.html'
})

check(`全部 ${EXPECTED_PAGES.length} 个预期页面都已生成`, () => {
  const missing = EXPECTED_PAGES.filter((page) => !existsSync(fileOf(page)))
  assert(missing.length === 0, `缺少 ${missing.length} 个页面：\n        ${missing.join('\n        ')}`)
  return `${EXPECTED_PAGES.length} 个`
})

check('sitemap.xml 已生成且包含站点地址', () => {
  const sitemap = read('sitemap.xml')
  assert(sitemap.includes('<urlset'), 'sitemap.xml 格式不正确')
  const urls = sitemap.match(/<loc>/g) ?? []
  assert(urls.length > 0, 'sitemap.xml 里没有任何 <loc>')
  return `${urls.length} 条 URL`
})

// ================================================================ 2. 目录编号
group('2. 目录自动编号')

/** 断言侧边栏里真实渲染出了某个带编号的目录项（而不是正文里恰好提到） */
function assertSidebarLabel(html, label) {
  const re = new RegExp(`class="text"[^>]*>${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`)
  assert(re.test(html), `侧边栏缺少目录项「${label}」`)
}

check('侧边栏出现一级编号（1. / 2. / 3. / 4.）', () => {
  const html = read('guide/index.html')
  for (const label of ['1. 快速开始', '2. 功能特性', '3. 部署指南', '4. 配置参考']) {
    assertSidebarLabel(html, label)
  }
  return '1. ~ 4.'
})

check('侧边栏出现二级编号（1.1 ~ 1.4）', () => {
  const html = read('guide/introduction.html')
  const expected = ['1.1 模板简介', '1.2 环境要求与安装', '1.3 目录结构说明', '1.4 编写与组织内容']
  for (const label of expected) {
    assertSidebarLabel(html, label)
  }
  return '1.1 ~ 1.4'
})

check('二级编号跟随父级递增，没有出现 "1.1." 双重标点', () => {
  const html = read('features/index.html')
  for (const label of ['2.1 Markdown 扩展语法', '2.2 代码高亮', '2.3 Mermaid 图表', '2.4 数学公式', '2.5 组件与主题定制']) {
    assertSidebarLabel(html, label)
  }
  assert(!/class="text"[^>]*>\d+\.\d+\.\s/.test(html), '出现了 "1.1. " 这样的双重标点')
  return '2.1 ~ 2.5'
})

// ================================================================ 3. 渲染能力
group('3. 渲染能力')

check('首页渲染出 Hero 标题与副标题', () => {
  const html = read('index.html')
  assert(html.includes('GitBook Style Docs'), '首页缺少站点名称')
  assert(html.includes('VitePress 文档站点模板'), '首页缺少 hero text')
  assert(html.includes('VPHero'), '首页没有使用 hero 布局')
  assert(html.includes('目录自动编号'), '首页缺少特性卡片')
  return 'hero + features'
})

check('首页自定义卡片组件已渲染', () => {
  const html = read('index.html')
  assert(html.includes('gb-card-grid'), '首页没有渲染 CardGrid')
  assert(html.includes('gb-card'), '首页没有渲染 Card')
  return 'CardGrid + Card'
})

check('代码高亮生效（Shiki 生成的 span/样式）', () => {
  const html = read('features/code.html')
  assert(/class="shiki/.test(html) || /style="color:/.test(html), '代码块没有高亮后的样式')
  assert(html.includes('language-ts'), '缺少 ts 代码块')
  return 'shiki'
})

check('代码行高亮标记已渲染', () => {
  const html = read('features/code.html')
  assert(html.includes('highlighted'), '没有找到行高亮 class')
  return 'highlighted'
})

check('Mermaid 代码块已编译为图表组件占位', () => {
  const html = read('features/mermaid.html')
  assert(html.includes('gb-mermaid'), '没有找到 Mermaid 组件渲染结果')
  assert(!/<pre[^>]*><code[^>]*class="language-mermaid"/.test(html), 'mermaid 代码块被当成普通代码块渲染了')
  return 'gb-mermaid'
})

check('流程图 / 时序图 / 状态图页面均含图表', () => {
  const html = read('features/mermaid.html')
  const count = (html.match(/gb-mermaid/g) ?? []).length
  assert(count >= 8, `图表数量偏少，只找到 ${count} 处 gb-mermaid`)
  return `${count} 处`
})

check('数学公式已渲染（MathJax 输出）', () => {
  const html = read('features/math.html')
  const hasMath = /mjx-container|MathJax|class="MathJax/.test(html)
  assert(hasMath, '没有找到 MathJax 的渲染结果')
  return 'MathJax'
})

check('提示块（custom-block）已渲染', () => {
  const html = read('features/markdown.html')
  assert(html.includes('custom-block'), '没有找到提示块')
  for (const type of ['tip', 'warning', 'danger']) {
    assert(html.includes(`custom-block ${type}`) || html.includes(`${type} custom-block`), `缺少 ${type} 提示块`)
  }
  return 'tip / warning / danger'
})

check('本地搜索索引已生成', () => {
  const chunks = join(DIST, 'assets', 'chunks')
  assert(existsSync(chunks), '缺少 assets/chunks 目录')
  const index = readdirSync(chunks).filter((f) => /localSearchIndex/i.test(f))
  assert(index.length > 0, '没有生成本地搜索索引文件')
  return index[0]
})

check('中文分词配置生效（搜索索引含中文内容）', () => {
  const chunks = join(DIST, 'assets', 'chunks')
  const index = readdirSync(chunks).find((f) => /localSearchIndex/i.test(f))
  assert(index, '没有找到搜索索引文件')
  const content = readFileSync(join(chunks, index), 'utf8')
  // 索引被 JSON.stringify 了两次，中文可能以原字符或 \uXXXX 形式出现
  const hasCjk = /[\u4e00-\u9fff]/.test(content) || /\\u[4-9][0-9a-f]{3}/i.test(content)
  assert(hasCjk, '搜索索引里没有中文内容')
  // documentCount 为 0 说明页面根本没被索引（常见原因：关掉了 anchor.permalink）
  const count = /"documentCount":(\d+)/.exec(content)
  assert(count, '搜索索引格式不符合预期（缺少 documentCount）')
  assert(Number(count[1]) > 0, '搜索索引条目数为 0，页面没有被索引')
  return `${count[1]} 个文档片段`
})

// ================================================================ 4. 残留检查
group('4. 编译残留检查')

/** 遍历产物里所有 HTML 文件 */
function walkHtml(dir = DIST, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue
      walkHtml(full, acc)
    } else if (entry.name.endsWith('.html')) {
      acc.push(full)
    }
  }
  return acc
}

const htmlFiles = walkHtml()

check('没有未编译的 Vue 插值残留（{{ }}）', () => {
  const bad = []
  for (const file of htmlFiles) {
    // 先把代码块整体去掉：代码块里出现 {{ }} 是正常内容
    // （例如文档里演示 GitHub Actions 的 ${{ ... }} 表达式、Vue 模板示例）
    const content = readFileSync(file, 'utf8').replace(/<pre[\s\S]*?<\/pre>/g, '')
    if (/\{\{[^}]{1,80}\}\}/.test(content)) bad.push(relative(DIST, file))
  }
  assert(bad.length === 0, `以下文件含 {{ }} 残留：${bad.join(', ')}`)
  return `${htmlFiles.length} 个文件`
})

check('没有未解析的自定义组件标签', () => {
  const bad = []
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf8')
    // SSR 之后 <Mermaid ...> / <CardGrid> 都应该变成真实 DOM
    if (/<(Mermaid|CardGrid|Card)[\s/>]/.test(content)) bad.push(relative(DIST, file))
  }
  assert(bad.length === 0, `以下文件含未解析组件：${bad.join(', ')}`)
  return 'ok'
})

// ================================================================ 5. 链接完整性
group('5. 站内链接完整性')

check('所有站内链接都能在产物中找到对应文件', () => {
  const broken = new Map()
  const linkRe = /(?:href|src)="([^"]+)"/g

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    let match
    while ((match = linkRe.exec(html)) !== null) {
      const url = match[1]
      // 跳过外链、锚点、数据 URI、mailto 等
      if (!url.startsWith('/')) continue
      if (url.startsWith('//')) continue
      if (resolveRoute(url)) continue
      const from = relative(DIST, file)
      if (!broken.has(url)) broken.set(url, from)
    }
  }

  assert(
    broken.size === 0,
    `发现 ${broken.size} 个死链：\n        ` +
      [...broken.entries()].slice(0, 10).map(([url, from]) => `${url}  ←  ${from}`).join('\n        ')
  )
  return '0 个死链'
})

check('CSS / JS 资源引用都真实存在', () => {
  const assets = readdirSync(join(DIST, 'assets'))
  assert(assets.length > 0, 'assets 目录是空的')
  assert(assets.some((f) => f.endsWith('.css')), '没有生成 CSS 文件')
  assert(assets.some((f) => f.endsWith('.js')), '没有生成 JS 文件')
  return `assets/ 下 ${assets.length} 项`
})

check('Mermaid 被拆成独立的懒加载 chunk', () => {
  const chunksDir = join(DIST, 'assets', 'chunks')
  const mermaidChunk = readdirSync(chunksDir).find((f) => /mermaid/i.test(f))
  assert(mermaidChunk, 'Mermaid 没有被拆成独立 chunk（可能被打进了主包）')
  const size = statSync(join(chunksDir, mermaidChunk)).size
  return `${mermaidChunk} ${(size / 1024).toFixed(0)} KB`
})

// ================================================================ 6. 静态资源
group('6. 静态资源')

check('logo 与 favicon 已拷贝到产物根目录', () => {
  assert(existsSync(fileOf('logo.svg')), '缺少 logo.svg')
  assert(existsSync(fileOf('favicon.svg')), '缺少 favicon.svg')
  return 'logo.svg, favicon.svg'
})

check('HTML 里正确引用了 favicon', () => {
  const html = read('index.html')
  assert(html.includes('favicon.svg'), 'HTML 里没有引用 favicon')
  return 'ok'
})

// ================================================================ 汇总
console.log(`\n${bold('结果')}`)
console.log(`  通过 ${green(String(passed))} 项，失败 ${failures.length ? red(String(failures.length)) : '0'} 项`)

if (failures.length > 0) {
  console.log(`\n${red('失败的检查项：')}`)
  for (const f of failures) console.log(`  ${red('·')} ${f.name}\n    ${gray(f.message)}`)
  console.log('')
  process.exit(1)
}

console.log(`\n${green('✓ 冒烟测试全部通过')}\n`)
