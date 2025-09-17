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

    // Query the PostgreSQL database for user's onboarding data
    const pool = auth.options.database as any;
    
    let userData = null;
    try {
      console.log('🔍 Checking onboarding status for user:', session.user.id);
      const result = await pool.query(`
        SELECT onboarding_complete, onboarding_role, onboarding_discovery, 
               onboarding_terms, onboarding_marketing 
        FROM "user" 
        WHERE id = $1
      `, [session.user.id]);
      
      userData = result.rows[0];
      console.log('📊 Onboarding data found:', userData);
    } catch (error) {
      // Columns might not exist yet, return incomplete status
      console.log('❌ Error querying onboarding data:', error);
      console.log('🔄 Onboarding columns not yet created, returning incomplete status');
    }

    const isComplete = userData?.onboarding_complete === true;

    return NextResponse.json({
      isComplete,
      data: userData ? {
        role: userData.onboarding_role,
        discovery: userData.onboarding_discovery,
        terms: userData.onboarding_terms,
        marketing: userData.onboarding_marketing === true
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

    const pool = auth.options.database as any;

    // First, ensure the onboarding columns exist in PostgreSQL
    const columns = [
      { name: 'onboarding_complete', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'onboarding_role', type: 'TEXT' },
      { name: 'onboarding_discovery', type: 'TEXT' },
      { name: 'onboarding_terms', type: 'TEXT' },
      { name: 'onboarding_marketing', type: 'BOOLEAN DEFAULT FALSE' }
    ];

    for (const column of columns) {
      try {
        // Check if column exists first
        const checkResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = $1
        `, [column.name]);
        
        if (checkResult.rows.length === 0) {
          console.log(`🔧 Adding column ${column.name} to user table`);
          await pool.query(`ALTER TABLE "user" ADD COLUMN ${column.name} ${column.type}`);
        }
      } catch (e) {
        console.error(`❌ Error adding column ${column.name}:`, e);
      }
    }

    // Update user's onboarding data based on step
    switch (step) {
      case 'role':
        console.log('💼 Saving role data for user:', session.user.id);
        await pool.query(`
          UPDATE "user" 
          SET onboarding_role = $1 
          WHERE id = $2
        `, [JSON.stringify(data), session.user.id]);
        break;

      case 'discovery':
        console.log('🔍 Saving discovery data for user:', session.user.id);
        await pool.query(`
          UPDATE "user" 
          SET onboarding_discovery = $1 
          WHERE id = $2
        `, [JSON.stringify(data), session.user.id]);
        break;

      case 'complete':
        // Validate required fields for completion
        if (!data.terms) {
          return NextResponse.json({ error: 'Missing terms data' }, { status: 400 });
        }
        
        console.log('✅ Completing onboarding for user:', session.user.id);
        await pool.query(`
          UPDATE "user" 
          SET onboarding_terms = $1, 
              onboarding_marketing = $2, 
              onboarding_complete = TRUE 
          WHERE id = $3
        `, [
          JSON.stringify(data.terms), 
          data.marketing || false, 
          session.user.id
        ]);
        console.log('🎉 Onboarding completed successfully for user:', session.user.id);
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
