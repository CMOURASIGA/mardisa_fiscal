import { createFileRoute } from '@tanstack/react-router'
import TableReport from '@/components/tables/table-report-component'; 

export const Route = createFileRoute('/private/TableReport')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TableReport />
}
