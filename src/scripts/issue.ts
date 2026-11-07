// 阅览页的筛选：所有名句已经在 HTML 里，这里只负责显示/隐藏、排版位置与网址同步
const SIDE = 3

type Filters = { source: string; tag: string; q: string }

function readFilters(): Filters {
    const p = new URLSearchParams(location.search)
    return { source: p.get('source') ?? '', tag: p.get('tag') ?? '', q: p.get('q') ?? '' }
}

function writeFilters(f: Filters, push: boolean) {
    const p = new URLSearchParams()
    if (f.source) p.set('source', f.source)
    if (f.tag) p.set('tag', f.tag)
    if (f.q) p.set('q', f.q)
    const url = p.size ? `?${p}` : location.pathname
    if (push) history.pushState(null, '', url)
    else history.replaceState(null, '', url)
}

function matches(el: HTMLElement, f: Filters) {
    if (f.source && el.dataset.source !== f.source) return false
    if (f.tag) {
        const tag = f.tag.toLowerCase()
        if (!el.dataset.tags?.split('\n').some((t) => t.toLowerCase() === tag)) return false
    }
    if (f.q && !el.dataset.search?.includes(f.q.toLowerCase())) return false
    return true
}

function highlight(el: HTMLElement, q: string) {
    for (const node of el.querySelectorAll<HTMLElement>('[data-highlight]')) {
        const text = (node.dataset.text ??= node.textContent ?? '')
        node.replaceChildren()
        if (!q) {
            node.textContent = text
            continue
        }
        const lower = text.toLowerCase()
        const needle = q.toLowerCase()
        let at = 0
        for (let i = lower.indexOf(needle); i !== -1; i = lower.indexOf(needle, at)) {
            node.append(text.slice(at, i))
            const mark = document.createElement('mark')
            mark.textContent = text.slice(i, i + needle.length)
            node.append(mark)
            at = i + needle.length
        }
        node.append(text.slice(at))
    }
}

export function startIssue() {
    const lead = document.querySelector<HTMLElement>('.lead')!
    const side = document.querySelector<HTMLElement>('.side')!
    const rest = document.querySelector<HTMLElement>('.rest')!
    const empty = document.querySelector<HTMLElement>('.empty')!
    const status = document.querySelector<HTMLElement>('.status')!
    const statusText = status.querySelector<HTMLElement>('.status-text')!
    const input = document.querySelector<HTMLInputElement>('#q')!
    const panel = document.querySelector<HTMLDetailsElement>('.index-panel')!
    const items = [...document.querySelectorAll<HTMLElement>('.quote')]
    const sourceNames = new Map(
        [...document.querySelectorAll<HTMLElement>('.index [data-filter-source]')].map((a) => [
            a.dataset.filterSource!,
            a.firstChild?.textContent?.trim() ?? '',
        ]),
    )

    let filters = readFilters()

    // 宽屏永远展开；手机预设收起，让最新那句先被看到，有筛选时才展开
    const wide = matchMedia('(min-width: 48rem)')
    function syncPanel() {
        panel.open = wide.matches || Boolean(filters.source || filters.tag)
    }
    wide.addEventListener('change', syncPanel)
    syncPanel()

    let currentLead: HTMLElement | undefined

    function render(animate: boolean) {
        input.value = filters.q
        const visible = items.filter((el) => matches(el, filters))
        for (const el of items) {
            el.hidden = !visible.includes(el)
            highlight(el, filters.q)
        }
        // 按原本的顺序重新分配：第一句到头条，接着几句到侧栏，其余到下方
        visible.forEach((el, i) => (i === 0 ? lead : i <= SIDE ? side : rest).append(el))
        for (const el of items) if (el.hidden) rest.append(el)

        if (animate && visible[0] && visible[0] !== currentLead) {
            visible[0].classList.remove('arrive')
            void visible[0].offsetWidth
            visible[0].classList.add('arrive')
        }
        currentLead = visible[0]

        empty.hidden = visible.length > 0
        rest.hidden = visible.length <= 1 + SIDE
        for (const a of document.querySelectorAll<HTMLAnchorElement>('.index [data-filter-source]'))
            a.toggleAttribute('aria-current', a.dataset.filterSource === filters.source)
        for (const a of document.querySelectorAll<HTMLAnchorElement>('.index [data-filter-tag]'))
            a.toggleAttribute(
                'aria-current',
                a.dataset.filterTag!.toLowerCase() === filters.tag.toLowerCase(),
            )

        const parts = [
            filters.source && `出处：${sourceNames.get(filters.source) ?? filters.source}`,
            filters.tag && `标签：${filters.tag}`,
            filters.q && `搜索：「${filters.q}」`,
        ].filter(Boolean)
        status.hidden = parts.length === 0
        statusText.textContent = `${parts.join(' · ')} · ${visible.length} 句`
    }

    document.addEventListener('click', (e) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>(
            '[data-filter-source], [data-filter-tag], .clear',
        )
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        if (a.classList.contains('clear')) filters = { source: '', tag: '', q: '' }
        else if (a.dataset.filterSource !== undefined) {
            const s = a.dataset.filterSource
            filters = { ...filters, source: filters.source === s ? '' : s }
        } else {
            const t = a.dataset.filterTag!
            filters = { ...filters, tag: filters.tag.toLowerCase() === t.toLowerCase() ? '' : t }
        }
        writeFilters(filters, true)
        render(true)
        if (!a.closest('.index'))
            document.querySelector('.index')?.scrollIntoView({ block: 'start' })
    })

    input.addEventListener('input', () => {
        filters = { ...filters, q: input.value.trim() }
        writeFilters(filters, false)
        render(true)
    })
    input.form!.addEventListener('submit', (e) => e.preventDefault())

    addEventListener('popstate', () => {
        filters = readFilters()
        render(true)
    })

    render(false)
}
