import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/welcome')({
  component: RouteComponent,
})

function RouteComponent() {
  // TODO: Add welcome page
  return redirect({
    to: "/",
    throw: true,
  })
}
