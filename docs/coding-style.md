# Coding 规则

写 code 时遵守以下规则。

## 1. 函数写法

### 具名函数用 function declaration

模块里的函数都用 `function` 声明，不用 `const x = () => {}`；函数里面的具名小函数也一样。

```ts
// ✅
function formatDate(date: Date) {
    return date.toISOString().slice(0, 10)
}

// ❌
const formatDate = (date: Date) => date.toISOString().slice(0, 10)
```

### Arrow function 只用在 callback

传进另一个函数、当场执行的匿名函数（`map`、`filter`、`addEventListener` 等）用 arrow function。

```ts
// ✅
quotes.map((quote) => quote.content)
input.addEventListener('input', () => render())
```

### Object 的 method 用 method 简写

```ts
// ✅
const storage = {
    get(key: string) {
        return localStorage.getItem(key)
    },
}
```

## 2. 类型

- **只用 `type`，不用 `interface`**；Astro component 的 props 也写成 `type Props = { ... }`。
- 一个档案只有一个 component / function 时，type 直接叫 `Props`。
- 资料的型别从 content collection 的 schema 推出来（`Quote` 来自 `loadQuotes()` 的回传型别），不要另外手写一份。

## 3. Astro 与页面

- **能在 build 时做的就在 build 时做**：资料读取、排序、分组、计数都在 `.astro` 的 frontmatter 或 `src/lib/` 完成；浏览器里的 script 只负责筛选、搜索与网址同步。
- **资料规则放在 schema**：单一档案内的规则写在 `src/content.config.ts` 的 zod schema；需要看到所有档案的规则写在 `src/lib/quotes.ts` 的 `loadQuotes()`，违规就 `throw`，让 build 失败。错误讯息用中文，写出哪个档案、要怎么改。
- **不加 UI 框架**（React 等）；互动用原生 TypeScript。
- **import 一律用 `@/` 绝对路径**（`@/lib/quotes`），不用 `./`、`../`，lint 会挡。`@/` 对应 `src/`，由 `tsconfig.json` 的 `paths` 解析。

## 4. 样式

- 改 UI 外观前先看 [design.md](./design.md)。
- 颜色只用 `global.css` 里 `:root` 的 token（`--ground`、`--ink`、`--mute`、`--rule`、`--red`），不要在别处写死色码。红色只用在 design.md 列出的三个地方。
- 不加卡片、阴影、渐层、圆角块；分组用线。
- 新的版面规则先写手机，再用 `min-width` media query 往上加。

## 5. 格式与 lint

- 格式交给 oxfmt（4 格缩进、每行 100 字元、不加分号、单引号），不要手动排版；提交前跑 `pnpm fmt` 与 `pnpm lint`。
