import { useMemo } from 'react';
import { useCachedQuery, useMutation } from './offline';
import { getUrbanReuseRepository, OccupancyAgreement } from '../services/offline/repositories';
import type { UpkeepCheckIn, OccupancyConsiderationType } from '../services/api/urbanReuseClient';

export function useUrbanReuseAgreementV2(agreementId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);


  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-agreement', agreementId || ''],
    queryFn: () => repository.getAgreementById(agreementId as string),
    enabled: !!agreementId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreement: (data || null) as OccupancyAgreement | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useUrbanReuseAgreementsByOwnerV2(ownerId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-owner', ownerId || ''],
    queryFn: () => repository.getAgreementsByOwner(ownerId as string),
    enabled: !!ownerId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreements: (data || []) as OccupancyAgreement[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useUrbanReuseAgreementsByOccupantV2(occupantUserId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-occupant', occupantUserId || ''],
    queryFn: () => repository.getAgreementsByOccupant(occupantUserId as string),
    enabled: !!occupantUserId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreements: (data || []) as OccupancyAgreement[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useActiveUrbanReuseAgreementV2(propertyId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-property-active', propertyId || ''],
    queryFn: () => repository.getActiveAgreementByProperty(propertyId as string),
    enabled: !!propertyId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreement: (data || null) as OccupancyAgreement | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useRequestedUrbanReuseAgreementsV2(propertyId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-property-requested', propertyId || ''],
    queryFn: () => repository.getRequestedAgreementsByProperty(propertyId as string),
    enabled: !!propertyId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreements: (data || []) as OccupancyAgreement[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useMyUrbanReuseAgreementV2(propertyId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-property-mine', propertyId || ''],
    queryFn: () => repository.getMyAgreementForProperty(propertyId as string),
    enabled: !!propertyId,
    staleTime: 3 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    agreement: (data || null) as OccupancyAgreement | null,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useUrbanReuseCheckInsV2(agreementId: string | undefined) {
  const repository = useMemo(() => getUrbanReuseRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['investments', 'urbanReuse-checkins', agreementId || ''],
    queryFn: () => repository.getCheckInsByAgreement(agreementId as string),
    enabled: !!agreementId,
    staleTime: 2 * 60 * 1000,
    refetchOnReconnect: true,
    reactiveChannel: 'investments:urbanReuse',
  });

  return {
    checkIns: (data || []) as UpkeepCheckIn[],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useCreateUrbanReuseAgreement() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (data: Parameters<typeof repository.createAgreement>[0]) => repository.createAgreement(data),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useRequestUrbanReuseOccupancy() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (data: Parameters<typeof repository.requestOccupancy>[0]) => repository.requestOccupancy(data),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useAcceptUrbanReuseRequest() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; adjustedTerms?: { monthlyRent?: number; considerationType?: OccupancyConsiderationType; maintenanceObligation?: string; revocationNoticeDays?: number } }) =>
      repository.acceptRequest(params.agreementId, params.adjustedTerms),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useRejectUrbanReuseRequest() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; reason: string }) => repository.rejectRequest(params.agreementId, params.reason),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

/** The REQUESTER withdraws their own still-'requested' candidacy. */
export function useCancelUrbanReuseRequest() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (agreementId: string) => repository.cancelRequest(agreementId),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function usePayUrbanReuseRent() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (agreementId: string) => repository.payMonthlyRent(agreementId),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useRevokeUrbanReuseForProject() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; reason: string }) => repository.revokeForProject(params.agreementId, params.reason),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useEndUrbanReuseAgreement() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (agreementId: string) => repository.endAgreement(agreementId),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useReportUrbanReuseCheckIn() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (data: { agreementId: string; description: string; photos?: string[]; reportedBy: string }) => repository.reportCheckIn(data),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

// ── État des lieux entrée/sortie (doc §5) ──────────────────────────────────

export function useRecordMoveInCondition() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; notes?: string; photos: string[] }) =>
      repository.recordMoveInCondition(params.agreementId, { notes: params.notes, photos: params.photos }),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useRecordMoveOutCondition() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; notes?: string; photos: string[] }) =>
      repository.recordMoveOutCondition(params.agreementId, { notes: params.notes, photos: params.photos }),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useVerifyMoveCondition() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; which: 'moveIn' | 'moveOut' }) =>
      repository.verifyMoveCondition(params.agreementId, params.which),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useDisputeMoveCondition() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { agreementId: string; which: 'moveIn' | 'moveOut'; disputeNotes: string }) =>
      repository.disputeMoveCondition(params.agreementId, params.which, params.disputeNotes),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useVerifyUrbanReuseCheckIn() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { checkInId: string; verifiedBy: string; agreementId?: string }) =>
      repository.verifyCheckIn(params.checkInId, params.verifiedBy, params.agreementId),
    invalidateQueries: ['investments:urbanReuse'],
  });
}

export function useDisputeUrbanReuseCheckIn() {
  const repository = useMemo(() => getUrbanReuseRepository(), []);
  return useMutation({
    mutationFn: (params: { checkInId: string; disputeNotes: string; agreementId?: string }) =>
      repository.disputeCheckIn(params.checkInId, params.disputeNotes, params.agreementId),
    invalidateQueries: ['investments:urbanReuse'],
  });
}
