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

## 2. UI 与样式

- **UI 组件先用 shadcn/ui**（Base UI 版，`@/components/ui/*`）。没有的先 `shadcn add`，不要自己从头刻。`components/ui/` 里的档案由 CLI 产生，不手改。
- **合并 class 用 `cn`**（`import { cn } from 'cn'`），不要用字串模板拼接条件 class。
- **颜色只用语意化 token**：`bg-background`、`text-foreground`、`text-muted-foreground`、`bg-primary`、`border` 等。不要直接写 `stone-*`、`teal-*`、`white`，否则深色模式会错。
- **表单用 React Hook Form + zod**：schema 放在 `lib/`，每个字段用 `Controller` 搭配 shadcn 的 `Field` / `FieldLabel` / `FieldError`，并设定 `data-invalid` 与 `aria-invalid`。
- **import 用 `@/` alias**（指向 `client/src/`）。

## 3. 读资料

- **每种资料一个 `queryOptions` 工厂**（`lib/queries.ts` 的 `xxxQueryOptions`），loader 和组件共用同一份，query key 不会写错。
- **route loader 先把资料放进 cache**：`context.queryClient.query({ ...xxxQueryOptions(), staleTime: 'static' })`（`ensureQueryData` 已 deprecated）。`loaderDeps` 只回传 loader 用到的 search params，不要整个 `search`。
- **组件用 `useSuspenseQuery`**（透过 `useQuotes` 等 hook），拿到的 `data` 一定有值，不必处理 `undefined` / `isPending`。
- **用到 suspense query 的组件外面包 `QueryBoundary`**（`<Suspense>` ＋ error boundary ＋ `QueryErrorResetBoundary`）。依赖会变的区块传 `resetKeys`，换资料时自动清掉错误。
- loader 失败由 root route 的 `errorComponent` 处理，重试时 `router.invalidate()`。

## 4. 格式与 lint

- 格式交给 oxfmt（4 格缩进、每行 100 字元、不加分号、单引号），不要手动排版；提交前跑 `pnpm fmt` 与 `pnpm lint`。上面范例的缩进以 oxfmt 为准。
- `shadcn add` 产生的档案是 2 格缩进，加完组件后跑一次 `pnpm fmt`。
