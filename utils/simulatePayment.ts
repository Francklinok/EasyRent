/**
 * simulatePayment.ts
 *
 * Payment simulation utility + contract generation.
 * Uses real activity and property data to generate
 * a professional contract identical to the real flow.
 */

import * as Print from 'expo-print';
import { getActivityService } from '@/services/api/activityService';
import generateProfessionalContractHTML from '@/components/utils/generateProfessionalContractHTML';
import { ContractType } from '@/types/contract';
import { Property, Reservation, User } from '@/types/type';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimulatePaymentOptions {
  /** Activity/Reservation ID in backend */
  activityId: string;
  /** Amount in property currency */
  amount: number;
  /** Simulated processing delay in ms (default: 1500) */
  delayMs?: number;
  /** Callback for real-time logs */
  onLog?: (msg: string) => void;
}

export interface SimulatePaymentResult {
  success: boolean;
  contractUri: string | null;
  message: string;
  /** Raw data returned by backend after payment */
  paymentData?: any;
  /** Total simulation duration in ms */
  durationMs: number;
}

// ─── Helper: Convert a URL image to base64 data URI ───────────────────────

async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', gif: 'image/gif'
    };
    const mime = mimeMap[ext] || 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return undefined;
  }
}

// ─── Main Simulation ────────────────────────────────────────────────────

/**
 * Simulates a complete payment and generates the PDF contract with real data.
 *
 * Steps:
 * 1. Retrieve real activity data (property, client, owner)
 * 2. Artificial delay (network simulation)
 * 3. Call backend `processPayment` via activityService
 * 4. Generate professional PDF with generateProfessionalContractHTML
 * 5. Save the URI in backend via `saveContractUrl`
 * 6. Return the complete result
 */
export async function simulatePayment(
  options: SimulatePaymentOptions
): Promise<SimulatePaymentResult> {
  const { activityId, amount, delayMs = 1500, onLog } = options;
  const startTime = Date.now();
  const log = (msg: string) => { onLog?.(msg); };

  try {
    // Step 1: retrieve real activity data
    log('📦 Retrieving real activity data...');
    const activityService = getActivityService();
    let activity: any = null;
    try {
      activity = await activityService.getActivity(activityId);
    } catch (fetchErr) {
      log(`⚠️ Impossible de récupérer l'activité: ${fetchErr}`);
    }

    const prop = activity?.property;
    const client = activity?.client;

    // Step 2: simulated network delay
    log('🌐 Connecting to payment server...');
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

    // Step 3: call backend processPayment
    log('💳 Processing payment...');
    let paymentData: any = null;
    try {
      paymentData = await activityService.processPayment(activityId, amount);
      log('✅ Payment validated by backend');
    } catch (backendErr) {
      log(`⚠️ Backend unavailable, local simulation: ${backendErr}`);
    }

    // Step 4: generate image as base64
    log('🖼️ Loading property image...');
    let propertyImage: string | undefined;
    const imageUrl = prop?.images?.[0];
    if (imageUrl && typeof imageUrl === 'string') {
      propertyImage = await fetchImageAsBase64(imageUrl);
      if (propertyImage) {
        log('✅ Image loaded successfully');
      } else {
        log('⚠️ Unable to load image (will continue without image)');
      }
    }

    // Step 5: generate professional PDF with real data
    log('📄 Generating professional contract...');

    const isPurchase = prop?.actionType === 'sell';
    const contractType = isPurchase ? ContractType.PURCHASE : ContractType.RENTAL;

    const currency = prop?.ownerCriteria?.currency || 'XAF';
    const monthlyRent = prop?.ownerCriteria?.monthlyRent || amount;
    const depositAmount = prop?.ownerCriteria?.depositAmount || 0;

    // Build Property / Reservation / User objects compatible with the generator
    const propertyObj: Property = {
      id: prop?.id || activityId,
      title: prop?.title || 'Propriété',
      address: prop?.address || '',
      surface: (prop?.generalHInfo?.surface || prop?.generalLandinfo?.surface || 0),
      rooms: prop?.generalHInfo?.rooms || 0,
      price: monthlyRent,
    } as unknown as Property;

    const reservationObj: Reservation = {
      id: activityId,
      startDate: activity?.reservationDate || new Date().toISOString(),
      endDate: '',
      monthlyRent,
      depositAmount,
      paymentDeadline: activity?.paymentDeadline || '',
    } as unknown as Reservation;

    const ownerUser: User = {
      id: prop?.ownerId || '',
      fullName: prop?.ownerName || 'Owner',
      email: prop?.ownerEmail || '',
      phone: prop?.ownerPhone || '',
      avatar: prop?.ownerAvatar || '',
    } as unknown as User;

    const clientUser: User = {
      id: client?.id || '',
      fullName: client?.fullName || activity?.bookingInfo?.fullName || 'Client',
      email: client?.email || '',
      avatar: client?.avatar || '',
    } as unknown as User;

    const html = generateProfessionalContractHTML({
      contractId: activityId,
      contractType,
      property: propertyObj,
      reservation: reservationObj,
      landlord: isPurchase ? undefined : ownerUser,
      tenant: isPurchase ? undefined : clientUser,
      seller: isPurchase ? ownerUser : undefined,
      buyer: isPurchase ? clientUser : undefined,
      purchasePrice: isPurchase ? amount : undefined,
      paymentMethod: prop?.ownerCriteria?.acceptedPaymentMethods?.[0] || 'Mobile Money',
      acceptanceDate: new Date(),
      propertyImage,
      rawProperty: {
        propertyType: prop?.propertyType,
        description: prop?.description,
        amenities: prop?.amenities,
        generalHInfo: prop?.generalHInfo,
        generalLandinfo: prop?.generalLandinfo,
        ownerCriteria: {
          minimumDuration: prop?.ownerCriteria?.minimumDuration,
          currency: prop?.ownerCriteria?.currency,
          acceptedPaymentMethods: prop?.ownerCriteria?.acceptedPaymentMethods,
        },
      },
    });

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      width: 612,
      height: 792,
    });
    log('✅ PDF Contract generated');

    // Step 6: save URI in backend
    log('💾 Saving contract...');
    try {
      await activityService.saveContractUrl(activityId, uri);
      log('✅ Contract saved');
    } catch (saveErr) {
      log(`⚠️ Unable to save contract URI: ${saveErr}`);
    }

    log('🎉 Simulation completed successfully!');

    return {
      success: true,
      contractUri: uri,
      message: 'Payment simulated successfully — professional contract generated',
      paymentData,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error('[simulatePayment] Error:', err);
    return {
      success: false,
      contractUri: null,
      message: err?.message || 'Payment simulation failed',
      durationMs: Date.now() - startTime,
    };
  }
}

// ─── Exported Helpers ─────────────────────────────────────────────────────────

/** Returns a random simulated amount in XOF between min and max */
export function getSimulatedAmount(min = 50_000, max = 500_000): number {
  return Math.round((Math.random() * (max - min) + min) / 1000) * 1000;
}

/** Format an XOF amount */
export function formatXOF(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
}
