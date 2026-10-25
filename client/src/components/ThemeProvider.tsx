import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

// 跟 index.html 里防闪烁的脚本用同一个 key
const STORAGE_KEY = 'lines-theme'

type ThemeContextValue = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// 预设跟随系统；选了 light / dark 之后记在 localStorage
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme)

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)')

        function apply() {
            const dark = theme === 'dark' || (theme === 'system' && media.matches)
            document.documentElement.classList.toggle('dark', dark)
        }

        apply()
        // 跟随系统时，系统切换主题也要跟着变
        if (theme !== 'system') return
        media.addEventListener('change', apply)
        return () => media.removeEventListener('change', apply)
    }, [theme])

    function setTheme(next: Theme) {
        try {
            if (next === 'system') localStorage.removeItem(STORAGE_KEY)
            else localStorage.setItem(STORAGE_KEY, next)
        } catch {
            // 无痕模式等情况存不了，只影响下次打开
        }
        setThemeState(next)
    }

    return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme 必须在 ThemeProvider 里使用')
    return context
}

function readStoredTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored === 'light' || stored === 'dark' ? stored : 'system'
    } catch {
        return 'system'
    }
}
