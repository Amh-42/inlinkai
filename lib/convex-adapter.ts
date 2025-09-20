import { ConvexHttpClient } from "convex/browser";

// Dynamically import the API to avoid webpack issues
let api: any = null;

async function getApi() {
  if (!api) {
    api = await import("../convex/_generated/api");
  }
  return api.api;
}

// Create a Better Auth compatible adapter for Convex
export function createConvexAdapter(convex: ConvexHttpClient) {
  return {
    // User operations
    async createUser(data: any) {
      console.log('📝 Creating user in Convex:', data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.createUser, data);
    },

    async getUserByEmail(email: string) {
      console.log('🔍 Finding user by email:', email);
      const apiRef = await getApi();
      return await convex.query(apiRef.auth.getUserByEmail, { email });
    },

    async getUserById(id: string) {
      console.log('🔍 Finding user by ID:', id);
      const apiRef = await getApi();
      return await convex.query(apiRef.auth.getUserById, { id });
    },

    async updateUser(id: string, data: any) {
      console.log('✏️ Updating user:', id, data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.updateUser, { id, data });
    },

    // Session operations
    async createSession(data: any) {
      console.log('🎫 Creating session in Convex:', data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.createSession, data);
    },

    async getSessionByToken(token: string) {
      console.log('🔍 Finding session by token:', token);
      const apiRef = await getApi();
      return await convex.query(apiRef.auth.getSessionByToken, { token });
    },

    async updateSession(id: string, data: any) {
      console.log('✏️ Updating session:', id, data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.updateSession, { id, data });
    },

    async deleteSession(id: string) {
      console.log('🗑️ Deleting session:', id);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.deleteSession, { id });
    },

    // Account operations
    async createAccount(data: any) {
      console.log('🔗 Creating account in Convex:', data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.createAccount, data);
    },

    async getAccountByProvider(provider: string, providerAccountId: string) {
      console.log('🔍 Finding account by provider:', provider, providerAccountId);
      const apiRef = await getApi();
      return await convex.query(apiRef.auth.getAccountByProvider, { 
        provider, 
        providerAccountId 
      });
    },

    async updateAccount(id: string, data: any) {
      console.log('✏️ Updating account:', id, data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.updateAccount, { id, data });
    },

    // Verification operations
    async createVerification(data: any) {
      console.log('✅ Creating verification in Convex:', data);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.createVerification, data);
    },

    async getVerificationByIdentifier(identifier: string) {
      console.log('🔍 Finding verification by identifier:', identifier);
      const apiRef = await getApi();
      return await convex.query(apiRef.auth.getVerificationByIdentifier, { identifier });
    },

    async deleteVerification(id: string) {
      console.log('🗑️ Deleting verification:', id);
      const apiRef = await getApi();
      return await convex.mutation(apiRef.auth.deleteVerification, { id });
    },
  };
}

// This adapter makes Convex work seamlessly with Better Auth
// All database operations go through Convex's real-time database
