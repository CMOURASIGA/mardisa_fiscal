import { createFileRoute } from '@tanstack/react-router'
import UploadFile from '@/components/UploadFile'; 

export const Route = createFileRoute('/private/uploadFile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UploadFile />
}
