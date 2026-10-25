import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/mock/api'
import type { QuoteFilters, QuoteInput, SourceInput } from './types'

// 组件只透过这里拿资料。接真 API 时把 mockApi 换成 Hono RPC client 即可

export const queryKeys = {
  quotes: ['quotes'] as const,
  quoteList: (filters: QuoteFilters) => ['quotes', 'list', filters] as const,
  quote: (id: number) => ['quotes', 'detail', id] as const,
  sources: ['sources'] as const,
  tags: ['tags'] as const,
}

export function useQuotes(filters: QuoteFilters) {
  return useQuery({
    queryKey: queryKeys.quoteList(filters),
    queryFn: () => mockApi.listQuotes(filters),
    // 输入搜索时保留上一次的结果，列表不会闪烁
    placeholderData: (previous) => previous,
  })
}

export function useQuote(id: number) {
  return useQuery({
    queryKey: queryKeys.quote(id),
    queryFn: () => mockApi.getQuote(id),
  })
}

export function useSources() {
  return useQuery({ queryKey: queryKeys.sources, queryFn: () => mockApi.listSources() })
}

export function useTags() {
  return useQuery({ queryKey: queryKeys.tags, queryFn: () => mockApi.listTags() })
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
    mutationFn: ({ id, input }: { id: number; input: QuoteInput }) => mockApi.updateQuote(id, input),
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
        predicate: (query) => query.queryKey[2] !== deletedId || query.queryKey[1] !== 'detail',
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
    ])
  }

  return invalidate
}
