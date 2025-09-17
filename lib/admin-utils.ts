// Utility functions for admin access control

export const ADMIN_EMAIL = 'anwar@inlinkai.com';

export function isAdmin(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  return userEmail === ADMIN_EMAIL;
}

export function requireAdmin(userEmail?: string | null): boolean {
  return isAdmin(userEmail);
}

// For use in API routes
export function checkAdminAccess(session: any): { isAdmin: boolean; error?: string } {
  if (!session?.user?.id) {
    return { isAdmin: false, error: 'Unauthorized' };
  }
  
  if (!isAdmin(session.user.email)) {
    return { isAdmin: false, error: 'Access denied' };
  }
  
  return { isAdmin: true };
}
