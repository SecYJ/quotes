import { sourceTypeLabels, sourceTypes } from '../lib/labels'
import { useQuotes, useSources, useTags } from '../lib/queries'
import { useQuoteFilters } from '../lib/search'

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
    <nav className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Lines</h1>
        {hasFilters && (
          <button type="button" className="text-sm text-teal-700 hover:text-teal-900" onClick={clearFilters}>
            清除筛选
          </button>
        )}
      </div>

      <button
        type="button"
        className={itemClass(!hasFilters)}
        onClick={clearFilters}
      >
        <span>全部名句</span>
        <span className={countClass}>{allQuotes.data?.length ?? ''}</span>
      </button>

      <section className="space-y-5">
        <h2 className={headingClass}>出处</h2>
        {sourceTypes.map((type) => {
          const group = sources.data?.filter((source) => source.type === type) ?? []
          if (group.length === 0) return null
          return (
            <div key={type} className="space-y-1">
              <h3 className="px-3 text-sm text-stone-400">{sourceTypeLabels[type]}</h3>
              {group.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={itemClass(filters.sourceId === source.id)}
                  onClick={() =>
                    setFilters({ sourceId: filters.sourceId === source.id ? undefined : source.id })
                  }
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
              <button
                key={tag.id}
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  active ? 'bg-teal-700 text-white' : 'bg-stone-200/70 text-stone-700 hover:bg-stone-200'
                }`}
                onClick={() => setFilters({ tagId: active ? undefined : tag.id })}
              >
                #{tag.name}
                <span className={`ml-1.5 ${active ? 'text-teal-100' : 'text-stone-400'}`}>{countByTag(tag.id)}</span>
              </button>
            )
          })}
        </div>
      </section>
    </nav>
  )
}

function itemClass(active: boolean) {
  return `flex w-full items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left ${
    active ? 'bg-teal-700/10 font-medium text-teal-900' : 'text-stone-700 hover:bg-stone-200/60'
  }`
}

const headingClass = 'px-3 text-xs font-semibold tracking-widest text-stone-500 uppercase'
const countClass = 'shrink-0 text-sm text-stone-400 tabular-nums'
