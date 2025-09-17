'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show main navigation on dashboard pages or onboarding pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/onboarding')) {
    return null;
  }
  
  return <Navigation />;
}
