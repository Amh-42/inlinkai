// Utility functions for Autumn pricing integration

// Check if user has access to a feature
export async function checkFeatureAccess(customerId: string, featureId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false; // Server-side, assume no access
  
  try {
    const response = await fetch('/api/check-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        customer_id: customerId,
        feature_id: featureId,
      }),
    });

    const result = await response.json();
    return result.success && result.allowed;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

// Track feature usage
export async function trackFeatureUsage(customerId: string, featureId: string, value: number = 1): Promise<boolean> {
  if (typeof window === 'undefined') return false; // Server-side, don't track
  
  try {
    const response = await fetch('/api/track-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        customer_id: customerId,
        feature_id: featureId,
        value,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error tracking feature usage:', error);
    return false;
  }
}

// Get customer subscription and usage data
export async function getCustomerData(customerId: string): Promise<any> {
  if (typeof window === 'undefined') return null; // Server-side
  
  try {
    const response = await fetch(`/api/customer?customer_id=${customerId}`, {
      credentials: 'include',
    });

    const result = await response.json();
    return result.success ? result.customer : null;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }
}

// Feature IDs (should match your Autumn config)
export const FEATURES = {
  MESSAGES: 'messages',
  // Add more features as needed
} as const;

// Product IDs (should match your Autumn config)
export const PRODUCTS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

// Helper function to check if user can send messages
export async function canSendMessage(customerId: string): Promise<boolean> {
  return checkFeatureAccess(customerId, FEATURES.MESSAGES);
}

// Helper function to track message usage
export async function trackMessageUsage(customerId: string): Promise<boolean> {
  return trackFeatureUsage(customerId, FEATURES.MESSAGES, 1);
}

// Helper function to get remaining messages
export async function getRemainingMessages(customerId: string): Promise<number> {
  const customerData = await getCustomerData(customerId);
  if (!customerData?.features?.messages) return 0;
  
  return customerData.features.messages.balance || 0;
}

// Helper function to check if user is Pro
export async function isProUser(customerId: string): Promise<boolean> {
  const customerData = await getCustomerData(customerId);
  if (!customerData?.products) return false;
  
  // Check if user has Pro product attached
  return customerData.products.some((product: any) => 
    product.id === PRODUCTS.PRO && product.status === 'active'
  );
}

// Helper function to get user's current plan
export async function getUserPlan(customerId: string): Promise<'free' | 'pro'> {
  const isPro = await isProUser(customerId);
  return isPro ? 'pro' : 'free';
}
