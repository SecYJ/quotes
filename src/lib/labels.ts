import type { Quote } from '@/lib/quotes'

type SourceType = Quote['source']['type']

export const sourceTypes: SourceType[] = ['drama', 'book', 'real_life', 'other']

export const sourceTypeLabel: Record<SourceType, string> = {
    drama: '戏剧',
    book: '书',
    real_life: '现实生活',
    other: '其他',
}

// 剧和书是作品，用书名号；现实生活与其他是情境，不加
export function sourceName(source: Quote['source']) {
    return source.type === 'drama' || source.type === 'book' ? `《${source.title}》` : source.title
}

export function formatDate(date: Date) {
    return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`
}

export function isoDate(date: Date) {
    return date.toISOString().slice(0, 10)
}
