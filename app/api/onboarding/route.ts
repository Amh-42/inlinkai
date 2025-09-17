import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET - Check onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the database for user's onboarding data
    const db = auth.options.database as any;
    
    let userData = null;
    try {
      userData = db.prepare(`
        SELECT onboarding_complete, onboarding_role, onboarding_discovery, 
               onboarding_terms, onboarding_marketing 
        FROM user 
        WHERE id = ?
      `).get(session.user.id);
    } catch (error) {
      // Columns might not exist yet, return incomplete status
      console.log('Onboarding columns not yet created, returning incomplete status');
    }

    const isComplete = userData?.onboarding_complete === 1;

    return NextResponse.json({
      isComplete,
      data: userData ? {
        role: userData.onboarding_role,
        discovery: userData.onboarding_discovery,
        terms: userData.onboarding_terms,
        marketing: userData.onboarding_marketing === 1
      } : null
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save onboarding data
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { step, data } = body;
    
    console.log('Onboarding API - Step:', step, 'Data:', data);
    
    // Validate required fields
    if (!step) {
      return NextResponse.json({ error: 'Missing step parameter' }, { status: 400 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Missing data parameter' }, { status: 400 });
    }

    const db = auth.options.database as any;

    // First, ensure the onboarding columns exist
    const columns = [
      'onboarding_complete INTEGER DEFAULT 0',
      'onboarding_role TEXT',
      'onboarding_discovery TEXT',
      'onboarding_terms TEXT',
      'onboarding_marketing INTEGER DEFAULT 0'
    ];

    for (const column of columns) {
      try {
        const columnName = column.split(' ')[0];
        // Check if column exists first
        const checkColumn = db.prepare(`PRAGMA table_info(user)`).all();
        const columnExists = checkColumn.some((col: any) => col.name === columnName);
        
        if (!columnExists) {
          db.exec(`ALTER TABLE user ADD COLUMN ${column};`);
        }
      } catch (e) {
        console.error(`Error adding column ${column}:`, e);
      }
    }

    // Update user's onboarding data based on step
    switch (step) {
      case 'role':
        db.prepare(`
          UPDATE user 
          SET onboarding_role = ? 
          WHERE id = ?
        `).run(JSON.stringify(data), session.user.id);
        break;

      case 'discovery':
        db.prepare(`
          UPDATE user 
          SET onboarding_discovery = ? 
          WHERE id = ?
        `).run(JSON.stringify(data), session.user.id);
        break;

      case 'complete':
        // Validate required fields for completion
        if (!data.terms) {
          return NextResponse.json({ error: 'Missing terms data' }, { status: 400 });
        }
        
        db.prepare(`
          UPDATE user 
          SET onboarding_terms = ?, 
              onboarding_marketing = ?, 
              onboarding_complete = 1 
          WHERE id = ?
        `).run(
          JSON.stringify(data.terms), 
          data.marketing ? 1 : 0, 
          session.user.id
        );
        console.log('Onboarding completed for user:', session.user.id);
        break;

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
