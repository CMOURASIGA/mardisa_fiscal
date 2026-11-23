import { createFileRoute } from '@tanstack/react-router'
import TableSale from '@/components/tables/table-sale-component'; 

export const Route = createFileRoute('/private/TableSale')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TableSale />
}
