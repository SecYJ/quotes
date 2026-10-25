import { sourceTypeLabels, sourceTypes } from '../lib/labels'
import { useSources } from '../lib/queries'
import type { SourceType } from '../lib/types'

export type SourceChoice =
  | { kind: 'existing'; sourceId: number | null }
  | { kind: 'new'; type: SourceType; title: string }

type Props = {
  value: SourceChoice
  onChange: (value: SourceChoice) => void
  error?: string
}

const NEW_VALUE = 'new'

export function SourcePicker({ value, onChange, error }: Props) {
  const sources = useSources()

  if (value.kind === 'new') {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            className={inputClass}
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value as SourceType })}
            aria-label="出处类型"
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {sourceTypeLabels[type]}
              </option>
            ))}
          </select>
          <input
            className={`${inputClass} flex-1`}
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="出处名称，例如剧名、书名、朋友聊天"
            aria-label="出处名称"
            autoFocus
          />
        </div>
        {error && <p className={errorClass}>{error}</p>}
        <button
          type="button"
          className="text-sm text-stone-500 hover:text-stone-800"
          onClick={() => onChange({ kind: 'existing', sourceId: null })}
        >
          ← 选择已有出处
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <select
        className={`${inputClass} w-full`}
        value={value.sourceId ?? ''}
        onChange={(e) => {
          if (e.target.value === NEW_VALUE) {
            onChange({ kind: 'new', type: 'drama', title: '' })
          } else {
            onChange({ kind: 'existing', sourceId: e.target.value === '' ? null : Number(e.target.value) })
          }
        }}
        aria-label="出处"
      >
        <option value="">{sources.isPending ? '载入中…' : '选择出处'}</option>
        {sourceTypes.map((type) => {
          const group = sources.data?.filter((source) => source.type === type) ?? []
          if (group.length === 0) return null
          return (
            <optgroup key={type} label={sourceTypeLabels[type]}>
              {group.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </optgroup>
          )
        })}
        <option value={NEW_VALUE}>＋ 新增出处</option>
      </select>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

const inputClass =
  'rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
const errorClass = 'text-sm text-red-600'
