import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { validateQuoteSearch } from '../lib/search'

// 列表页由各个设计（design/* branch）实现，main 先保留 API 连线测试
export const Route = createFileRoute('/')({
  validateSearch: validateQuoteSearch,
  component: Home,
})

function Home() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.health.$get()
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Lines</h1>
      <section className="rounded-lg border border-gray-200 p-4 text-sm">
        <p className="font-medium">API 连线测试</p>
        {health.isPending && <p className="text-gray-500">连线中…</p>}
        {health.isError && <p className="text-red-600">失败：{health.error.message}</p>}
        {health.isSuccess && (
          <p className="text-green-700">
            成功 ✓ <span className="text-gray-500">{health.data.time}</span>
          </p>
        )}
      </section>
    </main>
  )
}
