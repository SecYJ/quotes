import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

// 管理页外框：上方分页列 + 登出，下面交给各分页。Cloudflare Access 保护整个 /admin
export const Route = createFileRoute('/admin')({ component: AdminLayout })

function AdminLayout() {
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b bg-sidebar px-10">
                <nav aria-label="管理分页" className="flex gap-6">
                    <Link
                        to="/admin"
                        activeOptions={{ exact: true }}
                        className="-mb-px border-b-2 border-transparent py-3 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-medium data-[status=active]:text-foreground"
                    >
                        名句
                    </Link>
                </nav>
                {/* Cloudflare Access 的登出网址；它在 router 之外，所以用一般的 <a> */}
                <a
                    href="/cdn-cgi/access/logout"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    登出
                </a>
            </header>
            <div className="min-h-0 flex-1">
                <Outlet />
            </div>
        </div>
    )
}
