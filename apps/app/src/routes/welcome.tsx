import { checkAuthenticated } from '@/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/welcome')({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  loader: () => redirect({
      to: '/chat',
      throw: true,
    }),
  component: RouteComponent,
})

function RouteComponent() {
  // TODO: Add welcome page
  return null;
}
