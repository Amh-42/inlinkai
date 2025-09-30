import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserUsageInfo } from '@/lib/usage-tracking';

// GET - Get user's current usage info
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageInfo = await getUserUsageInfo(session.user.id);

    return NextResponse.json({
      success: true,
      usage: usageInfo
    });

  } catch (error: any) {
    console.error('❌ Error getting usage info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get usage information'
    }, { status: 500 });
  }
}
