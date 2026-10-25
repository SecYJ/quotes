import type { QuoteFilters } from './types'

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
