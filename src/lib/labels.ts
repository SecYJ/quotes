import type { Quote } from '@/lib/quotes'

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
