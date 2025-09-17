// Utility functions for managing welcome email sending

export async function sendWelcomeEmailToUser(userId: string, userEmail: string, userName?: string) {
  try {
    console.log(`📧 Attempting to send welcome email to ${userEmail}`);
    
    const response = await fetch('/api/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        userName
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Welcome email sent successfully to ${userEmail}`);
    } else {
      console.error(`❌ Failed to send welcome email to ${userEmail}:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

// Check if we should send a welcome email to this user
export function shouldSendWelcomeEmail(session: any): boolean {
  if (!session?.user) return false;
  
  // Check if user was just created (we can check createdAt if available)
  const userCreatedAt = session.user.createdAt;
  if (userCreatedAt) {
    const createdTime = new Date(userCreatedAt).getTime();
    const now = Date.now();
    const tenMinutesAgo = now - (10 * 60 * 1000); // 10 minutes in milliseconds
    
    // If user was created in the last 10 minutes, consider them new
    return createdTime > tenMinutesAgo;
  }
  
  // Alternative check: look for users who just completed onboarding
  // This helps catch users who might not have createdAt timestamp
  if (typeof window !== 'undefined') {
    const recentSignups = JSON.parse(localStorage.getItem('recent_signups') || '[]');
    return recentSignups.includes(session.user.id);
  }
  
  return false;
}

// Mark a user as recently signed up (for cases where createdAt isn't available)
export function markRecentSignup(userId: string) {
  if (typeof window !== 'undefined') {
    const recentSignups = JSON.parse(localStorage.getItem('recent_signups') || '[]');
    if (!recentSignups.includes(userId)) {
      recentSignups.push(userId);
      localStorage.setItem('recent_signups', JSON.stringify(recentSignups));
      
      // Clean up old entries after 30 minutes
      setTimeout(() => {
        const updated = JSON.parse(localStorage.getItem('recent_signups') || '[]');
        const filtered = updated.filter((id: string) => id !== userId);
        localStorage.setItem('recent_signups', JSON.stringify(filtered));
      }, 30 * 60 * 1000); // 30 minutes
    }
  }
}

// Store that we've sent a welcome email to prevent duplicates
export function markWelcomeEmailSent(userId: string) {
  if (typeof window !== 'undefined') {
    const sentEmails = JSON.parse(localStorage.getItem('welcome_emails_sent') || '[]');
    if (!sentEmails.includes(userId)) {
      sentEmails.push(userId);
      localStorage.setItem('welcome_emails_sent', JSON.stringify(sentEmails));
    }
  }
}

// Check if we've already sent a welcome email to this user
export function hasWelcomeEmailBeenSent(userId: string): boolean {
  if (typeof window !== 'undefined') {
    const sentEmails = JSON.parse(localStorage.getItem('welcome_emails_sent') || '[]');
    return sentEmails.includes(userId);
  }
  return false;
}
