import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error("Error fetching session", error);
    return <div>Error fetching session</div>;
  }

  if (session === undefined || session === null) {
    redirect({
      to: "/login",
      throw: true,
    });
  }

  // // To list user accounts you can use client.user.listAccounts method. Which will return all accounts associated with a user.
  // const accounts = await authClient.listAccounts();

  // TODO: Implement editing profile info
  // Example:
  // await authClient.updateUser({
  //     image: "https://example.com/image.jpg",
  //     name: "John Doe",
  // })
  // TODO: Style
  // User is logged in
  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <Button
        onClick={async () => {
          console.log("Clicked sign out");
          await authClient.signOut();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

// TODO: look at ChatGPT, Claude, t3.chat profile/setting pages for inspiration
// TODO: Support bulk deleting chats.
// TODO: Consider allow user to delete their account outright (might be dangerous and is non-recoverable). To cheat, cold just have a extra column in user table: https://www.better-auth.com/docs/concepts/users-accounts#delete-user
