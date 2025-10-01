import { NextRequest, NextResponse } from 'next/server';
import { authLogger } from '@/lib/auth-logger';
import { isAdmin } from '@/lib/admin-utils';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session to check if user is admin
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // Only allow admin users to view logs
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const lines = parseInt(url.searchParams.get('lines') || '200');
    const format = url.searchParams.get('format') || 'text';
    const clear = url.searchParams.get('clear') === 'true';

    if (clear) {
      authLogger.clearLogs();
      return NextResponse.json({ message: 'Auth logs cleared successfully' });
    }

    const logs = authLogger.getRecentLogs(lines);

    if (format === 'json') {
      // Parse logs into structured format for easier reading
      const logLines = logs.split('\n').filter(line => line.trim());
      const parsedLogs = logLines.map(line => {
        try {
          const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)$/);
          if (match) {
            return {
              timestamp: match[1],
              level: match[2],
              category: match[3],
              message: match[4],
              raw: line
            };
          }
          return { raw: line };
        } catch {
          return { raw: line };
        }
      });

      return NextResponse.json({
        logs: parsedLogs,
        totalLines: parsedLogs.length,
        requestedLines: lines
      });
    }

    // Return as plain text for easy reading
    return new NextResponse(logs, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error fetching auth logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch auth logs', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session to check if user is admin
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // Only allow admin users to manage logs
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, message, data } = body;

    if (action === 'test') {
      // Add a test log entry
      authLogger.info('AUTH', message || 'Test log entry from debug endpoint', data);
      return NextResponse.json({ message: 'Test log entry added' });
    }

    if (action === 'clear') {
      authLogger.clearLogs();
      return NextResponse.json({ message: 'Auth logs cleared successfully' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "test" or "clear"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing auth logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to manage auth logs', details: errorMessage },
      { status: 500 }
    );
  }
}
