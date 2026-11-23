import { createFileRoute } from '@tanstack/react-router'
import TableEnterprise from '@/components/tables/table-enterprise-component';
import { requireAdmin } from "@/routes/guards";

export const Route = createFileRoute('/private/TableEnterprise')({
  beforeLoad: requireAdmin,
  component: RouteComponent,
})

function RouteComponent() {
  return <TableEnterprise />
}
