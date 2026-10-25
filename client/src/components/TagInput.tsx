import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTags } from '../lib/queries'

type Props = {
  value: string[]
  onChange: (value: string[]) => void
}

export function TagInput({ value, onChange }: Props) {
  const tags = useTags()
  const [draft, setDraft] = useState('')
  const suggestions = tags.data?.filter((tag) => !value.includes(tag.name)) ?? []

  function add(name: string) {
    const trimmed = name.trim()
    if (trimmed !== '' && !value.includes(trimmed)) onChange([...value, trimmed])
    setDraft('')
  }

  function remove(name: string) {
    onChange(value.filter((tag) => tag !== name))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // 输入法组字时按 Enter 是在选字，不加入标签
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-stone-300 bg-white px-2 py-1.5 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20">
        {value.map((name) => (
          <span key={name} className="flex items-center gap-1 rounded-full bg-teal-50 py-0.5 pr-1 pl-3 text-sm text-teal-800">
            {name}
            <button
              type="button"
              className="rounded-full px-1.5 text-teal-600 hover:bg-teal-100 hover:text-teal-900"
              onClick={() => remove(name)}
              aria-label={`移除标签 ${name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-40 flex-1 bg-transparent px-1 py-0.5 text-stone-900 outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length === 0 ? '输入标签后按 Enter' : ''}
          aria-label="新增标签"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="rounded-full border border-stone-200 px-2.5 py-0.5 text-sm text-stone-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
              onClick={() => add(tag.name)}
            >
              + {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
