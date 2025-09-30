import { NextRequest, NextResponse } from "next/server";
import { createDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing MySQL database connection...');
    
    const pool = createDatabase();
    
    // Test basic connection
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Basic connection test passed:', rows);
    
    // Test user table exists
    const [userTableRows] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'user'
    `);
    console.log('📊 User table check:', userTableRows);
    
    // Test user table columns
    const [columnRows] = await pool.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = 'user'
      ORDER BY ordinal_position
    `);
    console.log('📋 User table columns:', columnRows);
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      userTableExists: (userTableRows as any[]).length > 0,
      columns: columnRows
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
