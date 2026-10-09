---
title: 数学公式
description: 使用 MathJax 在构建期渲染行内与块级数学公式。
---

# 2.4 数学公式

模板通过 `markdown-it-mathjax3` 接入 [MathJax 3](https://www.mathjax.org/)，在**构建期**把公式渲染成内联 SVG。

这意味着：

- 产物里就是最终图形，**不依赖客户端 JS，也不依赖 KaTeX 字体文件**；
- 打印、导出 PDF、离线浏览都没问题；
- 代价是构建稍慢一点（长公式多的站点会有感知）。

## 行内公式

用单个 `$` 包裹：

```markdown
质能方程 $E = mc^2$ 是最著名的公式之一。
```

质能方程 $E = mc^2$ 是最著名的公式之一。

再比如：当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 的两个根为 $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$。

## 块级公式

用两个 `$$` 包裹，并**单独成行**：

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## 常用语法速查

### 上下标与分数

```markdown
$x_i^2$、$x^{n+1}$、$\frac{a}{b}$、$\dfrac{a}{b}$
```

$x_i^2$、$x^{n+1}$、$\frac{a}{b}$、$\dfrac{a}{b}$

### 求和、求积与极限

```markdown
$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
$\prod_{i=1}^{n} x_i$
$\lim_{x \to 0} \frac{\sin x}{x} = 1$
```

$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$，$\prod_{i=1}^{n} x_i$，$\lim_{x \to 0} \frac{\sin x}{x} = 1$

### 积分

```markdown
$\int_0^1 x^2 \, dx = \frac{1}{3}$
$\oint_C \vec{B} \cdot d\vec{l} = \mu_0 I$
```

$\int_0^1 x^2 \, dx = \frac{1}{3}$，$\oint_C \vec{B} \cdot d\vec{l} = \mu_0 I$

### 矩阵

```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$
```

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

### 分段函数

```markdown
$$
f(x) =
\begin{cases}
x^2, & x \ge 0 \\
-x,  & x < 0
\end{cases}
$$
```

$$
f(x) =
\begin{cases}
x^2, & x \ge 0 \\
-x,  & x < 0
\end{cases}
$$

### 希腊字母与运算符

| 语法 | 结果 | 语法 | 结果 |
| --- | --- | --- | --- |
| `\alpha` | $\alpha$ | `\beta` | $\beta$ |
| `\theta` | $\theta$ | `\lambda` | $\lambda$ |
| `\infty` | $\infty$ | `\partial` | $\partial$ |
| `\nabla` | $\nabla$ | `\approx` | $\approx$ |
| `\le` | $\le$ | `\ge` | $\ge$ |
| `\in` | $\in$ | `\forall` | $\forall$ |
| `\Rightarrow` | $\Rightarrow$ | `\Leftrightarrow` | $\Leftrightarrow$ |

## 在文档里的实际用法

公式经常和代码一起出现。比如说明复杂度：

| 算法 | 时间复杂度 | 说明 |
| --- | --- | --- |
| 线性查找 | $O(n)$ | 逐个比较 |
| 二分查找 | $O(\log n)$ | 要求有序 |
| 归并排序 | $O(n \log n)$ | 稳定排序 |
| 冒泡排序 | $O(n^2)$ | 只适合教学 |

又比如说明一个评分的归一化方式：

$$
\text{score} = \frac{1}{1 + e^{-(w \cdot x + b)}}
$$

## 转义与边界情况

::: warning `$` 是敏感字符
数学公式开启后，`$` 会被当作公式定界符。如果正文里确实需要一个美元符号，用反斜杠转义：

```markdown
价格是 \$19.99
```
:::

::: details 公式里想显示代码或下划线
公式环境里 `_` 表示下标。要显示字面下划线，用 `\_`：

```markdown
$file\_name$
```
:::

## 性能建议

公式很多的长文档（比如算法教材）建议：

1. 把大章节拆成多篇，避免单页公式过多导致构建变慢；
2. 简单的行内符号（如 `O(n)`）直接用行内代码而不是公式，更省构建时间；
3. 如果完全不使用数学公式，可以在 `config.mts` 里把 `markdown.math` 设为 `false`，并从 `package.json` 移除 `markdown-it-mathjax3`，能显著缩短安装和构建时间。

```ts
export default defineConfig({
  markdown: {
    math: false   // 关闭数学公式支持
  }
})
```

## 下一步

- [2.5 组件与主题定制](/features/customize)
- [3. 部署指南](/deploy/)
