/**
 * useOwnerPrivacy - Hook to fetch owner's privacy settings
 *
 * Used in property info pages to determine what owner info to display
 * based on the owner's privacy preferences.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSettingsService, PrivacySettings } from '@/services/api/settingsService';

export interface OwnerPrivacyInfo {
  canShowName: boolean;
  canShowEmail: boolean;
  canShowPhone: boolean;
  canShowAddress: boolean;
  loading: boolean;
}

interface UseOwnerPrivacyOptions {
  ownerId: string | undefined;
  enabled?: boolean;
}

/**
 * Hook to check what owner information can be displayed
 * based on the owner's privacy settings
 */
export function useOwnerPrivacy({ ownerId, enabled = true }: UseOwnerPrivacyOptions): OwnerPrivacyInfo {
  const [privacySettings, setPrivacySettings] = useState<Partial<PrivacySettings> | null>(null);
  const [loading, setLoading] = useState(false);

  const settingsService = useMemo(() => getSettingsService(), []);

  const loadOwnerPrivacy = useCallback(async () => {
    if (!ownerId || !enabled) {
      setPrivacySettings(null);
      return;
    }

    setLoading(true);
    try {
      const settings = await settingsService.getUserPrivacySettings(ownerId);
      setPrivacySettings(settings);
    } catch {
      // Default to not showing info on error
      setPrivacySettings({
        showEmail: false,
        showPhone: false,
        showAddress: false,
      });
    } finally {
      setLoading(false);
    }
  }, [ownerId, enabled, settingsService]);

  useEffect(() => {
    loadOwnerPrivacy();
  }, [loadOwnerPrivacy]);

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => ({
    // Name is always shown (profile visibility determines this)
    canShowName: privacySettings?.profileVisibility !== 'private',
    canShowEmail: privacySettings?.showEmail ?? false,
    canShowPhone: privacySettings?.showPhone ?? false,
    canShowAddress: privacySettings?.showAddress ?? false,
    loading,
  }), [privacySettings, loading]);
}

/**
 * Filter owner data based on privacy settings
 * Use this to clean owner object before passing to components
 */
export function filterOwnerByPrivacy(
  owner: any,
  privacy: OwnerPrivacyInfo
): any {
  if (!owner) return null;

  return {
    id: owner.id,
    name: privacy.canShowName ? (owner.name || 'Propriétaire') : 'Propriétaire',
    avatar: owner.avatar,
    // Only include if privacy allows
    email: privacy.canShowEmail ? owner.email : undefined,
    phone: privacy.canShowPhone ? owner.phone : undefined,
    address: privacy.canShowAddress ? owner.address : undefined,
  };
}

export default useOwnerPrivacy;
