import { betterAuth } from "better-auth";
import { createDatabase } from "./database";

const socialProvidersConfig = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  }),
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
  database: createDatabase(),
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: socialProvidersConfig,
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },
});
