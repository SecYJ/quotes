import { useEffect } from 'react'
import { Outlet, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { ErrorNotice } from '@/components/ErrorNotice'

// 所有 route 的 loader 都能从 context 拿到 queryClient，先把资料放进 cache
export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RootError,
})

function RootLayout() {
  return (
    <div className="h-dvh overflow-hidden">
      <Outlet />
    </div>
  )
}

// loader 失败时显示；重试要同时清掉 query 的错误状态与 router 的错误状态
function RootError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className="mx-auto max-w-xl px-8 py-24">
      <ErrorNotice error={error} onRetry={() => router.invalidate()} />
    </div>
  )
}
