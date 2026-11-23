import { createFileRoute } from '@tanstack/react-router'
import GenerateFile from '@/components/GenerateFile'; 

export const Route = createFileRoute('/private/generateFile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GenerateFile />
}
