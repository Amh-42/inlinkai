import { auth } from './auth';

export const FREE_PLAN_LIMIT = 5;

/**
 * Check if user is Pro (has unlimited access)
 */
export async function isProUser(userId: string): Promise<boolean> {
  const pool = auth.options.database as any;
  
  try {
    const [result] = await pool.execute(`
      SELECT subscription_status
      FROM \`user\` 
      WHERE id = ?
    `, [userId]);
    
    const userData = (result as any[])[0];
    return userData?.subscription_status === 'pro';
  } catch (error) {
    console.error('❌ Error checking user subscription:', error);
    return false; // Default to free if error
  }
}

export interface UsageInfo {
  currentUsage: number;
  limit: number;
  remaining: number;
  canUseFeature: boolean;
  isProUser: boolean;
}

/**
 * Check if user can use premium features and get usage info
 */
export async function checkFeatureUsage(userId: string): Promise<UsageInfo> {
  const pool = auth.options.database as any;
  
  try {
    // Get user's subscription status first
    const [result] = await pool.execute(`
      SELECT subscription_status, monthly_feature_usage, usage_reset_date
      FROM \`user\` 
      WHERE id = ?
    `, [userId]);
    
    const userData = (result as any[])[0];
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    const isProUser = userData.subscription_status === 'pro';
    
    // Pro users have unlimited usage - no tracking needed
    if (isProUser) {
      return {
        currentUsage: 0,
        limit: -1, // -1 means unlimited
        remaining: -1,
        canUseFeature: true,
        isProUser: true
      };
    }
    
    // Check if we need to reset monthly usage (new month)
    const today = new Date();
    const resetDate = new Date(userData.usage_reset_date);
    const currentMonth = today.getMonth();
    const resetMonth = resetDate.getMonth();
    
    let currentUsage = userData.monthly_feature_usage || 0;
    
    // Reset usage if it's a new month
    if (currentMonth !== resetMonth || today.getFullYear() !== resetDate.getFullYear()) {
      console.log('🔄 Resetting monthly usage for new month');
      await pool.execute(`
        UPDATE \`user\` 
        SET monthly_feature_usage = 0, usage_reset_date = CURDATE()
        WHERE id = ?
      `, [userId]);
      currentUsage = 0;
    }
    
    const remaining = Math.max(0, FREE_PLAN_LIMIT - currentUsage);
    const canUseFeature = currentUsage < FREE_PLAN_LIMIT;
    
    return {
      currentUsage,
      limit: FREE_PLAN_LIMIT,
      remaining,
      canUseFeature,
      isProUser: false
    };
    
  } catch (error) {
    console.error('❌ Error checking feature usage:', error);
    throw error;
  }
}

/**
 * Increment usage counter for a user
 */
export async function incrementUsage(userId: string): Promise<UsageInfo> {
  const pool = auth.options.database as any;
  
  try {
    // First check current usage
    const usageInfo = await checkFeatureUsage(userId);
    
    // Don't increment for pro users - they have unlimited access
    if (usageInfo.isProUser) {
      return usageInfo;
    }
    
    // Don't increment if limit already reached
    if (!usageInfo.canUseFeature) {
      return usageInfo;
    }
    
    // Increment usage
    await pool.execute(`
      UPDATE \`user\` 
      SET monthly_feature_usage = monthly_feature_usage + 1
      WHERE id = ?
    `, [userId]);
    
    console.log(`📊 Incremented usage for user ${userId}: ${usageInfo.currentUsage + 1}/${FREE_PLAN_LIMIT}`);
    
    // Return updated usage info
    return {
      currentUsage: usageInfo.currentUsage + 1,
      limit: usageInfo.limit,
      remaining: usageInfo.remaining - 1,
      canUseFeature: (usageInfo.currentUsage + 1) < FREE_PLAN_LIMIT,
      isProUser: false
    };
    
  } catch (error) {
    console.error('❌ Error incrementing usage:', error);
    throw error;
  }
}

/**
 * Get usage info for display in UI
 */
export async function getUserUsageInfo(userId: string): Promise<UsageInfo> {
  try {
    return await checkFeatureUsage(userId);
  } catch (error) {
    console.error('❌ Error getting user usage info:', error);
    // Return safe defaults on error
    return {
      currentUsage: FREE_PLAN_LIMIT,
      limit: FREE_PLAN_LIMIT,
      remaining: 0,
      canUseFeature: false,
      isProUser: false
    };
  }
}
