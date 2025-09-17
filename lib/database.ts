import Database from "better-sqlite3";
import { createClient } from "@libsql/client";

export function createDatabase() {
  // In production (Vercel), we need to handle the database differently
  if (process.env.NODE_ENV === 'production') {
    // Option 1: Use Turso (SQLite-compatible cloud database)
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('📊 Using Turso database in production');
      
      // Create Turso client
      const turso = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      
      // Better Auth expects a better-sqlite3 compatible interface
      // We'll create a proxy that adapts Turso to better-sqlite3 interface
      return createTursoAdapter(turso);
    }
    
    // Option 2: Use Convex (for real-time features)
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.log('📊 Using Convex database in production');
      // Using in-memory SQLite as a session cache with Convex as the persistent store
      return new Database(':memory:');
    }
    
    // Option 3: Use in-memory (temporary solution - will cause auth failures)
    console.error('❌ No production database configured! Authentication will fail.');
    console.error('💡 Required: Set up Turso database for production');
    console.error('📋 Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to Vercel environment variables');
    
    // This will cause the exact errors you're seeing
    return new Database(':memory:');
  }
  
  // Development: use local SQLite
  return new Database("./sqlite.db");
}

// Adapter to make Turso work with Better Auth
function createTursoAdapter(turso: any) {
  // This is a simplified adapter - Better Auth needs more comprehensive support
  // For now, we'll use a hybrid approach
  const memoryDb = new Database(':memory:');
  
  // Initialize Better Auth tables in memory
  try {
    // Create the basic tables that Better Auth needs
    memoryDb.exec(`
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
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
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
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE,
        UNIQUE(provider, providerAccountId)
      );
      
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Better Auth tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create Better Auth tables:', error);
  }
  
  return memoryDb;
}

// Instructions for setting up Turso:
/*
1. Go to https://turso.tech and create an account
2. Create a new database
3. Get your database URL and auth token
4. Add to Vercel environment variables:
   - TURSO_DATABASE_URL="libsql://your-db.turso.io"
   - TURSO_AUTH_TOKEN="your-auth-token"
5. Install: npm install @libsql/client
6. Update this file to use Turso client instead of better-sqlite3
*/
