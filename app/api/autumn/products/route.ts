import { NextRequest, NextResponse } from 'next/server';
import { Autumn } from 'autumn-js';

// Initialize Autumn client
const autumn = new Autumn({ 
  secretKey: process.env.AUTUMN_SECRET_KEY || '' 
});

// GET - Fetch available products
export async function GET(request: NextRequest) {
  try {
    if (!process.env.AUTUMN_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Autumn not configured',
        message: 'Please add AUTUMN_SECRET_KEY to your environment variables'
      }, { status: 500 });
    }

    // For now, return the products defined in autumn.config.ts
    // In a real implementation, you might fetch these from Autumn's API
    const products = [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        features: [
          '5 AI messages per month',
          'Basic LinkedIn optimization',
          'Email support'
        ],
        messageLimit: 5,
        isDefault: true
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For power users and professionals',
        price: 20,
        features: [
          '100 AI messages per month',
          'Advanced LinkedIn optimization',
          'CRM building',
          'Priority support',
          'Advanced analytics'
        ],
        messageLimit: 100,
        isDefault: false
      }
    ];

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error: any) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST - Handle product operations (checkout, attach, etc.)
export async function POST(request: NextRequest) {
  try {
    if (!process.env.AUTUMN_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Autumn not configured',
        message: 'Please add AUTUMN_SECRET_KEY to your environment variables'
      }, { status: 500 });
    }

    const body = await request.json();
    const { action, customer_id, product_id } = body;

    if (!action || !customer_id || !product_id) {
      return NextResponse.json({
        error: 'Missing required parameters',
        message: 'action, customer_id, and product_id are required'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'checkout':
        // Get Stripe checkout page for the product
        result = await autumn.checkout({
          customer_id,
          product_id
        });
        break;

      case 'attach':
        // Attach product to customer (charge if applicable)
        result = await autumn.attach({
          customer_id,
          product_id
        });
        break;

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: 'Supported actions: checkout, attach'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error: any) {
    console.error('❌ Error handling Autumn action:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}