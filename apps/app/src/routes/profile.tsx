import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const {
        data: session,
        isPending,
        error,
        refetch,
    } = authClient.useSession();
    if (isPending) {
        return <div>Loading...</div>
    }
    if (error) {
        console.error("Error fetching session", error);
        return <div>Error fetching session</div>
    }

    if (session === undefined || session === null) {
        redirect({
            to: "/login",
            throw: true,
        });
    }

    // TODO: Style
    // User is logged in
    return (
        <div>
            <h1>Welcome {session.user?.name}</h1>
            <p>{session.user?.email}</p>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <Button onClick={async () => {
                console.log("Clicked sign out");
                await authClient.signOut();
            }}>
                Sign out
            </Button>
        </div>
    )
}
