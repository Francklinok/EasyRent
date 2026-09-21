import { useMemo } from 'react';
import { useCachedQuery, useMutation } from './offline';
import { getDormantLandRepository, DormantListing, UsageBooking } from '../services/offline/repositories';
import type { DormantUsageType, RateUnit, ListingStatus } from '../services/api/dormantLandClient';

export function useDormantListingV2(listingId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-listing', listingId || ''],
    queryFn: () => repository.getListingById(listingId as string),
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    listing: (data || null) as DormantListing | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useSearchDormantListingsV2(filters?: { usageType?: DormantUsageType; maxRate?: number }) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-search', JSON.stringify(filters || {})],
    queryFn: () => repository.searchListings(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    listings: (data || []) as DormantListing[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useDormantListingsByOwnerV2(ownerId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-owner', ownerId || ''],
    queryFn: () => repository.getListingsByOwner(ownerId as string),
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    listings: (data || []) as DormantListing[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useCreateDormantListing() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (data: Parameters<typeof repository.createListing>[0]) => repository.createListing(data),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useUpdateDormantListingStatus() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { listingId: string; status: ListingStatus; ownerId?: string }) =>
      repository.updateListingStatus(params.listingId, params.status, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}

// ============================================================================
// BOOKINGS
// ============================================================================

export function useDormantBookingV2(bookingId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-booking', bookingId || ''],
    queryFn: () => repository.getBookingById(bookingId as string),
    enabled: !!bookingId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    booking: (data || null) as UsageBooking | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useDormantBookingsByListingV2(listingId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-bookings-listing', listingId || ''],
    queryFn: () => repository.getBookingsByListing(listingId as string),
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    bookings: (data || []) as UsageBooking[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useDormantBookingsByRenterV2(renterId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-bookings-renter', renterId || ''],
    queryFn: () => repository.getBookingsByRenter(renterId as string),
    enabled: !!renterId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    bookings: (data || []) as UsageBooking[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useDormantBookingsByOwnerV2(ownerId: string | undefined) {
  const repository = useMemo(() => getDormantLandRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'dormantLand-bookings-owner', ownerId || ''],
    queryFn: () => repository.getBookingsByOwner(ownerId as string),
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:dormantLand',
  });

  return {
    bookings: (data || []) as UsageBooking[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useRequestDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (data: Parameters<typeof repository.requestBooking>[0]) => repository.requestBooking(data),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useConfirmDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { bookingId: string; usageAgreementNotes?: string; listingId?: string; ownerId?: string }) =>
      repository.confirmBooking(params.bookingId, params.usageAgreementNotes, params.listingId, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useRejectDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { bookingId: string; reason: string; listingId?: string; ownerId?: string }) =>
      repository.rejectBooking(params.bookingId, params.reason, params.listingId, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useCancelDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { bookingId: string; reason: string; listingId?: string; ownerId?: string }) =>
      repository.cancelBooking(params.bookingId, params.reason, params.listingId, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useActivateDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { bookingId: string; listingId?: string; ownerId?: string }) =>
      repository.activateBooking(params.bookingId, params.listingId, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}

export function useCompleteDormantBooking() {
  const repository = useMemo(() => getDormantLandRepository(), []);
  return useMutation({
    mutationFn: (params: { bookingId: string; listingId?: string; ownerId?: string }) =>
      repository.completeBooking(params.bookingId, params.listingId, params.ownerId),
    invalidateQueries: ['investments:dormantLand'],
  });
}
