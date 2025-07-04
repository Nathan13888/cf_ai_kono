import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

// Render the app
const root_dashboard = document.getElementById("root");
if (root_dashboard) {
    ReactDOM.createRoot(root_dashboard as HTMLElement).render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>,
    );
}
