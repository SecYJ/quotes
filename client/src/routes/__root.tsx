import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="mx-auto min-h-dvh max-w-xl px-4 py-6">
      <Outlet />
    </div>
  ),
})
