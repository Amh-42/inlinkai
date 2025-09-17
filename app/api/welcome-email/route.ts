import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { SimpleWelcomeEmail } from '@/components/email-templates/SimpleWelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Check if Resend API key is configured
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not found. Welcome emails will not be sent.');
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, userEmail, userName } = body;

    // Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId and userEmail' 
      }, { status: 400 });
    }

    // Skip sending if no Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Welcome email skipped - Resend API key not configured');
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email skipped - Resend not configured' 
      });
    }

    console.log(`📧 Sending welcome email to new user: ${userEmail} (User ID: ${userId})`);

    try {
      // Get the user's first name
      const firstName = userName ? userName.split(' ')[0] : undefined;

      // Create the welcome email template
      const welcomeEmailTemplate = SimpleWelcomeEmail({
        firstName,
        userEmail,
        // Use the default welcome message (no custom message for auto-welcome)
      });

      // Send the welcome email
      const { data, error } = await resend.emails.send({
        from: 'InlinkAI <noreply@updates.inlinkai.com>',
        to: [userEmail],
        subject: 'Welcome to InlinkAI - Let\'s Transform Your LinkedIn Presence!',
        react: welcomeEmailTemplate,
      });

      if (error) {
        console.error(`❌ Failed to send welcome email to ${userEmail}:`, error);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send welcome email',
          details: error.message 
        }, { status: 500 });
      }

      console.log(`✅ Welcome email sent successfully to ${userEmail}`, data?.id ? `(ID: ${data.id})` : '');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailId: data?.id 
      });

    } catch (emailError: any) {
      console.error(`❌ Error sending welcome email to ${userEmail}:`, emailError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send welcome email',
        details: emailError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in welcome email API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

