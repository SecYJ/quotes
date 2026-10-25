import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { sourceTypeLabels, sourceTypes } from '@/lib/labels'
import { useQuotes, useSources, useTags } from '@/lib/queries'
import { useQuoteFilters } from '@/lib/search'
import { ModeToggle } from './ModeToggle'

export function FilterSidebar() {
  const { filters, setFilters, clearFilters } = useQuoteFilters()
  const sources = useSources()
  const tags = useTags()
  // 全部名句，用来算每个出处 / 标签有几句
  const allQuotes = useQuotes({})

  function countBySource(sourceId: number) {
    return allQuotes.data?.filter((quote) => quote.source.id === sourceId).length ?? 0
  }

  function countByTag(tagId: number) {
    return allQuotes.data?.filter((quote) => quote.tags.some((tag) => tag.id === tagId)).length ?? 0
  }

  const hasFilters = filters.sourceId !== undefined || filters.tagId !== undefined || filters.q !== undefined

  return (
    <nav className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-quote text-3xl">Lines</h1>
        <ModeToggle />
      </div>

      <div className="space-y-1">
        <button type="button" className={itemClass(!hasFilters)} onClick={clearFilters}>
          <span>全部名句</span>
          <span className={countClass}>{allQuotes.data?.length ?? ''}</span>
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
          const group = sources.data?.filter((source) => source.type === type) ?? []
          if (group.length === 0) return null
          return (
            <div key={type} className="space-y-1">
              <h3 className="px-3 text-xs text-muted-foreground/80">{sourceTypeLabels[type]}</h3>
              {group.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={itemClass(filters.sourceId === source.id)}
                  onClick={() => setFilters({ sourceId: filters.sourceId === source.id ? undefined : source.id })}
                >
                  <span className="truncate">{source.title}</span>
                  <span className={countClass}>{countBySource(source.id)}</span>
                </button>
              ))}
            </div>
          )
        })}
      </section>

      <section className="space-y-3">
        <h2 className={headingClass}>标签</h2>
        <div className="flex flex-wrap gap-2 px-1">
          {tags.data?.map((tag) => {
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
                <span className={active ? 'text-primary-foreground/70' : 'text-muted-foreground'}>{countByTag(tag.id)}</span>
              </Button>
            )
          })}
        </div>
      </section>
    </nav>
  )
}

function itemClass(active: boolean) {
  return cn(
    'flex w-full items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left transition-colors',
    active ? 'bg-primary/10 font-medium text-primary' : 'text-foreground/80 hover:bg-muted',
  )
}

const headingClass = 'px-3 text-sm font-medium'
const countClass = 'shrink-0 text-sm text-muted-foreground tabular-nums'
