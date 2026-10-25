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
