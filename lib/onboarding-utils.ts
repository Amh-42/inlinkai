// Utility functions for onboarding flow

// Client-side onboarding status check (uses API)
export async function isOnboardingComplete(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/onboarding');
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.isComplete || false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

// Synchronous version for immediate checks (fallback to localStorage for now)
export function isOnboardingCompletSync(): boolean {
  if (typeof window === 'undefined') return false;
  
  const onboardingData = localStorage.getItem('onboarding_complete');
  if (!onboardingData) return false;
  
  try {
    const data = JSON.parse(onboardingData);
    return data.completed === true;
  } catch {
    return false;
  }
}

// Check and update localStorage from database
export async function syncOnboardingStatus(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🔄 Syncing onboarding status with database...');
    const response = await fetch('/api/onboarding', {
      credentials: 'include', // Ensure cookies are sent
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch onboarding status:', response.status, response.statusText);
      return isOnboardingCompletSync(); // Fallback to localStorage
    }
    
    const data = await response.json();
    console.log('📊 Database onboarding status:', data);
    
    if (data.isComplete) {
      // Update localStorage to match database
      const onboardingComplete = {
        completed: true,
        completedAt: new Date().toISOString(),
        synced: true
      };
      localStorage.setItem('onboarding_complete', JSON.stringify(onboardingComplete));
      console.log('✅ Onboarding status synced: COMPLETE');
      return true;
    } else {
      // Clear localStorage if database shows incomplete
      localStorage.removeItem('onboarding_complete');
      console.log('❌ Onboarding status synced: INCOMPLETE');
      return false;
    }
  } catch (error) {
    console.error('❌ Error syncing onboarding status:', error);
    const fallback = isOnboardingCompletSync();
    console.log('🔄 Using localStorage fallback:', fallback);
    return fallback;
  }
}

export async function getOnboardingData() {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/onboarding');
    if (!response.ok) return null;
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return null;
  }
}

export async function saveOnboardingStep(step: string, data: any) {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('💾 Saving onboarding step:', step, data);
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies are sent
      body: JSON.stringify({ step, data }),
    });
    
    if (response.ok) {
      console.log('✅ Onboarding step saved successfully:', step);
      
      // If this is the completion step, immediately sync status
      if (step === 'complete') {
        console.log('🎉 Onboarding completion step - syncing status...');
        await syncOnboardingStatus();
      }
      
      return true;
    } else {
      console.error('❌ Failed to save onboarding step:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving onboarding step:', error);
    return false;
  }
}

export function clearOnboardingData() {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage only (for testing/logout)
  // Database onboarding completion should persist unless explicitly reset
  localStorage.removeItem('onboarding_role');
  localStorage.removeItem('onboarding_discovery');
  localStorage.removeItem('onboarding_terms');
  localStorage.removeItem('onboarding_complete');
}

export function shouldRedirectToOnboarding(session: any): boolean {
  if (!session?.user) return false;
  
  // Check if onboarding is already complete (sync version for immediate use)
  if (isOnboardingCompletSync()) return false;
  
  // For first-time users (just signed up), redirect to onboarding
  return true;
}
