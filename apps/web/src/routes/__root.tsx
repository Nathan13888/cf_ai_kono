import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { FALLBACK_ROUTE } from "@/constant";
import "@/root.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <>
            <main className="flex flex-col w-full h-screen overflow-hidden bg-gray-50 overscroll-none touch-none">
                <QueryClientProvider client={queryClient}>
                    <Outlet />
                </QueryClientProvider>
            </main>
            <TanStackRouterDevtools />
        </>
    ),
    notFoundComponent: () => {
        // redirect({
        //   to: FALLBACK_ROUTE,
        // });
        return (
            <div className="flex items-center justify-center w-full h-full">
                <h1 className="text-2xl font-bold text-gray-500">
                    404 Not Found
                </h1>
                <Link to={FALLBACK_ROUTE}>Go to chat</Link>
            </div>
        );
    },
});
