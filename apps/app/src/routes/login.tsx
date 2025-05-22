import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient, isAuthenticated } from "@/lib/auth-client";
import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { FALLBACK_ROUTE } from "@/constant";

const loginSearchSchema = Type.Object({
  redirect: Type.Optional(Type.String()),
});
type LoginSearch = Static<typeof loginSearchSchema>;


export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    Value.Parse(loginSearchSchema, search),
  beforeLoad: async ({ search }) => {
    if (await isAuthenticated()) {
      // Already logged in
      console.log("Already logged in"); // TODO: Remove
      // TODO: Add toast
      redirect({
        to: search.redirect || FALLBACK_ROUTE,
        throw: true,
      });
    } else {
      console.log("Not logged in"); // TODO: Remove
    }
  }, // TODO: add back
  component: RouteComponent,
});

// TODO: Style
function RouteComponent() {
  const { redirect: redirectParam } = Route.useSearch();

  const handleSignIn = async () => {
    console.log("Clicked sign in");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `http://localhost:1420/${redirectParam || FALLBACK_ROUTE}`, // TODO: Use env var and join path separators / properly
      // /**
      //  * A URL to redirect if an error occurs during the sign in process
      //  */
      // errorCallbackURL: "http://localhost:1420/error",
      /**
       * A URL to redirect if the user is newly registered
       */
      newUserCallbackURL: "http://localhost:1420/welcome",
    }, {
      // onRequest: (ctx) => {
      //   //show loading
      // },
      // onSuccess: (ctx) => {
      //   //redirect to the dashboard or sign in page
      // },
      onError: (ctx) => {
        // TODO: Change to a toast
        alert(ctx.error.message);
      },
    });
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card className="w-[350px]">
        {/* <CardHeader>
                    <CardTitle>Sign in with Google</CardTitle>
                    <CardDescription>desc...</CardDescription>
                </CardHeader> */}
        <CardContent>
          <Button
            onClick={handleSignIn}
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
