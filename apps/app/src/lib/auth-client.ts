//! For Better-Auth

import { ParsedLocation, redirect } from "@tanstack/react-router";
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

/**
 * Check if the user is authenticated. If not, redirect to the login page.
 */
export async function checkAuthenticated(location: ParsedLocation): Promise<void> {
  if (!(await isAuthenticated())) {
    // Not logged in
    redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
      throw: true,
    })
  }
}

/**
 * Logout user and redirect to login page
 */
export async function logout(withToast = false) {
  return authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        if (withToast) {
          // TODO: Add toast
        }
        redirect({
          to: "/login",
          throw: true,
        })
      },
    },
  })
}
