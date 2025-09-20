import { Pool } from "pg";

export function createDatabase() {
  console.log('🔍 DATABASE DEBUGGING - Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
  
  // Check if PostgreSQL is configured
  let pgConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  // Remove quotes if they exist (common issue with environment variables)
  if (pgConnectionString) {
    pgConnectionString = pgConnectionString.replace(/^['"]|['"]$/g, '');
    console.log('🧹 Cleaned connection string:', pgConnectionString.substring(0, 50) + '...');
  }
  
  if (!pgConnectionString) {
    console.error('❌ PostgreSQL not configured!');
    console.error('📋 Add DATABASE_URL to your environment variables');
    console.error('💡 Format: postgresql://user:password@host:port/database');
    console.error('🔍 Available env vars:', Object.keys(process.env).filter(key => key.includes('DATA')));
    throw new Error('DATABASE_URL is required');
  }

  console.log('🐘 Using PostgreSQL database (Convex temporarily disabled due to webpack issues)');
  console.log('🔍 Final connection string length:', pgConnectionString.length);
  console.log('🔍 Final connection string prefix:', pgConnectionString.substring(0, 50) + '...');
  
  // Parse connection string to debug
  try {
    const url = new URL(pgConnectionString);
    console.log('🌐 Database host:', url.hostname);
    console.log('🔌 Database port:', url.port || '5432');
    console.log('📊 Database name:', url.pathname.slice(1));
    console.log('🔐 Has username:', !!url.username);
    console.log('🔑 Has password:', !!url.password);
    console.log('🔒 Search params:', url.searchParams.toString());
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error);
    console.error('❌ Raw connection string:', pgConnectionString);
    throw new Error('Invalid DATABASE_URL format');
  }
  
  // Create PostgreSQL connection pool with proper SSL config for Neon
  const pool = new Pool({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false },
    max: 5, // Smaller pool for serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  // Enhanced connection logging and error handling
  pool.on('connect', () => {
    console.log('✅ Successfully connected to PostgreSQL database');
  });

  pool.on('error', (err, client) => {
    console.error('❌ PostgreSQL pool error:', err);
    console.error('❌ Error code:', (err as any).code);
    console.error('❌ Error hostname:', (err as any).hostname);
    console.error('❌ Error syscall:', (err as any).syscall);
    console.error('❌ Error message:', err.message);
  });

  console.log('🎯 Pool created successfully, returning pool instance');
  return pool;
}

// PostgreSQL tables will be created using Better Auth CLI migrations
// No need for manual table creation since we'll use npx @better-auth/cli migrate
