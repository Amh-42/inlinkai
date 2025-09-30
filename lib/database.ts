import mysql from "mysql2/promise";

export function createDatabase() {
  console.log('🔍 DATABASE DEBUGGING - Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);
  
  // Check if MySQL is configured
  let mysqlConnectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
  
  // Remove quotes if they exist (common issue with environment variables)
  if (mysqlConnectionString) {
    mysqlConnectionString = mysqlConnectionString.replace(/^['"]|['"]$/g, '');
    console.log('🧹 Cleaned connection string:', mysqlConnectionString.substring(0, 50) + '...');
  }
  
  if (!mysqlConnectionString) {
    console.error('❌ MySQL not configured!');
    console.error('📋 Add DATABASE_URL to your environment variables');
    console.error('💡 Format: mysql://user:password@host:port/database');
    console.error('🔍 Available env vars:', Object.keys(process.env).filter(key => key.includes('DATA')));
    throw new Error('DATABASE_URL is required');
  }

  console.log('🐬 Using MySQL database');
  console.log('🔍 Final connection string length:', mysqlConnectionString.length);
  console.log('🔍 Final connection string prefix:', mysqlConnectionString.substring(0, 50) + '...');
  
  // Parse connection string to debug
  try {
    const url = new URL(mysqlConnectionString);
    console.log('🌐 Database host:', url.hostname);
    console.log('🔌 Database port:', url.port || '3306');
    console.log('📊 Database name:', url.pathname.slice(1));
    console.log('🔐 Has username:', !!url.username);
    console.log('🔑 Has password:', !!url.password);
    console.log('🔒 Search params:', url.searchParams.toString());
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error);
    console.error('❌ Raw connection string:', mysqlConnectionString);
    throw new Error('Invalid DATABASE_URL format');
  }
  
  // Create MySQL connection pool
  const pool = mysql.createPool(mysqlConnectionString);

  console.log('🎯 Pool created successfully, returning pool instance');
  return pool;
}

// MySQL tables will be created using Better Auth CLI migrations
// No need for manual table creation since we'll use npx @better-auth/cli migrate
