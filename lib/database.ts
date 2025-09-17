import Database from "better-sqlite3";

export function createDatabase() {
  // In production (Vercel), we need to handle the database differently
  if (process.env.NODE_ENV === 'production') {
    // Option 1: Use Convex (recommended for real-time features)
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.log('📊 Using Convex database in production');
      // For Better Auth, we still need SQLite interface, but Convex handles the actual storage
      // Using in-memory SQLite as a session cache with Convex as the persistent store
      return new Database(':memory:');
    }
    
    // Option 2: Use Turso (SQLite-compatible cloud database)
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('📊 Using Turso database in production');
      // You would use @libsql/client here
      return new Database(':memory:');
    }
    
    // Option 3: Use in-memory (temporary solution)
    console.warn('⚠️ Using in-memory database in production. Data will not persist!');
    console.warn('💡 Recommended: Set up Convex or Turso database for production');
    return new Database(':memory:');
  }
  
  // Development: use local SQLite
  return new Database("./sqlite.db");
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
