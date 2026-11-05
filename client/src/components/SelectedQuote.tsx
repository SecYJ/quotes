import type { ReactNode } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { findQuoteInLists, quoteQueries } from '@/lib/queries'
import type { Quote } from '@/lib/types'

// 读取 id 对应的名句，再交给 children 渲染（阅览页显示详细，管理页放进编辑表单）
export function SelectedQuote({
    id,
    children,
}: {
    id: number
    children: (quote: Quote) => ReactNode
}) {
    const queryClient = useQueryClient()
    const { data: quote } = useSuspenseQuery({
        ...quoteQueries.detail(id),
        // 列表里已经有这句，先拿来显示，不必 suspend；背景再取一次最新的
        initialData() {
            return findQuoteInLists(queryClient, id)
        },
    })

    return children(quote)
}
