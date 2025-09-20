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

console.log('🔍 Auth client initializing with baseURL:', getBaseURL());

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: 'include', // Ensure cookies are included in requests
  },
});

// Add debugging to the useSession hook
const originalUseSession = authClient.useSession;
authClient.useSession = function(...args) {
  const result = originalUseSession.apply(this, args);
  
  console.log('🔍 useSession called:', {
    isPending: result.isPending,
    hasData: !!result.data,
    hasUser: !!result.data?.user,
    userId: result.data?.user?.id,
    userEmail: result.data?.user?.email,
    timestamp: new Date().toISOString(),
    baseURL: getBaseURL()
  });
  
  return result;
};

export const { signIn, signUp, signOut, useSession } = authClient;
