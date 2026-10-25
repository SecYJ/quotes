import { queryOptions, useMutation } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { mockApi } from '@/mock/api'
import type { Quote, QuoteFilters, QuoteInput, SourceInput } from '@/lib/types'

// 组件只透过这里拿资料。接真 API 时把 mockApi 换成 Hono RPC client 即可
//
// 每个领域一个 factory 物件：all() / lists() / details() 只用来做大范围的 cache 比对（例如 invalidate），
// 其他地方一律用完整的 options（list(filters)、detail(id)），loader、组件、mutation 共用同一份

export const quoteQueries = {
    all() {
        return ['quotes'] as const
    },
    lists() {
        return [...quoteQueries.all(), 'list'] as const
    },
    list(filters: QuoteFilters) {
        return queryOptions({
            queryKey: [...quoteQueries.lists(), filters] as const,
            queryFn() {
                return mockApi.listQuotes(filters)
            },
        })
    },
    details() {
        return [...quoteQueries.all(), 'detail'] as const
    },
    detail(id: number) {
        return queryOptions({
            queryKey: [...quoteQueries.details(), id] as const,
            queryFn() {
                return mockApi.getQuote(id)
            },
        })
    },
}

export const sourceQueries = {
    list() {
        return queryOptions({
            queryKey: ['sources'] as const,
            queryFn() {
                return mockApi.listSources()
            },
        })
    },
}

export const tagQueries = {
    list() {
        return queryOptions({
            queryKey: ['tags'] as const,
            queryFn() {
                return mockApi.listTags()
            },
        })
    },
}

// 列表 cache 里已经有这句时直接拿来用，详细栏不必 suspend
export function findQuoteInLists(queryClient: QueryClient, id: number): Quote | undefined {
    for (const [, quotes] of queryClient.getQueriesData<Quote[]>({
        queryKey: quoteQueries.lists(),
    })) {
        const found = quotes?.find((quote) => quote.id === id)
        if (found) return found
    }
    return undefined
}

export function useCreateSource() {
    return useMutation({
        mutationFn(input: SourceInput) {
            return mockApi.createSource(input)
        },
        onSuccess(_data, _variables, _onMutateResult, context) {
            return context.client.invalidateQueries(sourceQueries.list())
        },
    })
}

// 新增会改变列表内容与句数；可能建立新标签
export function useCreateQuote() {
    return useMutation({
        mutationFn(input: QuoteInput) {
            return mockApi.createQuote(input)
        },
        onSuccess(_data, _variables, _onMutateResult, context) {
            return Promise.all([
                context.client.invalidateQueries({ queryKey: quoteQueries.lists() }),
                context.client.invalidateQueries(tagQueries.list()),
            ])
        },
    })
}

// 编辑会改变这句的详细、可能改变它在哪些筛选结果里；可能建立新标签
export function useUpdateQuote() {
    return useMutation({
        mutationFn({ id, input }: { id: number; input: QuoteInput }) {
            return mockApi.updateQuote(id, input)
        },
        onSuccess(_data, variables, _onMutateResult, context) {
            return Promise.all([
                context.client.invalidateQueries(quoteQueries.detail(variables.id)),
                context.client.invalidateQueries({ queryKey: quoteQueries.lists() }),
                context.client.invalidateQueries(tagQueries.list()),
            ])
        },
    })
}

// 删除只更新列表；这句的 detail 已经不存在，重新查询只会得到错误，留给 cache 自己回收
export function useDeleteQuote() {
    return useMutation({
        mutationFn(id: number) {
            return mockApi.deleteQuote(id)
        },
        onSuccess(_data, _variables, _onMutateResult, context) {
            return context.client.invalidateQueries({ queryKey: quoteQueries.lists() })
        },
    })
}
