import { useSuspenseQueries } from '@tanstack/react-query'
import type { UseSuspenseQueryResult } from '@tanstack/react-query'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { sourceTypeLabels, sourceTypes } from '@/lib/labels'
import { quoteQueries, sourceQueries, tagQueries } from '@/lib/queries'
import { useQuoteFilters } from '@/lib/search'
import type { Quote, Source, Tag } from '@/lib/types'
import { ModeToggle } from './ModeToggle'
import { QueryBoundary } from './QueryBoundary'

// 标题与主题切换不依赖资料，载入中也保持显示
export function FilterSidebar() {
    return (
        <nav className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-6">
            <div className="flex items-center justify-between">
                <h1 className="font-quote text-3xl">Lines</h1>
                <ModeToggle />
            </div>
            <QueryBoundary fallback={<p className="px-3 text-muted-foreground">载入中…</p>}>
                <Filters />
            </QueryBoundary>
        </nav>
    )
}

function Filters() {
    const { filters, setFilters, clearFilters } = useQuoteFilters()
    // 三个 query 一起抓（分开呼叫 useSuspenseQuery 会一个等一个）
    const { sources, tags, total, countBySource, countByTag } = useSuspenseQueries({
        queries: [quoteQueries.list({}), sourceQueries.list(), tagQueries.list()],
        combine: combineSidebarData,
    })

    const hasFilters =
        filters.sourceId !== undefined || filters.tagId !== undefined || filters.q !== undefined

    return (
        <>
            <div className="space-y-1">
                <button type="button" className={itemClass(!hasFilters)} onClick={clearFilters}>
                    <span>全部名句</span>
                    <span className={countClass}>{total}</span>
                </button>
                {hasFilters && (
                    <Button variant="link" size="sm" className="px-3" onClick={clearFilters}>
                        清除筛选
                    </Button>
                )}
            </div>

            <section className="space-y-5">
                <h2 className={headingClass}>出处</h2>
                {sourceTypes.map((type) => {
                    const group = sources.filter((source) => source.type === type)
                    if (group.length === 0) return null
                    return (
                        <div key={type} className="space-y-1">
                            <h3 className="px-3 text-xs text-muted-foreground/80">
                                {sourceTypeLabels[type]}
                            </h3>
                            {group.map((source) => (
                                <button
                                    key={source.id}
                                    type="button"
                                    className={itemClass(filters.sourceId === source.id)}
                                    onClick={() =>
                                        setFilters({
                                            sourceId:
                                                filters.sourceId === source.id
                                                    ? undefined
                                                    : source.id,
                                        })
                                    }
                                >
                                    <span className="truncate">{source.title}</span>
                                    <span className={countClass}>
                                        {countBySource.get(source.id) ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )
                })}
            </section>

            <section className="space-y-3">
                <h2 className={headingClass}>标签</h2>
                <div className="flex flex-wrap gap-2 px-1">
                    {tags.map((tag) => {
                        const active = filters.tagId === tag.id
                        return (
                            <Button
                                key={tag.id}
                                variant={active ? 'default' : 'secondary'}
                                size="sm"
                                className="rounded-full"
                                onClick={() => setFilters({ tagId: active ? undefined : tag.id })}
                            >
                                #{tag.name}
                                <span
                                    className={
                                        active
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    {countByTag.get(tag.id) ?? 0}
                                </span>
                            </Button>
                        )
                    })}
                </div>
            </section>
        </>
    )
}

// combine 放在 module scope：参照固定，只有资料变了才会重算
function combineSidebarData([quotesResult, sourcesResult, tagsResult]: [
    UseSuspenseQueryResult<Quote[]>,
    UseSuspenseQueryResult<Source[]>,
    UseSuspenseQueryResult<Tag[]>,
]) {
    const countBySource = new Map<number, number>()
    const countByTag = new Map<number, number>()
    for (const quote of quotesResult.data) {
        countBySource.set(quote.source.id, (countBySource.get(quote.source.id) ?? 0) + 1)
        for (const tag of quote.tags) countByTag.set(tag.id, (countByTag.get(tag.id) ?? 0) + 1)
    }

    return {
        sources: sourcesResult.data,
        tags: tagsResult.data,
        total: quotesResult.data.length,
        countBySource,
        countByTag,
    }
}

function itemClass(active: boolean) {
    return cn(
        'flex w-full items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left transition-colors',
        active ? 'bg-primary/10 font-medium text-primary' : 'text-foreground/80 hover:bg-muted',
    )
}

const headingClass = 'px-3 text-sm font-medium'
const countClass = 'shrink-0 text-sm text-muted-foreground tabular-nums'
