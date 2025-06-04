import { checkAuthenticated } from '@/lib/auth-client'
import { client } from '@/lib/client';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  loader: async () => {
    const response = await client.models.$get();
    return response.json();
  },
  component: RouteComponent,
})

function RouteComponent() {
  const response = Route.useLoaderData();

  // TODO: Style
  return <pre>{JSON.stringify(response, null, 2)}</pre>
}
