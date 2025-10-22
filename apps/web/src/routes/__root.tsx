import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "@/root.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <>
            <main className="flex flex-col w-full h-screen overflow-auto bg-gray-50 overscroll-none touch-none">
                <QueryClientProvider client={queryClient}>
                    <Outlet />
                </QueryClientProvider>
            </main>
            <TanStackRouterDevtools />
        </>
    ),
    notFoundComponent: () => {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="px-4 text-center">
                    <h1 className="mb-2 text-4xl font-medium text-muted-foreground">
                        404
                    </h1>
                    <p className="mb-6 text-foreground">
                        This link doesn't exist
                    </p>
                    <Link
                        to="/"
                        className="text-sm text-primary hover:underline"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        );
    },
});
