/**
 * invest/rst/portfolio.tsx
 * Redirects to the wallet's invest-tokens section (wallet is now the source of truth).
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RSTPortfolioRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Portfolio RST is now managed from the wallet
    router.replace('/wallet' as any);
  }, []);

  return null;
}
