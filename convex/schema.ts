import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth required tables
  user: defineTable({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["id"])
    .index("by_email", ["email"]),

  session: defineTable({
    id: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session_id", ["id"])
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  account: defineTable({
    id: v.string(),
    userId: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    type: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()), // Hashed password for email/password
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account_id", ["id"])
    .index("by_user", ["userId"])
    .index("by_provider", ["provider", "providerAccountId"]),

  verification: defineTable({
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_verification_id", ["id"])
    .index("by_identifier", ["identifier"])
    .index("by_value", ["value"]),

  // Your app-specific tables
  onboarding: defineTable({
    userId: v.string(),
    role: v.optional(v.string()),
    discovery: v.optional(v.string()),
    termsAccepted: v.optional(v.boolean()),
    marketingConsent: v.optional(v.boolean()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  emailSent: defineTable({
    userId: v.string(),
    emailType: v.string(), // 'welcome', 'newsletter', 'announcement', etc.
    sentAt: v.number(),
    template: v.string(),
    status: v.string(), // 'sent', 'failed', 'pending'
    emailId: v.optional(v.string()), // Resend email ID
  })
    .index("by_user", ["userId"])
    .index("by_type", ["emailType"]),

  passwordResetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"]),
});
