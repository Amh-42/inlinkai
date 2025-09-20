import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { SimpleWelcomeEmail } from '@/components/email-templates/SimpleWelcomeEmail';
import { NewsletterEmail } from '@/components/email-templates/NewsletterEmail';
import { AnnouncementEmail } from '@/components/email-templates/AnnouncementEmail';
import { checkAdminAccess } from '@/lib/admin-utils';

const resend = new Resend(process.env.RESEND_API_KEY);

// Check if Resend API key is configured
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not configured. Email sending will fail.');
}

// POST - Send email to opted-in users
export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'Email service not configured',
        message: 'Please add RESEND_API_KEY to your .env file'
      }, { status: 500 });
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const adminCheck = checkAdminAccess(session);
    if (!adminCheck.isAdmin) {
      const statusCode = adminCheck.error === 'Unauthorized' ? 401 : 403;
      return NextResponse.json({ error: adminCheck.error }, { status: statusCode });
    }

    const body = await request.json();
    const { emailType, recipients, emailData } = body;

    // Validate email type
    const validEmailTypes = ['welcome', 'newsletter', 'announcement'];
    if (!validEmailTypes.includes(emailType)) {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Get opted-in users from database
    const db = auth.options.database as any;
    
    let targetUsers = [];
    
    if (recipients === 'all') {
      // Get all users who opted in for marketing emails
      try {
        const result = await db.query(`
          SELECT email, name, onboarding_marketing 
          FROM "user" 
          WHERE onboarding_marketing = true AND email IS NOT NULL
        `);
        targetUsers = result.rows;
      } catch (error) {
        console.error('Error fetching opted-in users:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else if (recipients === 'test') {
      // Send test email to current user only
      try {
        const result = await db.query(`
          SELECT email, name 
          FROM "user" 
          WHERE id = $1
        `, [session.user.id]);
        
        if (result.rows.length > 0) {
          targetUsers = [result.rows[0]];
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else if (Array.isArray(recipients)) {
      // Send to specific email addresses
      targetUsers = recipients.map(email => ({ email, name: null }));
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No recipients found',
        message: 'No users have opted in for marketing emails'
      }, { status: 400 });
    }

    // Prepare email template based on type
    let emailTemplate: React.ReactElement;
    let subject: string;

    switch (emailType) {
      case 'welcome':
        subject = emailData.subject || 'Welcome to InlinkAI! 🚀';
        emailTemplate = SimpleWelcomeEmail({
          firstName: '', // Will be replaced per user
          userEmail: '' // Will be replaced per user
        });
        break;

      case 'newsletter':
        subject = emailData.subject || 'InlinkAI Weekly Newsletter';
        emailTemplate = NewsletterEmail({
          firstName: '', // Will be replaced per user
          userEmail: '', // Will be replaced per user
          subject: emailData.subject || 'Your weekly dose of LinkedIn insights',
          content: emailData.content || {
            title: 'InlinkAI Weekly',
            excerpt: 'This week\'s top LinkedIn insights and AI-powered tips.',
            articles: [
              {
                title: 'How AI is Transforming LinkedIn Marketing',
                summary: 'Discover the latest trends in AI-powered LinkedIn strategies.',
                readTime: '5 min read',
                category: 'AI Insights'
              }
            ],
            tips: [
              {
                title: 'Optimize Your LinkedIn Headline',
                description: 'Use keywords that your target audience searches for.'
              }
            ]
          }
        });
        break;

      case 'announcement':
        subject = emailData.subject || 'Exciting New Feature in InlinkAI! 🎉';
        emailTemplate = AnnouncementEmail({
          firstName: '', // Will be replaced per user
          userEmail: '', // Will be replaced per user
          announcement: emailData.announcement || {
            title: 'New Feature Released!',
            subtitle: 'Enhanced AI capabilities for better LinkedIn performance',
            description: 'We\'re excited to introduce our latest feature that will supercharge your LinkedIn presence.',
            features: [
              {
                icon: '🤖',
                title: 'Advanced AI Engine',
                description: 'More intelligent content suggestions based on your industry and audience.'
              }
            ],
            ctaText: 'Try New Features',
            ctaUrl: 'https://inlinkai.vercel.app/dashboard'
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Send emails to all target users
    const emailResults = [];
    const errors = [];

    for (let i = 0; i < targetUsers.length; i++) {
      const user = targetUsers[i];
      
      try {
        // Add delay between sends to avoid rate limiting (except for first email)
        if (i > 0) {
          console.log(`Waiting 600ms before sending email ${i + 1}/${targetUsers.length}...`);
          await sleep(600); // 600ms delay = 1.67 requests per second (under 2/sec limit)
        }

        // Create personalized email template
        let personalizedTemplate: React.ReactElement;
        const firstName = user.name ? user.name.split(' ')[0] : undefined;

        // Always use the original HTML templates with custom content
        switch (emailType) {
          case 'welcome':
            personalizedTemplate = SimpleWelcomeEmail({
              firstName,
              userEmail: user.email,
              customMessage: emailData.customBody && emailData.customBody.trim() ? emailData.customBody : undefined
            });
            break;
          case 'newsletter':
            personalizedTemplate = NewsletterEmail({
              firstName,
              userEmail: user.email,
              subject: emailData.subject || 'Your weekly dose of LinkedIn insights',
              content: {
                ...emailData.content,
                customMessage: emailData.customBody && emailData.customBody.trim() ? emailData.customBody : undefined
              }
            });
            break;
          case 'announcement':
            personalizedTemplate = AnnouncementEmail({
              firstName,
              userEmail: user.email,
              announcement: {
                ...emailData.announcement,
                customMessage: emailData.customBody && emailData.customBody.trim() ? emailData.customBody : undefined
              }
            });
            break;
          default:
            throw new Error('Invalid email type');
        }

        console.log(`Sending email ${i + 1}/${targetUsers.length} to ${user.email}...`);
        
        const { data, error } = await resend.emails.send({
          from: 'InlinkAI <noreply@updates.inlinkai.com>',
          to: [user.email],
          subject: subject,
          react: personalizedTemplate,
        });

        if (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        } else {
          console.log(`✅ Successfully sent email to ${user.email}`);
          emailResults.push({ email: user.email, messageId: data?.id });
        }
      } catch (error: any) {
        console.error(`Error processing email for ${user.email}:`, error);
        errors.push({ email: user.email, error: error.message });
      }
    }

    // Return results
    const response = {
      success: true,
      sent: emailResults.length,
      failed: errors.length,
      total: targetUsers.length,
      results: emailResults,
      errors: errors.length > 0 ? errors : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to add delay between requests to avoid rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// GET - Get email statistics and opted-in users count
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const adminCheck = checkAdminAccess(session);
    if (!adminCheck.isAdmin) {
      const statusCode = adminCheck.error === 'Unauthorized' ? 401 : 403;
      return NextResponse.json({ error: adminCheck.error }, { status: statusCode });
    }

    const db = auth.options.database as any;
    
    let optedInCount = 0;
    let totalUsers = 0;

    try {
      // Count opted-in users
      const optedInResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM "user" 
        WHERE onboarding_marketing = true AND email IS NOT NULL
      `);
      
      optedInCount = parseInt(optedInResult.rows[0]?.count) || 0;

      // Count total users
      const totalResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM "user" 
        WHERE email IS NOT NULL
      `);
      
      totalUsers = parseInt(totalResult.rows[0]?.count) || 0;

    } catch (error) {
      console.error('Error fetching user statistics:', error);
      // Return 0 if columns don't exist yet
    }

    return NextResponse.json({
      optedInUsers: optedInCount,
      totalUsers: totalUsers,
      optInRate: totalUsers > 0 ? Math.round((optedInCount / totalUsers) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching email statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
