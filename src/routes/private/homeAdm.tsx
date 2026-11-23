/* import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import LayoutAdm from '@/components/LayoutAdm'

export const Route = createFileRoute('/admin/homeAdm')({
  beforeLoad: ({ context }) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.role !== "admin" && user.role !== "admin-local") {
      throw redirect({ to: "/home" });
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <LayoutAdm />
      <Outlet />
    </>
  )
}
 */

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/private/homeAdm')({
  beforeLoad: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    if (!user) throw redirect({ to: '/auth/login' })
    if (!['admin', 'admin-local'].includes(user.role)) {
      throw redirect({ to: '/private/home' })
    }
  },

  component: () => <h1>Fazer aqui as instruções da home page</h1>,
})
