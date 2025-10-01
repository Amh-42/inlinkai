import { createAuthClient } from "better-auth/react";

// Client-side logging helper
const clientLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [CLIENT-${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console[level](`🔐 ${logEntry}`, data);
  } else {
    console[level](`🔐 ${logEntry}`);
  }
  
  // Store in localStorage for debugging (limit to last 100 entries)
  if (typeof window !== 'undefined') {
    try {
      const logs = JSON.parse(localStorage.getItem('auth-client-logs') || '[]');
      logs.push({ timestamp, level, message, data });
      if (logs.length > 100) logs.shift();
      localStorage.setItem('auth-client-logs', JSON.stringify(logs));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
};

// Automatically detect the correct base URL based on current location
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In browser, use the current origin
    const baseURL = window.location.origin;
    clientLog('info', 'Auth client using browser origin', { baseURL });
    return baseURL;
  }
  // Fallback for server-side rendering
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  clientLog('info', 'Auth client using SSR fallback', { baseURL });
  return baseURL;
};

clientLog('info', 'Creating auth client', { baseURL: getBaseURL() });

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: 'include', // Ensure cookies are included in requests
  },
});

// Add comprehensive debugging to the useSession hook
const originalUseSession = authClient.useSession;
authClient.useSession = function(...args) {
  const result = originalUseSession.apply(this, args);
  
  clientLog('info', 'useSession called', {
    isPending: result.isPending,
    hasData: !!result.data,
    hasUser: !!result.data?.user,
    userId: result.data?.user?.id,
    userEmail: result.data?.user?.email,
    sessionId: result.data?.session?.id,
    expiresAt: result.data?.session?.expiresAt,
    baseURL: getBaseURL()
  });
  
  return result;
};

// Add logging to signIn methods by wrapping them
const originalSignIn = authClient.signIn;

// Create enhanced signIn object with logging
const enhancedSignIn = {
  ...originalSignIn,
  social: async (options: Parameters<typeof originalSignIn.social>[0], fetchOptions?: Parameters<typeof originalSignIn.social>[1]) => {
    clientLog('info', 'Social sign-in attempt started', { 
      provider: options.provider,
      callbackURL: options.callbackURL 
    });
    
    try {
      const result = await originalSignIn.social(options, fetchOptions);
      clientLog('info', 'Social sign-in completed successfully', { 
        provider: options.provider 
      });
      return result;
    } catch (error) {
      clientLog('error', 'Social sign-in failed', { 
        provider: options.provider,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
};

// Replace the signIn object
(authClient as any).signIn = enhancedSignIn;

export const { signIn, signUp, signOut, useSession } = authClient;
