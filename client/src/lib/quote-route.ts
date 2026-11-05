import type { QueryClient } from '@tanstack/react-query'
import { quoteQueries, sourceQueries, tagQueries } from '@/lib/queries'
import { validateQuoteSearch } from '@/lib/search'
import type { QuoteFilters } from '@/lib/types'

// `/` 与 `/admin/` 的名句列表共用：同样的 search params、loader 与 route context

export const quoteListRouteOptions = {
    validateSearch: validateQuoteSearch,
    // 只取 loader 用到的 search params，其他参数改变时不会重跑 loader
    loaderDeps({ search: { sourceId, tagId, q } }: { search: QuoteFilters }): QuoteFilters {
        return { sourceId, tagId, q }
    },
    // 依 search params 组好的 query options 放在 route context，loader 与组件共用同一份
    context({ deps }: { deps: QuoteFilters }) {
        return { quoteListQueryOptions: quoteQueries.list(deps) }
    },
    // 这里要 await：搜索、筛选会换成新的 query key，若不等资料就渲染，
    // useSuspenseQuery 会 suspend，列表每打一个字就闪成「载入中」（实测过）。
    // 等待时 router 保留旧画面，资料到了才换。全部一起等，不要一个接一个；
    // 失败时由 root route 的 errorComponent 处理
    async loader({
        context,
    }: {
        context: {
            queryClient: QueryClient
            quoteListQueryOptions: ReturnType<typeof quoteQueries.list>
        }
    }) {
        const { queryClient } = context
        await Promise.all([
            queryClient.query({ ...context.quoteListQueryOptions, staleTime: 'static' }),
            // 侧栏计算每个出处 / 标签的句数要用全部名句
            queryClient.query({ ...quoteQueries.list({}), staleTime: 'static' }),
            queryClient.query({ ...sourceQueries.list(), staleTime: 'static' }),
            queryClient.query({ ...tagQueries.list(), staleTime: 'static' }),
        ])
    },
}
