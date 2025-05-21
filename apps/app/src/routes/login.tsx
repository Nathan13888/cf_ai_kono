import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  loader: async () => {
    const session = await authClient.getSession();
    if (session) {
      redirect({
        to: "/chat",
        throw: true,
      });
    }
  },
  component: RouteComponent,
});

// TODO: Style
function RouteComponent() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card className="w-[350px]">
        {/* <CardHeader>
                    <CardTitle>Sign in with Google</CardTitle>
                    <CardDescription>desc...</CardDescription>
                </CardHeader> */}
        <CardContent>
          <Button
            onClick={async () => {
              console.log("Clicked sign in");
              await authClient.signIn.social({
                provider: "google", // or any other provider id
              });
            }}
          >
            Sign in to Google
          </Button>
          {/* <form>
          <div className="grid items-center w-full gap-4">
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
  );
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
