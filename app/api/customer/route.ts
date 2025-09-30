import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Autumn } from "autumn-js";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id') || session.user.id;

    // Validate that the customer_id matches the authenticated user
    if (customer_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Autumn
    const autumn = new Autumn({ 
      secretKey: process.env.AUTUMN_SECRET_KEY as string 
    });

    console.log('👤 Getting customer info for:', customer_id);

    // Get customer data
    const customer = await autumn.customers.get(customer_id);

    console.log('✅ Customer data retrieved:', customer);

    return NextResponse.json({
      success: true,
      customer: customer
    });

  } catch (error) {
    console.error('❌ Customer fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
