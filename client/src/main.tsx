import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/ThemeProvider'
import { routeTree } from '@/routeTree.gen'
import '@/index.css'

const queryClient = new QueryClient()
const router = createRouter({
    routeTree,
    context: { queryClient },
    // 资料新旧交给 TanStack Query 判断，router 不另外快取 preload 的结果
    defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
)
