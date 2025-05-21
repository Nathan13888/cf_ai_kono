import { createRootRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/root.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <main className="flex flex-col w-full h-screen overflow-hidden bg-gray-50 overscroll-none touch-none">
      <QueryClientProvider client={queryClient}>
        <Outlet />
      <TanStackRouterDevtools />
      </QueryClientProvider>
    </main>
    //   {/* <div className="p-2 flex gap-2">
    //     <Link to="/" className="[&.active]:font-bold">
    //       Home
    //     </Link>{' '}
    //     <Link to="/about" className="[&.active]:font-bold">
    //       About
    //     </Link>
    //   </div>
    //   <hr /> */}
  ),
  notFoundComponent: () => redirect({
        to: '/chat',
      }),
})
