/**
 * Admin authentication utilities
 */

/**
 * Check if admin is logged in
 */
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  
  const loggedIn = sessionStorage.getItem('adminLoggedIn');
  const loginTime = sessionStorage.getItem('adminLoginTime');
  
  if (!loggedIn || !loginTime) return false;
  
  // Check if session expired (24 hours)
  const now = Date.now();
  const elapsed = now - parseInt(loginTime);
  const hours24 = 24 * 60 * 60 * 1000;
  
  if (elapsed > hours24) {
    // Session expired, clear it
    adminLogout();
    return false;
  }
  
  return loggedIn === 'true';
}

/**
 * Get admin username
 */
export function getAdminUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('adminUsername');
}

/**
 * Logout admin
 */
export function adminLogout(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminUsername');
  sessionStorage.removeItem('adminLoginTime');
}

/**
 * Require authentication - redirect to login if not logged in
 */
export function requireAuth(router: any): boolean {
  if (!isAdminLoggedIn()) {
    router.push('/admin/login');
    return false;
  }
  return true;
}
