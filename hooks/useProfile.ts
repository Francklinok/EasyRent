import { useState, useEffect, useCallback } from 'react';
import { profileService, UserProfile, ProfileStats, UpdateProfileInput } from '@/services/api/profileService';

interface UseProfileResult {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  loading: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  upgradeToPremuim: (planId: string, paymentMethod: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<boolean>;
  verifyIdentity: (documentType: string, documentData: string) => Promise<boolean>;
  exportData: () => Promise<{ downloadUrl: string; expiresAt: string }>;
  deleteAccount: (reason?: string) => Promise<boolean>;
  uploadPhoto: (photoFile: File) => Promise<string>;
}

export function useProfile(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData] = await Promise.all([
        profileService.getProfile(userId),
        profileService.getProfileStats(userId)
      ]);

      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (input: UpdateProfileInput): Promise<boolean> => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateProfile(userId, input);
      setProfile(updatedProfile);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, [userId]);

  const upgradeToPremuim = useCallback(async (planId: string, paymentMethod: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await profileService.upgradeToPremuim(userId, planId, paymentMethod);
      if (success) {
        await loadProfile(); // Refresh profile to get updated premium status
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade to premium');
      return false;
    }
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    await loadProfile();
  }, [loadProfile]);

  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>): Promise<boolean> => {
    try {
      setError(null);
      const success = await profileService.updateUserPreferences(userId, preferences);
      if (success) {
        await loadProfile(); // Refresh to get updated preferences
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  }, [userId, loadProfile]);

  const verifyIdentity = useCallback(async (documentType: string, documentData: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await profileService.verifyIdentity(userId, documentType, documentData);
      if (success) {
        await loadProfile(); // Refresh to get updated verification status
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify identity');
      return false;
    }
  }, [userId, loadProfile]);

  const exportData = useCallback(async (): Promise<{ downloadUrl: string; expiresAt: string }> => {
    try {
      setError(null);
      return await profileService.exportUserData(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, [userId]);

  const deleteAccount = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      setError(null);
      return await profileService.deleteAccount(userId, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      return false;
    }
  }, [userId]);

  const uploadPhoto = useCallback(async (photoFile: File): Promise<string> => {
    try {
      setError(null);
      const photoUrl = await profileService.uploadProfilePhoto(userId, photoFile);
      await loadProfile(); // Refresh to get updated photo
      return photoUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    }
  }, [userId, loadProfile]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    upgradeToPremuim,
    refreshProfile,
    updatePreferences,
    verifyIdentity,
    exportData,
    deleteAccount,
    uploadPhoto
  };
}

interface UseTrustScoreResult {
  score: number;
  level: string;
  factors: Array<{ name: string; value: number; weight: number }>;
  nextLevelRequirements: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTrustScore(userId: string): UseTrustScoreResult {
  const [trustData, setTrustData] = useState<{
    score: number;
    level: string;
    factors: Array<{ name: string; value: number; weight: number }>;
    nextLevelRequirements: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrustScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getTrustScore(userId);
      setTrustData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trust score');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadTrustScore();
  }, [loadTrustScore]);

  useEffect(() => {
    if (userId) {
      loadTrustScore();
    }
  }, [userId, loadTrustScore]);

  return {
    score: trustData?.score || 0,
    level: trustData?.level || 'bronze',
    factors: trustData?.factors || [],
    nextLevelRequirements: trustData?.nextLevelRequirements || [],
    loading,
    error,
    refresh
  };
}