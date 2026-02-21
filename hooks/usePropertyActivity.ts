import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getBookingService, Activity } from '@/services/api/bookingService';
import {
  PropertyType,
  ActionType,
  determineBookingNavigation,
} from '@/constants/propertyTypeConfigs';

export type BookingNavigationRoute =
  | '/booking/Bookingscreen'
  | '/booking/HotelBookingScreen'
  | '/booking/VisitScreen'
  | '/bookingReview/bookingReview'
  | '/wallet/Wallet'
  | '/contrat/ContratScreen';

export interface BookingNavigation {
  route: BookingNavigationRoute;
  params?: Record<string, string>;
  message?: string;
}

interface UsePropertyActivityOptions {
  propertyId: string | undefined;
  userId: string | undefined;
  propertyType: PropertyType;
  actionType: ActionType;
}

/**
 * Central hook for determining the correct booking navigation for a property.
 *
 * Fetches the user's activity for this property (filtered by userId on the backend)
 * and derives the correct next screen to navigate to.
 *
 * Automatically re-fetches when the screen regains focus so that coming back
 * from VisitScreen or Bookingscreen always reflects the latest server state.
 *
 * - isLoading: true while fetching (disable the booking button during this time)
 * - navigation: the resolved route + params to push
 * - refresh: manually trigger a re-fetch
 */
export const usePropertyActivity = ({
  propertyId,
  userId,
  propertyType,
  actionType,
}: UsePropertyActivityOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [navigation, setNavigation] = useState<BookingNavigation | null>(null);

  const fetchAndCompute = useCallback(async () => {
    if (!propertyId || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const bookingService = getBookingService();
      const result = await bookingService.getPropertyActivityService(propertyId, userId);
      const userActivities: Activity[] = result || [];
      setActivities(userActivities);

      // Pick the most recent activity (backend sorts by createdAt desc)
      const lastActivity = userActivities.length > 0 ? userActivities[0] : undefined;

      const nav = determineBookingNavigation(
        propertyType,
        actionType,
        lastActivity
          ? {
              reservationStatus: lastActivity.reservationStatus,
              visiteStatus: lastActivity.visiteStatus,
              id: lastActivity.id,
              isPayment: (lastActivity as any).isPayment,
            }
          : undefined
      );

      setNavigation(nav as BookingNavigation);
    } catch {
      // On error: fall back to default navigation (treat as no existing activity)
      const nav = determineBookingNavigation(propertyType, actionType, undefined);
      setNavigation(nav as BookingNavigation);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, userId, propertyType, actionType]);

  // Re-fetch every time this screen comes into focus so returning from
  // VisitScreen / Bookingscreen always reflects the latest state.
  useFocusEffect(useCallback(() => { fetchAndCompute(); }, [fetchAndCompute]));

  return {
    isLoading,
    activities,
    navigation,
    refresh: fetchAndCompute,
  };
};
