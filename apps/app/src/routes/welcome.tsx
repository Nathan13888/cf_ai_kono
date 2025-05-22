import { checkAuthenticated } from '@/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/welcome')({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  component: RouteComponent,
})

function RouteComponent() {
  // TODO: Add welcome page
  return redirect({
    to: "/",
    throw: true,
  })
}
