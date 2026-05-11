/**
 * useInvestmentPortfolio.ts
 * Hook consommé par InvestmentTokensSection (wallet) pour charger le portfolio RST + SPV.
 * Source : investmentService.getPortfolio() → microservice → fallback GraphQL
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getInvestmentService } from '@/services/api/investmentService';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getUnifiedCacheService } from '@/services/offline/core/UnifiedCacheService';

export interface PortfolioSummary {
  rst: { project: any; token: any; holder: any }[];
  spv: any[];
  totalInvestedUsd: number;
  totalCurrentValueUsd: number;
  totalReturnUsd: number;
  totalReturnPct: number;
}

const EMPTY: PortfolioSummary = {
  rst: [],
  spv: [],
  totalInvestedUsd: 0,
  totalCurrentValueUsd: 0,
  totalReturnUsd: 0,
  totalReturnPct: 0,
};

export function useInvestmentPortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const cache = getUnifiedCacheService();

  const load = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const cacheKey = `investment:portfolio:${user.id}`;
    if (!isRefresh) {
      const cached = await cache.get<PortfolioSummary>(cacheKey);
      if (cached && mounted.current) { setPortfolio(cached); setLoading(false); }
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getInvestmentService().getPortfolio(user.id);
      if (!mounted.current) return;
      setPortfolio(data);
      cache.set(cacheKey, data, { ttl: 3 * 60 * 1000 }).catch(() => {});
    } catch (e: any) {
      if (!mounted.current) return;
      setError(e?.message || 'Erreur chargement portfolio');
      setPortfolio(EMPTY);
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { portfolio, loading, refreshing, error, refresh };
}
