/**
 * DormantLandClient — typed client for the "Land-as-a-Service" module
 * (backend_easyrent/src/dormantLand/, mounted at /api/dormant-land).
 * Connects owners of underused land/space with temporary uses (storage,
 * events, urban agriculture) — a usage-rights booking, never a tenancy or
 * ownership transfer.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type DormantUsageType = 'storage' | 'event' | 'urban_agriculture' | 'parking' | 'pop_up_retail' | 'other';
export type RateUnit = 'hour' | 'day' | 'month';
export type ListingStatus = 'active' | 'paused' | 'closed';

export interface DormantListing {
  listingId: string;
  ownerId: string;
  propertyId?: string;
  title: string;
  description: string;
  address: string;
  areaSqm?: number;
  photos: string[];
  allowedUsageTypes: DormantUsageType[];
  rate: number;
  rateUnit: RateUnit;
  currency: string;
  minDurationUnits: number;
  maxDurationUnits?: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export type UsageBookingStatus = 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';

export interface UsageBooking {
  bookingId: string;
  listingId: string;
  ownerId: string;
  renterId: string;
  usageType: DormantUsageType;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: UsageBookingStatus;
  renterNotes?: string;
  usageAgreementNotes?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export class DormantLandClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.DORMANT_LAND_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    // Clé canonique du token stocké après login (voir apiService.ts /
    // graphqlService.ts) — 'token' n'a jamais été écrit nulle part, donc ce
    // header restait toujours vide et le backend rejetait la requête.
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, body?: unknown, retries = 3): Promise<T> {
    let lastError: Error = new Error('Dormant land service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Dormant land service error');
        return json.data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  // ── Listings ──────────────────────────────────────────────────────────
  createListing(data: {
    ownerId: string; propertyId?: string; title: string; description: string; address: string;
    areaSqm?: number; photos?: string[]; allowedUsageTypes: DormantUsageType[]; rate: number; rateUnit: RateUnit;
    currency?: string; minDurationUnits?: number; maxDurationUnits?: number;
  }) {
    return this.request<DormantListing>('POST', '/listings', data);
  }
  getListing(listingId: string) {
    return this.request<DormantListing>('GET', `/listings/${listingId}`);
  }
  getListingsByOwner(ownerId: string) {
    return this.request<DormantListing[]>('GET', `/listings/owner/${ownerId}`);
  }
  getListingsByProperty(propertyId: string) {
    return this.request<DormantListing[]>('GET', `/listings/property/${propertyId}`);
  }
  searchListings(filters: { usageType?: DormantUsageType; maxRate?: number }) {
    const params = new URLSearchParams();
    if (filters.usageType) params.set('usageType', filters.usageType);
    if (filters.maxRate != null) params.set('maxRate', String(filters.maxRate));
    const qs = params.toString();
    return this.request<DormantListing[]>('GET', `/listings/search${qs ? `?${qs}` : ''}`);
  }
  updateListingStatus(listingId: string, status: ListingStatus) {
    return this.request<DormantListing>('POST', `/listings/${listingId}/status`, { status });
  }
  getBookingsByListing(listingId: string) {
    return this.request<UsageBooking[]>('GET', `/listings/${listingId}/bookings`);
  }

  // ── Bookings ──────────────────────────────────────────────────────────
  requestBooking(data: { listingId: string; renterId: string; usageType: DormantUsageType; startDate: string; endDate: string; renterNotes?: string }) {
    return this.request<UsageBooking>('POST', '/bookings', data);
  }
  getBooking(bookingId: string) {
    return this.request<UsageBooking>('GET', `/bookings/${bookingId}`);
  }
  getBookingsByRenter(renterId: string) {
    return this.request<UsageBooking[]>('GET', `/bookings/renter/${renterId}`);
  }
  getBookingsByOwner(ownerId: string) {
    return this.request<UsageBooking[]>('GET', `/bookings/owner/${ownerId}`);
  }
  confirmBooking(bookingId: string, usageAgreementNotes?: string) {
    return this.request<UsageBooking>('POST', `/bookings/${bookingId}/confirm`, { usageAgreementNotes });
  }
  rejectBooking(bookingId: string, reason: string) {
    return this.request<UsageBooking>('POST', `/bookings/${bookingId}/reject`, { reason });
  }
  cancelBooking(bookingId: string, reason: string) {
    return this.request<UsageBooking>('POST', `/bookings/${bookingId}/cancel`, { reason });
  }
  activateBooking(bookingId: string) {
    return this.request<UsageBooking>('POST', `/bookings/${bookingId}/activate`);
  }
  completeBooking(bookingId: string) {
    return this.request<UsageBooking>('POST', `/bookings/${bookingId}/complete`);
  }
}

let _sharedClient: DormantLandClient | null = null;
export const getDormantLandClient = (): DormantLandClient => {
  if (!_sharedClient) _sharedClient = new DormantLandClient();
  return _sharedClient;
};
