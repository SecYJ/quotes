import type { Source, SourceType } from '@/lib/types'

export const sourceTypeLabels: Record<SourceType, string> = {
    drama: '戏剧',
    book: '书',
    real_life: '现实生活',
    other: '其他',
}

export const sourceTypes = Object.keys(sourceTypeLabels) as SourceType[]

// 剧名、书名加书名号；现实生活、其他直接显示
export function formatSourceTitle(source: Source) {
    return source.type === 'drama' || source.type === 'book' ? `《${source.title}》` : source.title
}
