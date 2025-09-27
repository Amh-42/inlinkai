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
    
    console.log('🔍 Debug - User ID:', session.user.id);
    console.log('🔍 Debug - LinkedIn username found:', linkedinUsername);
    
    if (!linkedinUsername) {
      console.log('❌ No LinkedIn username configured for user:', session.user.email);
      console.log('❌ User ID that was checked:', session.user.id);
      return NextResponse.json({
        success: false,
        error: 'LinkedIn username not configured',
        data: null
      }, { status: 400 });
    }
    
    console.log('📊 Fetching overview data for user:', session.user.email, 'with LinkedIn username:', linkedinUsername);

    // Fetch data from localhost:8000/dashboard/{linkedin_username}
    const response = await fetch(`http://localhost:8000/dashboard/${linkedinUsername}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InlinkAI-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch overview data:', response.status, response.statusText);
      
      // Return error instead of mock data
      return NextResponse.json({
        success: false,
        error: 'External service unavailable',
        data: null
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('✅ Successfully fetched overview data');
    
    return NextResponse.json({
      success: true,
      data,
      source: 'external'
    });

  } catch (error) {
    console.error('❌ Error fetching overview data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: null
    }, { status: 500 });
  }
}
