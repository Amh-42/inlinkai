import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // This is a debug endpoint to check user account types and password hashes
    // REMOVE THIS IN PRODUCTION!
    
    const pool = auth.options.database as any;
    
    // Get all users and their account information
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        a.provider,
        a."providerId",
        LENGTH(a.password) as password_length,
        a.password IS NOT NULL as has_password,
        SUBSTRING(a.password, 1, 10) as password_prefix
      FROM "user" u
      LEFT JOIN account a ON a."userId" = u.id
      ORDER BY u.email
    `);
    
    const users = result.rows as any[];
    
    // Group by account type
    const analysis = {
      total_users: users.length,
      oauth_only: users.filter((u: any) => u.provider !== 'credential').length,
      email_password: users.filter((u: any) => u.provider === 'credential').length,
      no_account: users.filter((u: any) => !u.provider).length,
      password_analysis: {
        with_password: users.filter((u: any) => u.has_password).length,
        without_password: users.filter((u: any) => !u.has_password).length,
        password_lengths: Array.from(new Set(users.filter((u: any) => u.has_password).map((u: any) => u.password_length))),
        password_prefixes: Array.from(new Set(users.filter((u: any) => u.has_password).map((u: any) => u.password_prefix)))
      }
    };
    
    return NextResponse.json({
      analysis,
      users: users.map((u: any) => ({
        email: u.email,
        provider: u.provider || 'none',
        providerId: u.providerId || 'none',
        hasPassword: u.has_password,
        passwordLength: u.password_length,
        passwordPrefix: u.password_prefix
      }))
    });
    
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
