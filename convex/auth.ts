import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// User operations
export const createUser = mutation({
  args: {
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("user", {
      ...args,
      emailVerified: args.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .withIndex("by_user_id", (q) => q.eq("id", args.id))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .withIndex("by_user_id", (q) => q.eq("id", args.id))
      .first();
    
    if (!user) return null;
    
    await ctx.db.patch(user._id, {
      ...args.data,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(user._id);
  },
});

// Session operations
export const createSession = mutation({
  args: {
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("session", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(sessionId);
  },
});

export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("session")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const updateSession = mutation({
  args: {
    id: v.string(),
    data: v.object({
      expiresAt: v.optional(v.number()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();
    
    if (!session) return null;
    
    await ctx.db.patch(session._id, {
      ...args.data,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(session._id);
  },
});

export const deleteSession = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();
    
    if (!session) return null;
    
    await ctx.db.delete(session._id);
    return { success: true };
  },
});

// Account operations
export const createAccount = mutation({
  args: {
    id: v.string(),
    accountId: v.optional(v.string()),
    providerId: v.optional(v.string()),
    userId: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    type: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    idToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const accountId = await ctx.db.insert("account", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(accountId);
  },
});

export const getAccountByProvider = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("account")
      .withIndex("by_provider", (q) => 
        q.eq("provider", args.provider).eq("providerAccountId", args.providerAccountId)
      )
      .first();
  },
});

export const updateAccount = mutation({
  args: {
    id: v.string(),
    data: v.object({
      accountId: v.optional(v.string()),
      providerId: v.optional(v.string()),
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      accessTokenExpiresAt: v.optional(v.number()),
      refreshTokenExpiresAt: v.optional(v.number()),
      scope: v.optional(v.string()),
      password: v.optional(v.string()),
      idToken: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("account")
      .withIndex("by_account_id", (q) => q.eq("id", args.id))
      .first();
    
    if (!account) return null;
    
    await ctx.db.patch(account._id, {
      ...args.data,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(account._id);
  },
});

// Verification operations
export const createVerification = mutation({
  args: {
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const verificationId = await ctx.db.insert("verification", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(verificationId);
  },
});

export const getVerificationByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("verification")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();
  },
});

export const deleteVerification = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verification")
      .withIndex("by_verification_id", (q) => q.eq("id", args.id))
      .first();
    
    if (!verification) return null;
    
    await ctx.db.delete(verification._id);
    return { success: true };
  },
});
