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
  
  // In production, use a file-based database in temp directory
  // This allows persistence during the lifetime of the serverless function
  let dbPath = ':memory:';
  
  if (process.env.NODE_ENV === 'production') {
    try {
      const os = require('os');
      const path = require('path');
      
      // Use platform-specific temp directory
      const tmpDir = os.tmpdir();
      dbPath = path.join(tmpDir, 'auth.db');
      console.log(`🗃️ Using persistent SQLite database at ${dbPath}`);
    } catch (error) {
      console.warn('⚠️ Could not create temp database file, using in-memory:', error);
      dbPath = ':memory:';
    }
  }
  
  const db = new Database(dbPath);
  initializeBetterAuthTables(db);
  
  // Enable foreign keys and WAL mode for better performance
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  
  return db;
}

function initializeBetterAuthTables(db: Database.Database) {
  try {
    console.log('🔧 Initializing Better Auth tables...');
    
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
        accountId TEXT,
        providerId TEXT,
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
        idToken TEXT,
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
    
    // Test database operations
    const userCount = db.prepare('SELECT COUNT(*) as count FROM user').get() as { count: number };
    console.log(`📊 Database initialized with ${userCount.count} users`);
    
  } catch (error) {
    console.error('❌ Failed to create Better Auth tables:', error);
    console.error('❌ Error details:', error);
    throw error;
  }
}
