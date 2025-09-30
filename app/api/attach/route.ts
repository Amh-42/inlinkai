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
    const { customer_id, product_id } = body;

    if (!customer_id || !product_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: customer_id and product_id' 
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

    console.log('🔗 Attaching product for:', { customer_id, product_id });

    // Call Autumn attach to complete the purchase
    const { data } = await autumn.attach({
      customer_id,
      product_id,
    });

    console.log('✅ Attach response:', data);

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('❌ Attach error:', error);
    return NextResponse.json({ 
      error: 'Failed to attach product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
