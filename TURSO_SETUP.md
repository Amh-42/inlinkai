# 🚀 Quick Turso Database Setup (Fix Authentication Issues)

## 🆘 **URGENT: Your authentication is failing because SQLite doesn't work on Vercel!**

The errors you're seeing:
- `SqliteError: unable to open database file`
- `SqliteError: no such table: user`

These happen because Vercel's serverless environment can't create or persist SQLite files.

## ⚡ **5-Minute Fix with Turso:**

### 1. 🏗️ Create Turso Database
```bash
# Sign up at https://turso.tech (free)
# Or use CLI (faster):
npm install -g @turso/cli
turso auth signup
turso db create inlinkai-auth
```

### 2. 🔑 Get Database Credentials
```bash
# Get database URL
turso db show inlinkai-auth

# Create auth token
turso db tokens create inlinkai-auth
```

You'll get:
- **Database URL**: `libsql://inlinkai-auth-[username].turso.io`
- **Auth Token**: `eyJ...` (long string)

### 3. 📋 Add to Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
TURSO_DATABASE_URL=libsql://inlinkai-auth-[username].turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSJ9...
```

### 4. 🔄 Initialize Database Schema
```bash
# Run this to create the tables
turso db shell inlinkai-auth

# In the shell, run:
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  emailVerified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  type TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt DATETIME,
  refreshTokenExpiresAt DATETIME,
  scope TEXT,
  password TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exit with Ctrl+D
```

### 5. 🚀 Deploy to Vercel
- Push your code to GitHub
- Vercel will automatically redeploy
- **Authentication will now work!**

## ✅ **Expected Results:**
- ✅ GitHub sign-in will work
- ✅ Email/password sign-up will work  
- ✅ Password reset will work
- ✅ Sessions will persist
- ✅ No more database errors

## 🔧 **Alternative: Quick Web Setup**

1. Go to [turso.tech](https://turso.tech)
2. Sign up with GitHub
3. Create database: `inlinkai-auth`
4. Copy the connection details
5. Add to Vercel environment variables
6. Deploy

## 🎯 **Why This Fixes Everything:**

| Issue | SQLite (Current) | Turso (Solution) |
|-------|------------------|------------------|
| File creation | ❌ Can't create files | ✅ Cloud database |
| Table persistence | ❌ Lost on restart | ✅ Always available |
| Vercel compatibility | ❌ Incompatible | ✅ Built for serverless |
| Setup complexity | 🟡 Medium | 🟢 5 minutes |

Your authentication will work **immediately** after adding the Turso environment variables! 🎉
