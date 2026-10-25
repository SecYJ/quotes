import { useState } from 'react'

export type ViewMode = 'row' | 'grid'

const STORAGE_KEY = 'lines-view-mode'

// 列表的显示方式是个人偏好，记在 localStorage；读写失败时退回 row
export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(readStoredViewMode)

  function setViewMode(next: ViewMode) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 存不了只影响下次打开
    }
    setViewModeState(next)
  }

  return [viewMode, setViewMode] as const
}

function readStoredViewMode(): ViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'grid' ? 'grid' : 'row'
  } catch {
    return 'row'
  }
}
