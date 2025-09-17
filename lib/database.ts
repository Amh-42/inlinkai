import { ConvexHttpClient } from "convex/browser";
import { Pool } from "pg";

export function createDatabase() {
  // Check if PostgreSQL is configured
  const pgConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!pgConnectionString) {
    console.error('❌ PostgreSQL not configured!');
    console.error('📋 Add DATABASE_URL to your environment variables');
    console.error('💡 Format: postgresql://user:password@host:port/database');
    throw new Error('DATABASE_URL is required');
  }

  console.log('🐘 Using PostgreSQL database');
  
  // Create PostgreSQL connection pool with proper SSL config for Neon
  const pool = new Pool({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false },
    max: 5, // Smaller pool for serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  // Test the connection
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err);
  });

  return pool;
}

// PostgreSQL tables will be created using Better Auth CLI migrations
// No need for manual table creation since we'll use npx @better-auth/cli migrate
