import { createFileRoute } from '@tanstack/react-router'
import TablePurchase from '@/components/tables/table-purchase-component'; 

export const Route = createFileRoute('/private/TablePurchase')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TablePurchase />
}
