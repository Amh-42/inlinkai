import { createAuthClient } from "better-auth/react";

// Automatically detect the correct base URL based on current location
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In browser, use the current origin
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return process.env.BETTER_AUTH_URL || "https://inlinkai.vercel.app";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
