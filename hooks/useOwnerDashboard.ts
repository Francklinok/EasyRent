import { useState, useCallback, useEffect } from 'react';
import { getGraphQLService } from '@/services/api/graphqlService';
import { useAuth } from '@/components/contexts/authContext/AuthContext';

const OWNER_DASHBOARD_QUERY = `
  query OwnerDashboard {
    ownerDashboard {
      totalProperties
      activeProperties
      totalServices
      pendingVisits
      pendingReservations
      totalRevenue
      occupancyRate
      recentActivity {
        id
        type
        title
        date
        status
        clientName
        propertyTitle
      }
    }
  }
`;

const OWNER_PROPERTIES_QUERY = `
  query PropertiesByOwner($pagination: PaginationInput) {
    propertiesByOwner(pagination: $pagination) {
      edges {
        node {
          id
          title
          propertyType
          status
          images
          ownerCriteria {
            monthlyRent
            currency
          }
        }
      }
      totalCount
    }
  }
`;

export interface OwnerDashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalServices: number;
  pendingVisits: number;
  pendingReservations: number;
  totalRevenue: number;
  occupancyRate: number;
  recentActivity: OwnerActivity[];
}

export interface OwnerActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
  clientName?: string;
  propertyTitle?: string;
}

export interface OwnerProperty {
  id: string;
  title: string;
  propertyType: string;
  status: string;
  images: string[];
  ownerCriteria?: {
    monthlyRent: number;
    currency: string;
  };
}

export function useOwnerDashboard() {
  const { isOwner } = useAuth();
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const graphqlService = getGraphQLService();

  const fetchDashboard = useCallback(async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [dashboardResult, propertiesResult] = await Promise.all([
        graphqlService.query<{ ownerDashboard: OwnerDashboardStats }>(OWNER_DASHBOARD_QUERY),
        graphqlService.query<{ propertiesByOwner: { edges: { node: OwnerProperty }[], totalCount: number } }>(
          OWNER_PROPERTIES_QUERY,
          { pagination: { page: 1, limit: 10 } }
        )
      ]);

      if (dashboardResult?.ownerDashboard) {
        setStats(dashboardResult.ownerDashboard);
      }

      if (propertiesResult?.propertiesByOwner?.edges) {
        setProperties(propertiesResult.propertiesByOwner.edges.map(e => e.node));
      }
    } catch (err: any) {
      console.error('[useOwnerDashboard] Error:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { stats, properties, loading, error, refresh };
}
