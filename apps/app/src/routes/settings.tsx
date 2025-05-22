import { checkAuthenticated } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello /settings</div> // TODO
}
