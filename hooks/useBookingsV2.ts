import { useMemo } from 'react';
import { useCachedQuery, useMutation } from './offline';
import {
  getBookingRepository,
  Booking,
  OwnerRequestItem,
  OwnerActivityItem,
  UserActivityItem,
  OwnerExtensionRequestItem,
  ActivityDetail,
  RecentActivity,
  ActivityStats,
  TimeRangeInput,
} from '../services/offline/repositories';
import type {
  BookingRequest,
  SelfGuidedAccessPayload,
  VisitType,
} from '../services/api/bookingService';

// ============================================================================
// OWNER LISTS (RequestsManagementScreen, RentDashboardScreen,
// LeaseManagementScreen partagent tous getOwnerRequests comme source)
// ============================================================================

export function useOwnerRequestsV2(ownerId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'owner-requests', ownerId || ''],
    queryFn: () => repository.getOwnerRequests(ownerId as string),
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    requests: (data || []) as OwnerRequestItem[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useOwnerActivitiesV2(ownerId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'owner-activities', ownerId || ''],
    queryFn: () => repository.getOwnerActivities(ownerId as string),
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    activities: (data || []) as OwnerActivityItem[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useOwnerExtensionRequestsV2(ownerId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'owner-extensions', ownerId || ''],
    queryFn: () => repository.getOwnerExtensionRequests(ownerId as string),
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    extensionRequests: (data || []) as OwnerExtensionRequestItem[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// SINGLE ACTIVITY (TenantManagementScreen)
// ============================================================================

export function useActivityDetailV2(activityId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'detail', activityId || ''],
    queryFn: () => repository.getActivityById(activityId as string),
    enabled: !!activityId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    activity: (data || null) as ActivityDetail | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// RECENT ACTIVITY / STATS (ActivityHeader, ActivityInsights,
// ActivityNotificationCenter, ActivityTracker — migré depuis
// hooks/useActivity.ts::useRecentActivities/useActivityStats, qui
// appelaient des requêtes GraphQL absentes du schéma backend jusqu'ici
// (recentActivities/pendingActivitiesCount, désormais ajoutées) sans
// aucun cache — appel réseau direct à chaque montage.
// ============================================================================

export function useRecentActivitiesV2(userId: string | undefined, limit: number = 10) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'recent', userId || '', String(limit)],
    queryFn: () => repository.getRecentActivities(userId as string, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    activities: (data || []) as RecentActivity[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function usePendingActivitiesCountV2(userId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'pending-count', userId || ''],
    queryFn: () => repository.getPendingActivitiesCount(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    pendingCount: (data ?? 0) as number,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useActivityStatsV2(userId?: string, propertyId?: string, timeRange?: TimeRangeInput) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'stats', userId || '', propertyId || '', JSON.stringify(timeRange || {})],
    queryFn: () => repository.getActivityStats(userId, propertyId, timeRange),
    staleTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    stats: (data || null) as ActivityStats | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// CLIENT LISTS (bookingstatus.tsx)
// ============================================================================

export function useUserActivitiesV2(userId: string | undefined) {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'user-activities', userId || ''],
    queryFn: () => repository.getUserActivities(userId as string),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    activities: (data || []) as UserActivityItem[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useUserBookingsV2(userId: string | undefined, role: 'client' | 'owner') {
  const repository = useMemo(() => getBookingRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['activities', 'user-bookings', userId || '', role],
    queryFn: () => repository.getUserBookings(userId as string, role),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    bookings: (data || []) as Booking[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCreateBooking() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      request,
      propertyTitle,
      clientName,
      listType,
    }: {
      request: BookingRequest;
      propertyTitle?: string;
      clientName?: string;
      listType?: 'rent' | 'sale';
    }) => repository.createBooking(request, propertyTitle, clientName, listType),
    invalidateQueries: ['activities'],
  });
}

export function useRespondToVisitRequest() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      visitId,
      ownerId,
      accepted,
      reason,
      visitType,
      clientId,
      propertyTitle,
      selfGuidedAccess,
    }: {
      visitId: string;
      ownerId: string;
      accepted: boolean;
      reason?: string;
      visitType?: VisitType;
      clientId?: string;
      propertyTitle?: string;
      selfGuidedAccess?: SelfGuidedAccessPayload;
    }) =>
      repository.respondToVisitRequest(
        visitId, ownerId, accepted, reason, visitType, clientId, propertyTitle, selfGuidedAccess
      ),
    invalidateQueries: ['activities'],
  });
}

export function useRespondToBookingRequest() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      bookingId,
      ownerId,
      accepted,
      reason,
    }: {
      bookingId: string;
      ownerId: string;
      accepted: boolean;
      reason?: string;
    }) => repository.respondToBookingRequest(bookingId, ownerId, accepted, reason),
    invalidateQueries: ['activities'],
  });
}

export function useAcceptReservation() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({ reservationId, ownerId }: { reservationId: string; ownerId?: string }) =>
      repository.acceptReservation(reservationId, ownerId),
    invalidateQueries: ['activities'],
  });
}

export function useRejectReservation() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      reservationId,
      reason,
      ownerId,
    }: {
      reservationId: string;
      reason?: string;
      ownerId?: string;
    }) => repository.rejectReservation(reservationId, reason, ownerId),
    invalidateQueries: ['activities'],
  });
}

export function useRespondToExtensionRequest() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      activityId,
      accepted,
      ownerId,
    }: {
      activityId: string;
      accepted: boolean | 'accept' | 'refuse';
      ownerId?: string;
    }) => repository.respondToExtensionRequest(activityId, accepted, ownerId),
    invalidateQueries: ['activities'],
  });
}

export function useRequestPaymentExtension() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({
      activityId,
      days,
      date,
    }: {
      activityId: string;
      days?: number;
      date?: string;
    }) => repository.requestPaymentExtension(activityId, days, date),
    invalidateQueries: ['activities'],
  });
}

export function useEndLease() {
  const repository = useMemo(() => getBookingRepository(), []);

  return useMutation({
    mutationFn: ({ activityId, ownerId }: { activityId: string; ownerId?: string }) =>
      repository.endLease(activityId, ownerId),
    invalidateQueries: ['activities'],
  });
}
