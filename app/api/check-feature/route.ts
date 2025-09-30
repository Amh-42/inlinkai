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
    const { customer_id, feature_id } = body;

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

    console.log('🔍 Checking feature access for:', { customer_id, feature_id });

    // Check feature access
    const { data } = await autumn.check({
      customer_id,
      feature_id,
    });

    console.log('✅ Feature check response:', data);

    return NextResponse.json({
      success: true,
      allowed: data?.allowed || false,
      data: data
    });

  } catch (error) {
    console.error('❌ Feature check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check feature access',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
