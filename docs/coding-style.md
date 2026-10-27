# Coding 规则

写 code 时遵守以下规则。

## 1. 函数写法

### 具名函数用 function declaration

模块里的函数、React component、hook 都用 `function` 声明，不用 `const x = () => {}`。

```ts
// ✅
function formatDate(date: Date) {
  return date.toLocaleDateString()
}

function QuoteList() {
  return <ul>...</ul>
}

// ❌
const formatDate = (date: Date) => date.toLocaleDateString()
const QuoteList = () => <ul>...</ul>
```

传给 library 的 component 也先用 function declaration 声明，再传名字进去：

```tsx
// ✅
export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return <main>...</main>
}

// ❌
export const Route = createFileRoute('/')({ component: () => <main>...</main> })
```

### Arrow function 只用在 callback

传进另一个函数、当场执行的匿名函数（例如 `map`、`filter`、事件处理、Hono route handler、TanStack Query 的 `queryFn` / `mutationFn`）用 arrow function。

```ts
// ✅
quotes.map((quote) => quote.content)

app.get('/health', (c) => c.json({ ok: true }))

useQuery({
  queryKey: ['quotes'],
  queryFn: async () => {
    const res = await api.quotes.$get()
    return res.json()
  },
})

<button onClick={() => setOpen(true)}>新增</button>
```

### Object 的 method 用 object literal 的 method 简写

```ts
// ✅
const storage = {
  get(key: string) {
    return localStorage.getItem(key)
  },
}

// ❌
const storage = {
  get: function (key: string) {
    return localStorage.getItem(key)
  },
}

// ❌
const storage = {
  get: (key: string) => localStorage.getItem(key),
}
```

## 2. 类型

### 只用 `type`，不用 `interface`

```ts
// ✅
type Quote = {
  id: number
  content: string
}

// ❌
interface Quote {
  id: number
  content: string
}
```

唯一例外是必须靠 declaration merging 的 module augmentation（例如 `main.tsx` 里向 TanStack Router 注册的 `interface Register`）。

### Props 超过两个才另外定义 type

两个以内直接写在参数上：

```tsx
// ✅
function QuoteDetail({ quote, onEdit }: { quote: Quote; onEdit: () => void }) {}

// ❌
type QuoteDetailProps = {
  quote: Quote
  onEdit: () => void
}

function QuoteDetail({ quote, onEdit }: QuoteDetailProps) {}
```

### 一个档案只有一个 component / function 时，type 直接叫 `Props`

不用加上 component 名称。同一个档案有多个 component 需要各自的 type 时，才用 `ItemProps`、`PanelProps` 这类名称区分。

```tsx
// ✅ QuoteList.tsx
type Props = {
  quotes: Quote[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function QuoteList({ quotes, selectedId, onSelect }: Props) {}

// ❌
type QuoteListProps = { ... }
```

## 3. UI 与样式

- **UI 组件先用 shadcn/ui**（Base UI 版，`components/ui/*`）。没有的先 `shadcn add`，不要自己从头刻。`components/ui/` 里的档案由 CLI 产生，除了 import 路径之外不手改。
- **合并 class 用 `cn`**（`import { cn } from 'cn'`），不要用字串模板拼接条件 class。
- **颜色只用语意化 token**：`bg-background`、`text-foreground`、`text-muted-foreground`、`bg-primary`、`border` 等。不要直接写 `stone-*`、`teal-*`、`white`，否则深色模式会错。
- **表单用 React Hook Form + zod**：schema 放在 `lib/`，每个字段用 `Controller` 搭配 shadcn 的 `Field` / `FieldLabel` / `FieldError`，并设定 `data-invalid` 与 `aria-invalid`。
- **import 一律用 `@/` 绝对路径**（`@/components/ui/button`、`@/lib/queries`），不用 `./`、`../` 相对路径，lint 会挡。`@/` 对应 `client/src`，由 `vite.config.ts` 的 `resolve.alias` 与 `tsconfig.app.json` 的 `paths` 解析（`client/tsconfig.json` 的 `paths` 给 shadcn CLI 用）。server 用 `#/` 代替 `@/`（`#/db/schema`），由 `server/package.json` 的 `imports` 解析；不用 `@/` 是因为 client 会读 server 的声明档，`@/` 在 client 那边会被解析成 `client/src`。

## 4. 读写资料（TanStack Query）

改 TanStack Query 相关的 code 时，遵守 `.claude/skills/tanstack-query-best-practices`。本项目的具体做法：

- **每个领域一个 query factory 物件**（`lib/queries.ts` 的 `quoteQueries`、`sourceQueries`、`tagQueries`）。`all()` / `lists()` / `details()` 只用来做大范围的 cache 比对；其他地方一律用完整 options（`quoteQueries.list(filters)`、`detail(id)`）。不要另外导出 key 或包一层 `useXxx` hook。
- **依 route 输入组成的 options 放在 route 的 `context`**，组件用 `Route.useRouteContext()` 读，不要在组件里再用 search params 组一次。`loaderDeps` 只回传 loader 用到的 search params。
- **loader 用 `context.queryClient.query({ ...options, staleTime: 'static' })` 放进 cache**（`ensureQueryData` 已 deprecated）。预设不 await（`.catch(noop)`）；只有「没资料就不该渲染」时才 await，而且用 `Promise.all` 一起等。`/` 因为搜索时不能闪「载入中」，所以 await。
- **组件用 `useSuspenseQuery`**；同一个组件要多个 query 时用 `useSuspenseQueries`（一起抓，不会一个等一个），衍生资料放在 module scope 的 `combine` / `select`。
- **用到 suspense query 的组件外面包 `QueryBoundary`**（`<Suspense>` ＋ error boundary ＋ `QueryErrorResetBoundary`）。依赖会变的区块传 `resetKeys`。loader 失败由 root route 的 `errorComponent` 处理，重试时 `router.invalidate()`。
- **mutation 的 cache 同步写在 mutation 本身的 `onSuccess`**，用 `context.client` 和 factory 做 invalidate，并 return promise。只 invalidate 真的会变的部分（例如删除不 invalidate 已删除那句的 detail）。`mutate(..., { onSuccess })` 只做这次呼叫的 UI 效果（关闭表单、切换画面）。
- `queryFn`、`mutationFn`、callback 等函数型属性用 method shorthand。

## 5. 格式与 lint

- 格式交给 oxfmt（4 格缩进、每行 100 字元、不加分号、单引号），不要手动排版；提交前跑 `pnpm fmt` 与 `pnpm lint`。上面范例的缩进以 oxfmt 为准。
- `shadcn add` 产生的档案是 2 格缩进，加完组件后跑一次 `pnpm fmt`。
