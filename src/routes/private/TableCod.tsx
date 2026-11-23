import { createFileRoute } from '@tanstack/react-router'
import TableCod from '@/components/tables/table-cod-component'; 

export const Route = createFileRoute('/private/TableCod')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TableCod />
}
