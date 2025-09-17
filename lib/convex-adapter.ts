import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Create a Better Auth compatible adapter for Convex
export function createConvexAdapter(convex: ConvexHttpClient) {
  return {
    // User operations
    async createUser(data: any) {
      console.log('📝 Creating user in Convex:', data);
      return await convex.mutation(api.auth.createUser, data);
    },

    async getUserByEmail(email: string) {
      console.log('🔍 Finding user by email:', email);
      return await convex.query(api.auth.getUserByEmail, { email });
    },

    async getUserById(id: string) {
      console.log('🔍 Finding user by ID:', id);
      return await convex.query(api.auth.getUserById, { id });
    },

    async updateUser(id: string, data: any) {
      console.log('✏️ Updating user:', id, data);
      return await convex.mutation(api.auth.updateUser, { id, data });
    },

    // Session operations
    async createSession(data: any) {
      console.log('🎫 Creating session in Convex:', data);
      return await convex.mutation(api.auth.createSession, data);
    },

    async getSessionByToken(token: string) {
      console.log('🔍 Finding session by token:', token);
      return await convex.query(api.auth.getSessionByToken, { token });
    },

    async updateSession(id: string, data: any) {
      console.log('✏️ Updating session:', id, data);
      return await convex.mutation(api.auth.updateSession, { id, data });
    },

    async deleteSession(id: string) {
      console.log('🗑️ Deleting session:', id);
      return await convex.mutation(api.auth.deleteSession, { id });
    },

    // Account operations
    async createAccount(data: any) {
      console.log('🔗 Creating account in Convex:', data);
      return await convex.mutation(api.auth.createAccount, data);
    },

    async getAccountByProvider(provider: string, providerAccountId: string) {
      console.log('🔍 Finding account by provider:', provider, providerAccountId);
      return await convex.query(api.auth.getAccountByProvider, { 
        provider, 
        providerAccountId 
      });
    },

    async updateAccount(id: string, data: any) {
      console.log('✏️ Updating account:', id, data);
      return await convex.mutation(api.auth.updateAccount, { id, data });
    },

    // Verification operations
    async createVerification(data: any) {
      console.log('✅ Creating verification in Convex:', data);
      return await convex.mutation(api.auth.createVerification, data);
    },

    async getVerificationByIdentifier(identifier: string) {
      console.log('🔍 Finding verification by identifier:', identifier);
      return await convex.query(api.auth.getVerificationByIdentifier, { identifier });
    },

    async deleteVerification(id: string) {
      console.log('🗑️ Deleting verification:', id);
      return await convex.mutation(api.auth.deleteVerification, { id });
    },
  };
}

// This adapter makes Convex work seamlessly with Better Auth
// All database operations go through Convex's real-time database