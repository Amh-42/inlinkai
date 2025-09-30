import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { PasswordResetEmail } from "@/components/email-templates/PasswordResetEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists in database
    const db = auth.options.database as any;
    const user = db.prepare(`
      SELECT id, email, name FROM user WHERE email = ?
    `).get(email);

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ 
        message: 'If an account with that email exists, we\'ve sent a password reset link.' 
      });
    }

    // Generate secure reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetUrl = `${process.env.BETTER_AUTH_URL || 'https://inlinkai.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Store reset token in database with expiration (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    try {
      // First, clean up any existing tokens for this user
      db.prepare(`
        DELETE FROM password_reset_tokens WHERE email = ?
      `).run(email);
      
      // Insert new reset token
      db.prepare(`
        INSERT INTO password_reset_tokens (email, token, expires_at, created_at)
        VALUES (?, ?, ?, ?)
      `).run(email, resetToken, expiresAt.toISOString(), new Date().toISOString());
      
      console.log(`🔑 Password reset token generated for ${email} (expires: ${expiresAt.toISOString()})`);
    } catch (dbError: any) {
      // If table doesn't exist, create it
      if (dbError.message.includes('no such table')) {
        console.log('📝 Creating password_reset_tokens table...');
        db.prepare(`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        `).run();
        
        // Now insert the token
        db.prepare(`
          INSERT INTO password_reset_tokens (email, token, expires_at, created_at)
          VALUES (?, ?, ?, ?)
        `).run(email, resetToken, expiresAt.toISOString(), new Date().toISOString());
        
        console.log(`🔑 Password reset token generated for ${email} (expires: ${expiresAt.toISOString()})`);
      } else {
        throw dbError;
      }
    }

    // Create the password reset email template
    const passwordResetEmailTemplate = PasswordResetEmail({
      userName: user.name,
      userEmail: email,
      resetUrl: resetUrl,
    });

    // Send password reset email
    console.log(`📧 Sending password reset email to: ${email}`);
    
    try {
      const { data, error } = await resend.emails.send({
        from: 'InlinkAI <noreply@updates.inlinkai.com>', // Use same verified domain as other emails
        to: [email], // Use array format like other emails
        subject: '🔑 Reset Your InlinkAI Password',
        react: passwordResetEmailTemplate, // Use React template like other emails
      });

      if (error) {
        console.error(`❌ Resend API error for ${email}:`, error);
        return NextResponse.json({ 
          error: 'Failed to send reset email. Please try again.',
          details: error.message 
        }, { status: 500 });
      }

      console.log(`✅ Password reset email sent successfully to ${email}`, data?.id ? `(ID: ${data.id})` : '');

      return NextResponse.json({ 
        message: 'Password reset email sent! Check your inbox and spam folder.',
        success: true,
        emailId: data?.id
      });
    } catch (emailError: any) {
      console.error(`❌ Failed to send reset email to ${email}:`, emailError);
      
      return NextResponse.json({ 
        error: 'Failed to send reset email. Please try again.',
        details: emailError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Failed to process password reset request' 
    }, { status: 500 });
  }
}
