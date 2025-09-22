import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserLinkedInUsername } from '@/lib/user-settings';

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id: userId } = await params;
    
    // Get LinkedIn username for this user
    const linkedinUsername = getUserLinkedInUsername(session.user.id);
    
    if (!linkedinUsername) {
      console.log('❌ No LinkedIn username configured for recent activity:', session.user.email);
      return NextResponse.json({
        success: false,
        error: 'LinkedIn username not configured',
        data: null
      }, { status: 400 });
    }
    
    console.log('📈 Fetching recent activity for user:', session.user.email, 'with LinkedIn username:', linkedinUsername);

    // Fetch data from localhost:5000/in/{username}/recent-activity/all/
    const response = await fetch(`http://localhost:5000/in/${linkedinUsername}/recent-activity/all/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InlinkAI-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch recent activity:', response.status, response.statusText);
      
      // Return error instead of mock data
      return NextResponse.json({
        success: false,
        error: 'External service unavailable',
        data: null
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('✅ Successfully fetched recent activity data');
    
    return NextResponse.json({
      success: true,
      data,
      source: 'external'
    });

  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: null
    }, { status: 500 });
  }
}
