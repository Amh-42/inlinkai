import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserLinkedInUsername, setUserLinkedInUsername } from '@/lib/user-settings';

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get LinkedIn username from shared storage
    const linkedinUsername = getUserLinkedInUsername(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        linkedinUsername
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkedinUsername } = await request.json();

    if (!linkedinUsername || typeof linkedinUsername !== 'string') {
      return NextResponse.json({ 
        error: 'LinkedIn username is required' 
      }, { status: 400 });
    }

    // Clean the username (remove any URL parts if user pasted full URL)
    const cleanUsername = linkedinUsername
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!cleanUsername) {
      return NextResponse.json({ 
        error: 'Invalid LinkedIn username' 
      }, { status: 400 });
    }

    // Store LinkedIn username in shared storage
    setUserLinkedInUsername(session.user.id, cleanUsername);

    console.log('✅ LinkedIn username saved for user:', session.user.email, 'username:', cleanUsername);
    console.log('🔍 Debug - User ID used for storage:', session.user.id);
    
    // Verify it was saved
    const savedUsername = getUserLinkedInUsername(session.user.id);
    console.log('🔍 Debug - Verification read:', savedUsername);

    return NextResponse.json({
      success: true,
      data: {
        linkedinUsername: cleanUsername
      }
    });

  } catch (error) {
    console.error('❌ Error saving user settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
