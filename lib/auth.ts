import { betterAuth } from "better-auth";
import { createDatabase } from "./database";
import { authLogger } from "./auth-logger";

// Validate and log environment variables
authLogger.configValidation('BETTER_AUTH_SECRET', !!process.env.BETTER_AUTH_SECRET);
authLogger.configValidation('BETTER_AUTH_URL', !!process.env.BETTER_AUTH_URL);

authLogger.info('CONFIG', 'Email/password authentication enabled', { 
  emailAndPasswordEnabled: true
});

// Build trusted origins list
const getTrustedOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "https://localhost:3000",
  ];
  
  // Add environment URL if provided
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
    authLogger.info('CONFIG', 'Added BETTER_AUTH_URL to trusted origins', { url: process.env.BETTER_AUTH_URL });
  }
  
  // In development, allow common ngrok domains
  if (process.env.NODE_ENV === "development") {
    // Add specific ngrok domain if provided via environment variable
    if (process.env.NGROK_URL) {
      origins.push(process.env.NGROK_URL);
      authLogger.info('CONFIG', 'Added NGROK_URL to trusted origins', { url: process.env.NGROK_URL });
    }
    
    // Add common development URLs
    origins.push(
      "https://*.ngrok.io",
      "https://*.ngrok-free.app", 
      "https://*.ngrok.app",
      "https://*.loca.lt",
      "https://*.tunnelto.dev"
    );
    authLogger.info('CONFIG', 'Added development tunneling domains to trusted origins');
  }
  
  authLogger.info('CONFIG', 'Trusted origins configured', { 
    origins: origins,
    count: origins.length,
    environment: process.env.NODE_ENV
  });
  
  return origins;
};


// Initialize database with logging
let database;
try {
  database = createDatabase();
  authLogger.databaseConnection(true);
} catch (error) {
  authLogger.databaseConnection(false, error);
  throw error;
}

authLogger.info('CONFIG', 'Better Auth configuration starting', {
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPasswordEnabled: true,
  socialProvidersCount: 0,
  environment: process.env.NODE_ENV
});

export const auth = betterAuth({
  database,
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  trustedOrigins: getTrustedOrigins(),
  // Add comprehensive logging to callbacks
  callbacks: {
    async signIn({ user, account, request }: { user: any; account: any; request?: Request }) {
      try {
        authLogger.info('AUTH', 'Better Auth signIn callback executed', {
          userId: user.id,
          userEmail: user.email,
          provider: account?.provider || 'email',
          accountId: account?.id
        });
        
        return true; // Allow sign in
      } catch (error) {
        authLogger.error('AUTH', 'Error in signIn callback', error, {
          userId: user?.id,
          provider: account?.provider || 'email'
        });
        throw error;
      }
    },
    async redirect({ url, baseURL, request }: { url: string; baseURL: string; request?: Request }) {
      try {
        const redirectUrl = `${baseURL}/login`;
        
        authLogger.info('AUTH', 'Better Auth redirect callback executed', {
          originalUrl: url,
          baseURL,
          redirectUrl,
          userAgent: request?.headers.get('user-agent')
        });
        
        return redirectUrl;
      } catch (error) {
        authLogger.error('AUTH', 'Error in redirect callback', error, {
          url,
          baseURL
        });
        throw error;
      }
    },
  },
  // Add error handling
  onError: (error: any, request?: Request) => {
    authLogger.error('AUTH', 'Better Auth error occurred', error, {
      endpoint: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('user-agent'),
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip')
    });
  }
});

authLogger.info('CONFIG', 'Better Auth initialized successfully');
