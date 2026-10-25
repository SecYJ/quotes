import { getRouteApi } from '@tanstack/react-router'
import type { QuoteFilters } from '@/lib/types'

// 列表页的 search params：?sourceId=&tagId=&q=
export function validateQuoteSearch(search: Record<string, unknown>): QuoteFilters {
    return {
        sourceId: toPositiveInt(search.sourceId),
        tagId: toPositiveInt(search.tagId),
        q: typeof search.q === 'string' && search.q.trim() !== '' ? search.q : undefined,
    }
}

function toPositiveInt(value: unknown) {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : undefined
}

const listRoute = getRouteApi('/')

// 读写列表页的筛选条件（存在网址里）
export function useQuoteFilters() {
    const filters = listRoute.useSearch()
    const navigate = listRoute.useNavigate()

    function setFilters(patch: QuoteFilters) {
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
    }

    function clearFilters() {
        navigate({ search: {}, replace: true })
    }

    return { filters, setFilters, clearFilters }
}
