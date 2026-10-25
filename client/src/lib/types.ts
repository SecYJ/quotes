// 字段与 docs/init.md 的数据结构一致，之后换成真 API 时沿用

export type SourceType = 'drama' | 'book' | 'real_life' | 'other'

export type Source = {
    id: number
    type: SourceType
    title: string
    createdAt: string
}

export type Tag = {
    id: number
    name: string
}

export type Quote = {
    id: number
    content: string
    speaker: string | null
    source: Source
    sourceDetail: string | null
    note: string | null
    tags: Tag[]
    createdAt: string
    updatedAt: string
}

export type QuoteInput = {
    content: string
    speaker: string | null
    sourceId: number
    sourceDetail: string | null
    note: string | null
    // 用名称传递，不存在的标签由 API 建立
    tags: string[]
}

export type SourceInput = {
    type: SourceType
    title: string
}

export type QuoteFilters = {
    sourceId?: number
    tagId?: number
    q?: string
}
