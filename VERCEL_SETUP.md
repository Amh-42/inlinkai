# 🚀 Vercel Deployment Setup Guide

## 📋 Environment Variables to Add in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

### Required Variables:
```bash
BETTER_AUTH_SECRET="your-random-secret-key-32-characters-long"
BETTER_AUTH_URL="https://your-vercel-app.vercel.app"
NODE_ENV="production"
```

### GitHub OAuth:
```bash
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Google OAuth (optional):
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Email Service:
```bash
RESEND_API_KEY="your-resend-api-key"
```

## 🔄 GitHub OAuth App Configuration

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Edit your OAuth app
3. Update these URLs:
   - **Homepage URL**: `https://your-vercel-app.vercel.app`
   - **Authorization callback URL**: `https://your-vercel-app.vercel.app/api/auth/callback/github`

## 🗄️ Database Setup (Choose One Option)

### Option A: Convex (Recommended - Real-time & Serverless)
1. Sign up at [convex.dev](https://convex.dev)
2. Create a new project: `inlinkai_db`
3. Get your deployment URL from dashboard
4. Add environment variable:
   ```bash
   NEXT_PUBLIC_CONVEX_URL="https://abundant-mule-775.convex.cloud"
   CONVEX_DEPLOY_KEY="dev:abundant-mule-775|your-deploy-key"
   ```
5. Run: `npx convex dev` (already installed)

### Option B: Turso (SQLite Compatible)
1. Sign up at [turso.tech](https://turso.tech)
2. Create a new database
3. Add environment variables:
   ```bash
   TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
   TURSO_AUTH_TOKEN="your-auth-token"
   ```
4. Run: `npm install @libsql/client`

### Option C: Planetscale (MySQL)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Add environment variable:
   ```bash
   DATABASE_URL="mysql://username:password@host/database?ssl=true"
   ```

### Option D: Supabase (PostgreSQL)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Add environment variable:
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

## 🔧 Local Development

Create a `.env.local` file (not committed to git):
```bash
BETTER_AUTH_SECRET="development-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
RESEND_API_KEY="your-resend-api-key"
```

## 🚀 Deployment Steps

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## 🐛 Troubleshooting

### Authentication not working:
- ✅ Check environment variables are set
- ✅ Verify OAuth redirect URLs match exactly
- ✅ Ensure `BETTER_AUTH_URL` uses `https://` in production

### Database errors:
- ✅ SQLite doesn't work on Vercel (use cloud database)
- ✅ Check database connection string
- ✅ Verify database is accessible from Vercel

### Emails not sending:
- ✅ Check `RESEND_API_KEY` is set
- ✅ Verify domain is configured in Resend
