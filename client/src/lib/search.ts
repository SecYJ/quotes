import { useNavigate, useSearch } from '@tanstack/react-router'
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

// 读写列表页的筛选条件（存在网址里）。阅览页与管理页的名句分页共用，
// 所以不绑定特定 route：读目前网址的 search params，改的时候留在目前这一页（`to: '.'`）
export function useQuoteFilters() {
    const filters = validateQuoteSearch(useSearch({ strict: false }))
    const navigate = useNavigate()

    function setFilters(patch: QuoteFilters) {
        navigate({ to: '.', search: (prev) => ({ ...prev, ...patch }), replace: true })
    }

    function clearFilters() {
        navigate({ to: '.', search: {}, replace: true })
    }

    return { filters, setFilters, clearFilters }
}
