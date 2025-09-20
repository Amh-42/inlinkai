import { betterAuth } from "better-auth";
import { createDatabase } from "./database";

const socialProvidersConfig = {
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID as string,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    scope: ["profile", "email", "openid"], // Explicit scopes as per LinkedIn docs
  },
};

// Build trusted origins list
const getTrustedOrigins = () => {
  const origins = [
    "https://inlinkai.vercel.app",
    "http://localhost:3000",
    "https://localhost:3000",
  ];
  
  // Add environment URL if provided
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
  }
  
  // In development, allow common ngrok domains
  if (process.env.NODE_ENV === "development") {
    // Add specific ngrok domain if provided via environment variable
    if (process.env.NGROK_URL) {
      origins.push(process.env.NGROK_URL);
    }
    
    // Add common development URLs
    origins.push(
      "https://*.ngrok.io",
      "https://*.ngrok-free.app", 
      "https://*.ngrok.app",
      "https://*.loca.lt",
      "https://*.tunnelto.dev"
    );
  }
  
  return origins;
};


export const auth = betterAuth({
  database: createDatabase(), // PostgreSQL (Convex temporarily disabled due to webpack issues)
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: false, // Disabled - LinkedIn only
  },
  socialProviders: socialProvidersConfig,
  trustedOrigins: getTrustedOrigins(),
  // Add proper redirect handling
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      console.log('🎯 Better Auth signIn callback:', { userId: user.id, provider: account?.provider });
      return true; // Allow sign in
    },
    async redirect({ url, baseURL }: { url: string; baseURL: string }) {
      console.log('🔄 Better Auth redirect callback:', { url, baseURL });
      // Always redirect to login page after OAuth, let the frontend handle the rest
      return `${baseURL}/login`;
    },
  },
});
