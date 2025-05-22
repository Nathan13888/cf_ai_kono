import { authClient, logout } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/logout')({
    loader: async () => logout(),
})
