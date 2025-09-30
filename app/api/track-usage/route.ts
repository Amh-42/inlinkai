import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Autumn } from "autumn-js";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_id, feature_id, value = 1 } = body;

    if (!customer_id || !feature_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: customer_id and feature_id' 
      }, { status: 400 });
    }

    // Validate that the customer_id matches the authenticated user
    if (customer_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Autumn
    const autumn = new Autumn({ 
      secretKey: process.env.AUTUMN_SECRET_KEY as string 
    });

    console.log('📊 Tracking usage for:', { customer_id, feature_id, value });

    // Track usage
    await autumn.track({
      customer_id,
      feature_id,
      value,
    });

    console.log('✅ Usage tracked successfully');

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error) {
    console.error('❌ Usage tracking error:', error);
    return NextResponse.json({ 
      error: 'Failed to track usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
