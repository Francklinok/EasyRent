import { getRestApiService } from '../restApiService/restApiService';

export type BookingLegStatus =
  | 'pending_selection' | 'held' | 'awaiting_owner' | 'awaiting_client_fallback_approval' | 'confirmed'
  | 'checked_in' | 'completed' | 'cancelled' | 'failed_no_fallback';

export type MasterBookingStatus =
  | 'draft' | 'payment_pending' | 'confirmed' | 'partially_failed' | 'completed' | 'cancelled';

export interface BookingLeg {
  id: string;
  masterBookingId: string;
  city: string;
  country?: string;
  propertyId: string;
  ownerId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  currency: string;
  status: BookingLegStatus;
  holdExpiresAt?: string;
  ownerDecisionDeadline?: string;
  proposedFallbackPropertyId?: string;
  proposedFallbackAmount?: number;
  cancelReason?: string;
  confirmedAt?: string;
  createdAt: string;
}

export interface MasterBookingTrip {
  id: string;
  tripReference: string;
  status: MasterBookingStatus;
  totalAmount: number;
  currency: string;
  depositAmount: number;
  invoiceId?: string;
  paymentIntentId?: string;
  subscriptionTier: 'nomad_basic' | 'nomad_plus';
  legs: BookingLeg[];
  createdAt: string;
}

export interface NetworkProperty {
  id: string;
  title: string;
  address: string;
  images?: { url?: string }[] | string[];
  ownerCriteria?: { monthlyRent?: number; currency?: string };
  generalHInfo?: { area?: string; bedrooms?: number };
  networkCity?: string;
}

class MultiCityBookingService {
  private static instance: MultiCityBookingService;

  static getInstance(): MultiCityBookingService {
    if (!MultiCityBookingService.instance) MultiCityBookingService.instance = new MultiCityBookingService();
    return MultiCityBookingService.instance;
  }

  private get rest() { return getRestApiService(); }

  async getNetworkCities(): Promise<string[]> {
    const res = await this.rest.get<any>('/multi-city/cities');
    return res.data ?? [];
  }

  async searchNetworkProperties(city: string, checkIn: string, checkOut: string): Promise<NetworkProperty[]> {
    const query = new URLSearchParams({ city, checkIn, checkOut });
    const res = await this.rest.get<any>(`/multi-city/properties?${query.toString()}`);
    return res.data ?? [];
  }

  async getDraftTrip(): Promise<MasterBookingTrip | null> {
    const res = await this.rest.get<any>('/multi-city/trips/draft');
    return res.data ?? null;
  }

  async addLeg(input: {
    city: string; country?: string; propertyId: string;
    checkIn: string; checkOut: string; tier?: 'nomad_basic' | 'nomad_plus';
  }): Promise<BookingLeg> {
    const res = await this.rest.post<any>('/multi-city/trips/draft/legs', input);
    return res.data;
  }

  async removeLeg(legId: string): Promise<void> {
    await this.rest.delete(`/multi-city/trips/draft/legs/${legId}`);
  }

  /**
   * Locks every leg and creates the single consolidated invoice for the
   * whole trip. Returns the invoiceId to feed into the existing generic
   * payment flow (walletService.initiatePayment/confirmPayment via
   * SelectPaymentMethod/MobileMoneyForm/CardPaymentForm/PayPalPaymentForm —
   * the exact same components the classic single-property booking screen
   * uses) rather than a second, parallel payment implementation.
   */
  async checkoutTrip(): Promise<{ tripId: string; tripReference: string; invoiceId: string; totalAmount: number; currency: string; legCount: number; holdExpiresAt: string }> {
    const res = await this.rest.post<any>('/multi-city/trips/draft/checkout', {});
    return res.data;
  }

  async releaseTripHold(tripId: string): Promise<void> {
    await this.rest.post('/multi-city/trips/draft/release-hold', { tripId });
  }

  async confirmTrip(tripId: string): Promise<MasterBookingTrip> {
    const res = await this.rest.post<any>(`/multi-city/trips/${tripId}/confirm`, {});
    return res.data;
  }

  async getMyTrips(page = 1, limit = 20): Promise<{ trips: MasterBookingTrip[]; total: number }> {
    const res = await this.rest.get<any>(`/multi-city/trips/my?page=${page}&limit=${limit}`);
    return { trips: res.trips ?? [], total: res.total ?? 0 };
  }

  async getTripById(tripId: string): Promise<MasterBookingTrip> {
    const res = await this.rest.get<any>(`/multi-city/trips/${tripId}`);
    return res.data;
  }

  async cancelLeg(legId: string, reason: string): Promise<BookingLeg> {
    const res = await this.rest.put<any>(`/multi-city/legs/${legId}/cancel`, { reason });
    return res.data;
  }

  /** Client accepts a proposed replacement property (higher-priced fallback). */
  async approveFallback(legId: string): Promise<BookingLeg> {
    const res = await this.rest.put<any>(`/multi-city/legs/${legId}/fallback/approve`, {});
    return res.data;
  }

  /** Client refuses the proposed replacement — the leg is refunded. */
  async refuseFallback(legId: string, reason?: string): Promise<BookingLeg> {
    const res = await this.rest.put<any>(`/multi-city/legs/${legId}/fallback/refuse`, { reason });
    return res.data;
  }

  // Owner side
  async getOwnerLegs(status?: BookingLegStatus, page = 1, limit = 20): Promise<{ legs: BookingLeg[]; total: number }> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set('status', status);
    const res = await this.rest.get<any>(`/multi-city/owner/legs?${query.toString()}`);
    return { legs: res.legs ?? [], total: res.total ?? 0 };
  }

  async confirmLegByOwner(legId: string): Promise<BookingLeg> {
    const res = await this.rest.put<any>(`/multi-city/owner/legs/${legId}/confirm`, {});
    return res.data;
  }

  async declineLegByOwner(legId: string, reason?: string): Promise<BookingLeg> {
    const res = await this.rest.put<any>(`/multi-city/owner/legs/${legId}/decline`, { reason });
    return res.data;
  }
}

export const getMultiCityBookingService = () => MultiCityBookingService.getInstance();
