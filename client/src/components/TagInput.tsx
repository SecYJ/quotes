import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTags } from '@/lib/queries'

type Props = {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
}

export function TagInput({ id, value, onChange }: Props) {
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
      <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input px-1.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
        {value.map((name) => (
          <Badge key={name} variant="secondary" className="h-6 gap-0.5 pr-0.5 text-sm">
            {name}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5 rounded-full"
              onClick={() => remove(name)}
              aria-label={`移除标签 ${name}`}
            >
              <XIcon />
            </Button>
          </Badge>
        ))}
        <input
          id={id}
          className="min-w-40 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length === 0 ? '输入标签后按 Enter' : ''}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <Button key={tag.id} type="button" variant="outline" size="xs" className="rounded-full" onClick={() => add(tag.name)}>
              + {tag.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
