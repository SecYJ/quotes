import { queryOptions, useMutation } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { api, request } from '@/lib/api'
import type { Quote, QuoteFilters, QuoteInput, Source, SourceInput, Tag } from '@/lib/types'

// 组件只透过这里拿资料（Hono RPC client 呼叫 /api/*）。
// 每个 queryFn / mutationFn 都标明回传 lib/types.ts 的类型：server 回传的形状一旦改了，typecheck 就会报错
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
            queryFn(): Promise<Quote[]> {
                return request(api.quotes.$get({ query: toQuery(filters) }))
            },
        })
    },
    details() {
        return [...quoteQueries.all(), 'detail'] as const
    },
    detail(id: number) {
        return queryOptions({
            queryKey: [...quoteQueries.details(), id] as const,
            queryFn(): Promise<Quote> {
                return request(api.quotes[':id'].$get({ param: { id: String(id) } }))
            },
        })
    },
}

export const sourceQueries = {
    list() {
        return queryOptions({
            queryKey: ['sources'] as const,
            queryFn(): Promise<Source[]> {
                return request(api.sources.$get())
            },
        })
    },
}

export const tagQueries = {
    list() {
        return queryOptions({
            queryKey: ['tags'] as const,
            queryFn(): Promise<Tag[]> {
                return request(api.tags.$get())
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
        mutationFn(input: SourceInput): Promise<Source> {
            return request(api.admin.sources.$post({ json: input }))
        },
        onSuccess(_data, _variables, _onMutateResult, context) {
            return context.client.invalidateQueries(sourceQueries.list())
        },
    })
}

// 新增会改变列表内容与句数；可能建立新标签
export function useCreateQuote() {
    return useMutation({
        mutationFn(input: QuoteInput): Promise<Quote> {
            return request(api.admin.quotes.$post({ json: input }))
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
        mutationFn({ id, input }: { id: number; input: QuoteInput }): Promise<Quote> {
            return request(api.admin.quotes[':id'].$put({ param: { id: String(id) }, json: input }))
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
        async mutationFn(id: number): Promise<void> {
            await request(api.admin.quotes[':id'].$delete({ param: { id: String(id) } }))
        },
        onSuccess(_data, _variables, _onMutateResult, context) {
            return context.client.invalidateQueries({ queryKey: quoteQueries.lists() })
        },
    })
}

// query string 只有字串；没设定的条件不送
function toQuery(filters: QuoteFilters) {
    return {
        sourceId: filters.sourceId === undefined ? undefined : String(filters.sourceId),
        tagId: filters.tagId === undefined ? undefined : String(filters.tagId),
        q: filters.q,
    }
}
