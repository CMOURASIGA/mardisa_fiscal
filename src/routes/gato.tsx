import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/gato')({
  component: RouteComponent,
})

function RouteComponent() {
  return (<><div>Hello "/gato"!</div><div>Hello "/gato"!</div></>)
}
