//! For Better-Auth

import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // TODO: Inject from environment variables (different between dev and prod)
  baseURL: "http://localhost:8787/auth",
});

// Usage
// export const { signIn, signUp, useSession } = createAuthClient()

// TODO: Use the authclient to login and stuff in the app
