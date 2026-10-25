import type { SourceType } from './types'

export const sourceTypeLabels: Record<SourceType, string> = {
  drama: '戏剧',
  book: '书',
  real_life: '现实生活',
  other: '其他',
}

export const sourceTypes = Object.keys(sourceTypeLabels) as SourceType[]
