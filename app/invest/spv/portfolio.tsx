import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SPVPortfolioRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Portfolio SPV is now managed from the wallet
    router.replace('/wallet' as any);
  }, []);

  return null;
}
