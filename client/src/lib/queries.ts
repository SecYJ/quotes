import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { mockApi } from '@/mock/api'
import type { Quote, QuoteFilters, QuoteInput, SourceInput } from './types'

// 组件只透过这里拿资料。接真 API 时把 mockApi 换成 Hono RPC client 即可
//
// 读资料的流程：route loader 先用 queryOptions 把资料放进 cache，
// 组件再用 useSuspenseQuery 读；cache 没有资料时才会 suspend，交给外层 <Suspense> 显示载入中

export const queryKeys = {
    quotes: ['quotes'] as const,
    quoteLists: ['quotes', 'list'] as const,
    quoteList: (filters: QuoteFilters) => ['quotes', 'list', filters] as const,
    quote: (id: number) => ['quotes', 'detail', id] as const,
    sources: ['sources'] as const,
    tags: ['tags'] as const,
}

export function quotesQueryOptions(filters: QuoteFilters) {
    return queryOptions({
        queryKey: queryKeys.quoteList(filters),
        queryFn: () => mockApi.listQuotes(filters),
    })
}

export function quoteQueryOptions(id: number) {
    return queryOptions({
        queryKey: queryKeys.quote(id),
        queryFn: () => mockApi.getQuote(id),
    })
}

export function sourcesQueryOptions() {
    return queryOptions({ queryKey: queryKeys.sources, queryFn: () => mockApi.listSources() })
}

export function tagsQueryOptions() {
    return queryOptions({ queryKey: queryKeys.tags, queryFn: () => mockApi.listTags() })
}

export function useQuotes(filters: QuoteFilters) {
    return useSuspenseQuery(quotesQueryOptions(filters))
}

export function useQuote(id: number) {
    const queryClient = useQueryClient()
    return useSuspenseQuery({
        ...quoteQueryOptions(id),
        // 列表里已经有这句，先拿来显示，不必 suspend；背景再取一次最新的
        initialData: () => findQuoteInLists(queryClient, id),
    })
}

export function useSources() {
    return useSuspenseQuery(sourcesQueryOptions())
}

export function useTags() {
    return useSuspenseQuery(tagsQueryOptions())
}

export function useCreateSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: SourceInput) => mockApi.createSource(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sources }),
    })
}

export function useCreateQuote() {
    const invalidate = useInvalidateQuoteData()
    return useMutation({
        mutationFn: (input: QuoteInput) => mockApi.createQuote(input),
        onSuccess: () => invalidate(),
    })
}

export function useUpdateQuote() {
    const invalidate = useInvalidateQuoteData()
    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: QuoteInput }) =>
            mockApi.updateQuote(id, input),
        onSuccess: () => invalidate(),
    })
}

export function useDeleteQuote() {
    const invalidate = useInvalidateQuoteData()
    return useMutation({
        mutationFn: (id: number) => mockApi.deleteQuote(id),
        onSuccess: (_data, id) => invalidate(id),
    })
}

// 名句变动可能新增了标签，所以一起更新
function useInvalidateQuoteData() {
    const queryClient = useQueryClient()

    // deletedId：刚删除的名句不再重新查询，否则会拿到"找不到"的错误
    async function invalidate(deletedId?: number) {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: queryKeys.quotes,
                predicate: (query) =>
                    query.queryKey[2] !== deletedId || query.queryKey[1] !== 'detail',
            }),
            queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
        ])
    }

    return invalidate
}

function findQuoteInLists(queryClient: ReturnType<typeof useQueryClient>, id: number) {
    for (const [, quotes] of queryClient.getQueriesData<Quote[]>({
        queryKey: queryKeys.quoteLists,
    })) {
        const found = quotes?.find((quote) => quote.id === id)
        if (found) return found
    }
    return undefined
}
