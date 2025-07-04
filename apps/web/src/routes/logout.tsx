import { logout } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
    loader: async () => logout(),
});
