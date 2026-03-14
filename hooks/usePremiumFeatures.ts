import { useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUser } from '@/components/contexts/user/UserContext';
import { useLanguage } from '@/components/contexts/language';
import { router } from 'expo-router';

type UserRole = 'buyer' | 'seller' | 'renter' | 'owner' | 'agent' | 'developer' | 'client' | 'admin' | 'super_admin';

export interface PremiumFeatures {
  isPremium: boolean;
  isExpired: boolean;
  userRole: string;
  isOwnerRole: boolean;
  isClientRole: boolean;

  // === OWNER FEATURES ===
  hasBoostVisibility: boolean;
  hasAdvancedStats: boolean;
  hasMarketAnalysis: boolean;
  hasTenantScreening: boolean;
  hasAutoRentReceipt: boolean;
  hasMultiPropertyDashboard: boolean;
  hasRentReminder: boolean;
  hasMaintenanceTracker: boolean;
  hasDocumentVault: boolean;
  hasRevenueReport: boolean;
  hasOwnerPrioritySupport: boolean;
  hasVerifiedOwnerBadge: boolean;

  // === CLIENT FEATURES ===
  hasSmartRecommendation: boolean;
  hasOwnerInfo: boolean;
  hasPriorityVisit: boolean;
  hasEarlyAccess: boolean;
  hasInstantAlerts: boolean;
  hasPriceHistory: boolean;
  hasNeighborhoodInsights: boolean;
  hasVirtualTourPriority: boolean;
  hasNegotiationAssist: boolean;
  hasSavedSearchUnlimited: boolean;
  hasDocumentChecklist: boolean;
  hasMoveAssistant: boolean;

  // === COMMON FEATURES ===
  hasNoAds: boolean;
  hasPriorityContact: boolean;
  hasVerifiedListings: boolean;
  hasAIPredictions: boolean;
  hasPriceHeatmap: boolean;
  hasFullHistory: boolean;
  hasFamilySharing: boolean;
  hasCryptoPayment: boolean;

  // Helper
  requirePremium: (featureName?: string) => boolean;
}

const OWNER_ROLES: string[] = ['owner', 'seller', 'agent', 'developer'];
const CLIENT_ROLES: string[] = ['buyer', 'renter', 'client'];

export function usePremiumFeatures(): PremiumFeatures {
  const { user, checkPremiumStatus } = useUser();
  const { t } = useLanguage();

  const isPremium = checkPremiumStatus();

  const userRole = user?.role || 'client';

  const isOwnerRole = useMemo(
    () => OWNER_ROLES.includes(userRole),
    [userRole]
  );

  const isClientRole = useMemo(
    () => CLIENT_ROLES.includes(userRole) || !isOwnerRole,
    [userRole, isOwnerRole]
  );

  const isExpired = useMemo(() => {
    if (!user?.premiumExpiry) return false;
    return new Date(user.premiumExpiry) < new Date();
  }, [user?.premiumExpiry]);

  const requirePremium = useCallback(
    (_featureName?: string): boolean => {
      if (isPremium) return true;

      Alert.alert(
        t('premium.premiumRequired'),
        t('premium.premiumRequiredMsg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('premium.upgradeToPremium'),
            onPress: () => router.push('/premium/Premium'),
          },
        ]
      );
      return false;
    },
    [isPremium, t]
  );

  // Owner features: premium + owner role
  const ownerPremium = isPremium && isOwnerRole;
  // Client features: premium + client role
  const clientPremium = isPremium && isClientRole;

  return {
    isPremium,
    isExpired,
    userRole,
    isOwnerRole,
    isClientRole,

    // Owner features
    hasBoostVisibility: ownerPremium,
    hasAdvancedStats: ownerPremium,
    hasMarketAnalysis: ownerPremium,
    hasTenantScreening: ownerPremium,
    hasAutoRentReceipt: ownerPremium,
    hasMultiPropertyDashboard: ownerPremium,
    hasRentReminder: ownerPremium,
    hasMaintenanceTracker: ownerPremium,
    hasDocumentVault: ownerPremium,
    hasRevenueReport: ownerPremium,
    hasOwnerPrioritySupport: ownerPremium,
    hasVerifiedOwnerBadge: ownerPremium,

    // Client features
    hasSmartRecommendation: clientPremium,
    hasOwnerInfo: clientPremium,
    hasPriorityVisit: clientPremium,
    hasEarlyAccess: clientPremium,
    hasInstantAlerts: clientPremium,
    hasPriceHistory: clientPremium,
    hasNeighborhoodInsights: clientPremium,
    hasVirtualTourPriority: clientPremium,
    hasNegotiationAssist: clientPremium,
    hasSavedSearchUnlimited: clientPremium,
    hasDocumentChecklist: clientPremium,
    hasMoveAssistant: clientPremium,

    // Common features (all premium users)
    hasNoAds: isPremium,
    hasPriorityContact: isPremium,
    hasVerifiedListings: isPremium,
    hasAIPredictions: isPremium,
    hasPriceHeatmap: isPremium,
    hasFullHistory: isPremium,
    hasFamilySharing: isPremium,
    hasCryptoPayment: isPremium,

    requirePremium,
  };
}
