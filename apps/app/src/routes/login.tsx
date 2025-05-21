import { createFileRoute, redirect } from '@tanstack/react-router'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
    component: RouteComponent,
})

// TODO: Style
function RouteComponent() {
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 

    if (isPending) {
        return <div>Loading...</div>
    }
    if (error) {
        console.error("Error fetching session", error);
        return <div>Error fetching session</div>
    }

    // TODO: Move this to loader vv
    // if (currentUserId) {
    //     redirect({
    //         to: "/chat",
    //         throw: true,
    //     });
    // }

    return (
        <div className="flex h-full w-full justify-center items-center">
            <Card className="w-[350px]">
                {/* <CardHeader>
                    <CardTitle>Sign in with Google</CardTitle>
                    <CardDescription>desc...</CardDescription>
                </CardHeader> */}
                <CardContent>
                    {session ? (
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
                    ) : (
                        <Button onClick={async () => {
                            console.log("Clicked sign in");
                            await authClient.signIn.social({
                                provider: "google", // or any other provider id
                            })
                        }}>
                            Sign in to Google
                        </Button>
                    )}
                    {/* <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form> */}
                </CardContent>
                {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
            </Card>
        </div>
    )
}


// const { data, error } = await authClient.signIn.email({
//         /**
//          * The user email
//          */
//         email,
//         /**
//          * The user password
//          */
//         password,
//         /**
//          * A URL to redirect to after the user verifies their email (optional)
//          */
//         callbackURL: "/dashboard",
//         /**
//          * remember the user session after the browser is closed. 
//          * @default true
//          */
//         rememberMe: false
// }, {
//     //callbacks
// })
