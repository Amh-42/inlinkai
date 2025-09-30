#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up the essential MySQL database schema for InlinkAI
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Starting database setup...');
    
    // Get database connection string
    const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or MYSQL_URL environment variable is required');
    }
    
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection(connectionString);
    
    console.log('✅ Connected to database');
    
    // Read the essential schema file
    const schemaPath = path.join(__dirname, '..', 'database-schema-essential.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    console.log('📖 Reading schema file...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.trim().length === 0) {
        continue;
      }
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await connection.execute(statement);
      } catch (error) {
        // Some statements might fail (like DROP TABLE IF NOT EXISTS), that's okay
        if (error.code === 'ER_BAD_TABLE_ERROR' || 
            error.code === 'ER_UNKNOWN_TABLE' ||
            error.code === 'ER_EVENT_ALREADY_EXISTS') {
          console.log(`⚠️  Statement ${i + 1} skipped (expected): ${error.message}`);
          continue;
        }
        
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
        throw error;
      }
    }
    
    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('user', 'session', 'account', 'verification', 'password_reset_tokens')
      ORDER BY TABLE_NAME
    `);
    
    console.log('📊 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`);
    });
    
    // Check indexes
    const [indexes] = await connection.execute(`
      SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('user', 'session', 'account')
      AND INDEX_NAME != 'PRIMARY'
      ORDER BY TABLE_NAME, INDEX_NAME
    `);
    
    console.log('🔗 Created indexes:');
    const indexGroups = {};
    indexes.forEach(idx => {
      if (!indexGroups[idx.TABLE_NAME]) indexGroups[idx.TABLE_NAME] = [];
      indexGroups[idx.TABLE_NAME].push(`${idx.INDEX_NAME}(${idx.COLUMN_NAME})`);
    });
    
    Object.entries(indexGroups).forEach(([table, idxList]) => {
      console.log(`  - ${table}: ${idxList.join(', ')}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Make sure your .env.local has the correct DATABASE_URL');
    console.log('2. Restart your Next.js application');
    console.log('3. Test the onboarding flow');
    console.log('4. Run the complete schema when ready for full features');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();
