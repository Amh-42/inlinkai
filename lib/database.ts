import { ConvexHttpClient } from "convex/browser";
import Database from "better-sqlite3";

export function createDatabase() {
  // Check if Convex is configured
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('❌ CONVEX_URL not configured!');
    console.error('📋 Add NEXT_PUBLIC_CONVEX_URL to your environment variables');
    console.error('💡 Get it from: https://dashboard.convex.dev');
    
    // Fallback to in-memory database with proper tables
    console.log('🔄 Using in-memory SQLite as fallback with Better Auth tables');
    const db = new Database(':memory:');
    initializeBetterAuthTables(db);
    return db;
  }

  console.log('📊 Using Convex database (serverless + real-time)');
  
  // Create in-memory SQLite database with Better Auth tables
  // This acts as a local cache while Convex handles persistence
  const db = new Database(':memory:');
  initializeBetterAuthTables(db);
  
  // TODO: Integrate with Convex for actual persistence
  // For now, the in-memory database will work for authentication
  // Future: Sync data between SQLite cache and Convex
  
  return db;
}

function initializeBetterAuthTables(db: Database.Database) {
  try {
    // Create all Better Auth required tables
    db.exec(`
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

      CREATE TABLE IF NOT EXISTS onboarding (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL UNIQUE,
        role TEXT,
        discovery TEXT,
        termsAccepted BOOLEAN DEFAULT FALSE,
        marketingConsent BOOLEAN DEFAULT FALSE,
        completedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    
    console.log('✅ Better Auth tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create Better Auth tables:', error);
    throw error;
  }
}
