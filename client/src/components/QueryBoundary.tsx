import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorNotice } from '@/components/ErrorNotice'

type Props = {
    children: ReactNode
    // suspend 时显示的内容
    fallback: ReactNode
    // 这些值改变时自动清掉错误状态，例如换了一句名句
    resetKeys?: unknown[]
}

// 用 useSuspenseQuery 的组件外面包这一层：载入中交给 <Suspense>，出错交给 ErrorBoundary；
// 按「重试」时 QueryErrorResetBoundary 会让失败的 query 重新抓
export function QueryBoundary({ children, fallback, resetKeys }: Props) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onReset={reset}
                    resetKeys={resetKeys}
                    fallbackRender={({ error, resetErrorBoundary }) => (
                        <ErrorNotice error={error} onRetry={resetErrorBoundary} />
                    )}
                >
                    <Suspense fallback={fallback}>{children}</Suspense>
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    )
}
