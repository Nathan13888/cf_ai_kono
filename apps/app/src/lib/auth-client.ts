//! For Better-Auth

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // TODO: Inject from environment variables (different between dev and prod)
  baseURL: "http://localhost:8787",
  basePath: "/auth",
});

export async function isAuthenticated(): Promise<boolean> {
  return authClient.getSession().then((session) => {
    return !!session.data;
  })
}
