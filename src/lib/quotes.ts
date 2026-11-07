import { getCollection } from 'astro:content'

// 跨档案的规则 schema 看不到，在这里检查；违规就丢错，build 失败
export async function loadQuotes() {
    const sources = await getCollection('sources')

    const titles = new Map<string, string>()
    for (const { id, data } of sources) {
        const key = `${data.type}:${data.title}`
        const other = titles.get(key)
        if (other) throw new Error(`出处 ${id} 与 ${other} 的类型和名称相同，请合成一个档案`)
        titles.set(key, id)
    }

    const tagSpellings = new Map<string, string>()
    for (const { id, data } of sources) {
        for (const tag of data.quotes.flatMap((q) => q.tags)) {
            const spelling = tagSpellings.get(tag.toLowerCase())
            if (spelling && spelling !== tag)
                throw new Error(
                    `标签「${tag}」（${id}）与「${spelling}」只差英文大小写，请统一写法`,
                )
            tagSpellings.set(tag.toLowerCase(), tag)
        }
    }

    return sources
        .flatMap(({ id, data: { quotes, ...source } }) =>
            quotes.map((quote) => ({ ...quote, source: { id, ...source } })),
        )
        .toSorted((a, b) => b.added.getTime() - a.added.getTime())
}

export type Quote = Awaited<ReturnType<typeof loadQuotes>>[number]
