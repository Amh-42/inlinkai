import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();
    
    console.log(`🔐 Password reset attempt for: ${email} with token: ${token?.substring(0, 10)}...`);

    if (!token || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Token, email, and password are required' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // TODO: In a production app, you would:
    // 1. Verify the reset token against stored tokens in database
    // 2. Check if the token has expired
    // 3. Ensure the token matches the email
    
    // For now, we'll just update the password directly
    // Note: This is a simplified implementation for demo purposes
    
    const db = auth.options.database as any;
    
    // Check if user exists
    const user = db.prepare(`
      SELECT id, email FROM user WHERE email = ?
    `).get(email);

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid reset link or user not found' 
      }, { status: 400 });
    }

    // Verify the reset token
    console.log(`🔍 Looking for token in database...`);
    const resetTokenRecord = db.prepare(`
      SELECT token, expires_at FROM password_reset_tokens 
      WHERE email = ? AND token = ?
    `).get(email, token);

    if (!resetTokenRecord) {
      console.log(`❌ Token not found for ${email}`);
      return NextResponse.json({ 
        error: 'Invalid reset token. Please request a new password reset.' 
      }, { status: 400 });
    }

    console.log(`✅ Token found, checking expiration...`);
    
    // Check if token has expired
    const expiresAt = new Date(resetTokenRecord.expires_at);
    const now = new Date();
    
    console.log(`Token expires at: ${expiresAt}, Current time: ${now}`);
    
    if (now > expiresAt) {
      console.log(`❌ Token expired`);
      // Clean up expired token
      db.prepare(`
        DELETE FROM password_reset_tokens WHERE email = ? AND token = ?
      `).run(email, token);
      
      return NextResponse.json({ 
        error: 'Reset token has expired. Please request a new password reset.' 
      }, { status: 400 });
    }
    
    console.log(`✅ Token is valid, proceeding with password update...`);

    try {
      // Hash the new password using Better Auth's built-in password handling
      // Note: Better Auth handles password hashing internally
      
      // For now, we'll use a simple approach to update the password
      // In production, you'd want to use Better Auth's password update methods
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update the user's password in the account table (Better Auth structure)
      const updateResult = db.prepare(`
        UPDATE account 
        SET password = ? 
        WHERE userId = (SELECT id FROM user WHERE email = ?) 
        AND providerId = 'credential'
      `).run(hashedPassword, email);

      if (updateResult.changes === 0) {
        return NextResponse.json({ 
          error: 'No credential account found for this email. This user may have signed up with OAuth.' 
        }, { status: 400 });
      }

      // Clean up the used reset token
      db.prepare(`
        DELETE FROM password_reset_tokens WHERE email = ? AND token = ?
      `).run(email, token);

      console.log(`✅ Password reset successfully for user: ${email}`);

      return NextResponse.json({ 
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.' 
      });
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update password. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
