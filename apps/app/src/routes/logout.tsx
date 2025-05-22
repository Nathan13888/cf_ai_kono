import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/logout')({
    loader: async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // TODO: Add toast
                    redirect({
                        to: "/login",
                        throw: true,
                    })
                },
            },
        });
    }
})
