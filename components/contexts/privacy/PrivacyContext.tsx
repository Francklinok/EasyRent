import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../authContext/AuthContext';
import { getSettingsService, PrivacySettings } from '@/services/api/settingsService';

interface PrivacyContextType {
  privacySettings: PrivacySettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
  // Helper functions for quick checks
  canShowEmail: (targetUserId?: string) => boolean;
  canShowPhone: (targetUserId?: string) => boolean;
  canShowAddress: (targetUserId?: string) => boolean;
  canShowOnlineStatus: (targetUserId?: string) => boolean;
  canShowLastActive: (targetUserId?: string) => boolean;
  isReadReceiptsEnabled: () => boolean;
}

const defaultPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showEmail: true,
  showPhone: true,
  showAddress: true,
  showOnlineStatus: true,
  showLastActive: true,
  allowSearchByEmail: true,
  allowSearchByPhone: true,
  dataSharing: {
    analytics: true,
    thirdParty: false,
    marketing: false,
    personalization: true,
  },
  activityTracking: true,
  locationSharing: true,
  readReceipts: true,
};

const PrivacyContext = createContext<PrivacyContextType>({
  privacySettings: null,
  loading: true,
  refresh: async () => {},
  canShowEmail: () => true,
  canShowPhone: () => true,
  canShowAddress: () => true,
  canShowOnlineStatus: () => true,
  canShowLastActive: () => true,
  isReadReceiptsEnabled: () => true,
});

export const usePrivacy = () => useContext(PrivacyContext);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user?.id) {
      setPrivacySettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = getSettingsService();
      const settings = await settingsService.getPrivacySettings(user.id);
      setPrivacySettings(settings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      setPrivacySettings(defaultPrivacy);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const canShowEmail = useCallback((_targetUserId?: string) => {
    return privacySettings?.showEmail ?? true;
  }, [privacySettings]);

  const canShowPhone = useCallback((_targetUserId?: string) => {
    return privacySettings?.showPhone ?? true;
  }, [privacySettings]);

  const canShowAddress = useCallback((_targetUserId?: string) => {
    return privacySettings?.showAddress ?? true;
  }, [privacySettings]);

  const canShowOnlineStatus = useCallback((_targetUserId?: string) => {
    return privacySettings?.showOnlineStatus ?? true;
  }, [privacySettings]);

  const canShowLastActive = useCallback((_targetUserId?: string) => {
    return privacySettings?.showLastActive ?? true;
  }, [privacySettings]);

  const isReadReceiptsEnabled = useCallback(() => {
    return privacySettings?.readReceipts ?? true;
  }, [privacySettings]);

  return (
    <PrivacyContext.Provider value={{
      privacySettings,
      loading,
      refresh: loadSettings,
      canShowEmail,
      canShowPhone,
      canShowAddress,
      canShowOnlineStatus,
      canShowLastActive,
      isReadReceiptsEnabled,
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};
