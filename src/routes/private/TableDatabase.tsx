import { createFileRoute } from '@tanstack/react-router'
import TableDatabase from '@/components/tables/table-database-component'; 
import { requireAdmin } from "@/routes/guards";

export const Route = createFileRoute('/private/TableDatabase')({
  beforeLoad: requireAdmin,
  component: RouteComponent,
})

function RouteComponent() {
  return <TableDatabase />
}
