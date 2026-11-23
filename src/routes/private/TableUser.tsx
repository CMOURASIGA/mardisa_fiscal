import { createFileRoute } from '@tanstack/react-router'
import TableUser from '@/components/tables/table-users-component'; 
import { requireAdmin } from "@/routes/guards";

export const Route = createFileRoute('/private/TableUser')({
  beforeLoad: requireAdmin,
  component: RouteComponent,
})

function RouteComponent() {
  return <TableUser />
}
