# 🚀 Convex Database Setup Guide

## 🎯 Why Convex is Perfect for Your Project

- ✅ **Serverless-first** - Built for Vercel deployments
- ✅ **Real-time** - Live updates without polling
- ✅ **Type-safe** - Full TypeScript integration
- ✅ **Zero config** - No connection strings or migrations
- ✅ **Generous free tier** - Perfect for development

## 📋 Quick Setup Steps

### 1. 🔑 Add Environment Variables to Vercel

From your Convex deployment info:
```bash
NEXT_PUBLIC_CONVEX_URL="https://abundant-mule-775.convex.cloud"
CONVEX_DEPLOY_KEY="dev:abundant-mule-775|eyJ2MiI6IjZiMGNjYzI4NTI3NTQxOWY4MDIwNzdmMGQzZDNkYjY5In0="
```

### 2. 🏗️ Initialize Convex in Your Project

```bash
# Initialize Convex (will create convex/ folder)
npx convex dev

# This will:
# - Create convex/_generated/ folder with TypeScript types
# - Set up the schema and functions
# - Connect to your deployment
```

### 3. 📊 Create the Database Schema

Create `convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables
  users: defineTable({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  // Your app tables
  onboarding: defineTable({
    userId: v.string(),
    role: v.optional(v.string()),
    discovery: v.optional(v.string()),
    termsAccepted: v.optional(v.boolean()),
    marketingConsent: v.optional(v.boolean()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

### 4. 🔧 Create Database Functions

Create `convex/auth.ts`:
```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { id: v.string(), email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
```

### 5. 🔗 Connect to Your App

Create `lib/convex-client.ts`:
```typescript
import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

## 🚀 Deployment to Vercel

1. **Add Environment Variables**: 
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOY_KEY`

2. **Deploy**: 
   - Push to GitHub
   - Vercel will automatically deploy with Convex integration

3. **Verify**: 
   - Check Vercel logs for successful Convex connection
   - Test authentication and data persistence

## 🔧 Development Workflow

```bash
# Start Convex dev server (in one terminal)
npx convex dev

# Start Next.js dev server (in another terminal)
npm run dev
```

## 🎯 Benefits Over SQLite

| Feature | SQLite (Current) | Convex |
|---------|------------------|---------|
| **Vercel Support** | ❌ Doesn't work | ✅ Perfect fit |
| **Real-time** | ❌ No | ✅ Built-in |
| **Scaling** | ❌ File-based | ✅ Auto-scaling |
| **Backups** | ❌ Manual | ✅ Automatic |
| **Type Safety** | ⚠️ Limited | ✅ Full TS |
| **Setup Complexity** | 🟡 Medium | 🟢 Minimal |

## 🐛 Troubleshooting

### Authentication not working:
- ✅ Check `NEXT_PUBLIC_CONVEX_URL` is set in Vercel
- ✅ Verify deploy key is correct
- ✅ Run `npx convex dev` locally first

### Data not persisting:
- ✅ Ensure Convex functions are deployed
- ✅ Check Convex dashboard for function logs
- ✅ Verify schema matches your data structure

### Build errors:
- ✅ Run `npx convex dev` to generate types
- ✅ Make sure `convex/_generated/` exists
- ✅ Check all imports are correct

## 🎉 Next Steps

After setting up Convex:
1. ✅ Test authentication on Vercel
2. ✅ Verify data persistence 
3. ✅ Set up real-time features (optional)
4. ✅ Monitor usage in Convex dashboard

Your app will now have a production-ready database that scales automatically! 🚀
