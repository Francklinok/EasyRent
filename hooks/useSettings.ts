import { useState, useEffect, useCallback } from 'react';
import {
  getSettingsService,
  PrivacySettings,
  SecuritySettings,
  GeneralSettings,
  AccountSettings,
  ActiveSession,
  BlockedUser,
  TwoFactorSetupResponse,
} from '@/services/api/settingsService';

// ==================== PRIVACY HOOK ====================

export function usePrivacySettings(userId: string) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settingsService = getSettingsService();

  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const [privacyData, blockedData] = await Promise.all([
        settingsService.getPrivacySettings(userId),
        settingsService.getBlockedUsers(userId),
      ]);
      setSettings(privacyData);
      setBlockedUsers(blockedData);
    } catch (err) {
      console.error('Error loading privacy settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId, settingsService]);

  const updateSettings = useCallback(async (newSettings: Partial<PrivacySettings>) => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updatePrivacySettings(userId, newSettings);
      setSettings(updated);
      return true;
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, settingsService]);

  const blockUser = useCallback(async (targetUserId: string) => {
    if (!userId) return false;

    try {
      const success = await settingsService.blockUser(userId, targetUserId);
      if (success) {
        await loadSettings();
      }
      return success;
    } catch (err) {
      console.error('Error blocking user:', err);
      return false;
    }
  }, [userId, settingsService, loadSettings]);

  const unblockUser = useCallback(async (targetUserId: string) => {
    if (!userId) return false;

    try {
      const success = await settingsService.unblockUser(userId, targetUserId);
      if (success) {
        setBlockedUsers(prev => prev.filter(u => u.id !== targetUserId));
      }
      return success;
    } catch (err) {
      console.error('Error unblocking user:', err);
      return false;
    }
  }, [userId, settingsService]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    blockedUsers,
    loading,
    saving,
    error,
    updateSettings,
    blockUser,
    unblockUser,
    refresh: loadSettings,
  };
}

// ==================== SECURITY HOOK ====================

export function useSecuritySettings(userId: string) {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupResponse | null>(null);

  const settingsService = getSettingsService();

  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const [securityData, sessionsData] = await Promise.all([
        settingsService.getSecuritySettings(userId),
        settingsService.getActiveSessions(userId),
      ]);
      setSettings(securityData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading security settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId, settingsService]);

  const updateSettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    if (!userId) return false;

    try {
      setActionLoading(true);
      setError(null);
      const updated = await settingsService.updateSecuritySettings(userId, newSettings);
      setSettings(updated);
      return true;
    } catch (err) {
      console.error('Error updating security settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  const setup2FA = useCallback(async (method: 'sms' | 'email' | 'authenticator') => {
    if (!userId) return null;

    try {
      setActionLoading(true);
      setError(null);
      const setupData = await settingsService.setup2FA(userId, method);
      setTwoFactorSetup(setupData);
      return setupData;
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  const verify2FA = useCallback(async (code: string) => {
    if (!userId) return { success: false, message: 'User not found' };

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.verify2FA(userId, code);
      if (result.success) {
        await loadSettings();
        setTwoFactorSetup(null);
      }
      return result;
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      const message = err instanceof Error ? err.message : 'Failed to verify code';
      setError(message);
      return { success: false, message };
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService, loadSettings]);

  const disable2FA = useCallback(async (password: string) => {
    if (!userId) return { success: false, message: 'User not found' };

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.disable2FA(userId, password);
      if (result.success) {
        await loadSettings();
      }
      return result;
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(message);
      return { success: false, message };
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService, loadSettings]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!userId) return { success: false, message: 'User not found' };

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.changePassword(userId, currentPassword, newPassword);
      if (result.success) {
        await loadSettings();
      }
      return result;
    } catch (err) {
      console.error('Error changing password:', err);
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
      return { success: false, message };
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService, loadSettings]);

  const revokeSession = useCallback(async (sessionId: string) => {
    if (!userId) return false;

    try {
      setActionLoading(true);
      const success = await settingsService.revokeSession(userId, sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
      return success;
    } catch (err) {
      console.error('Error revoking session:', err);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  const revokeAllSessions = useCallback(async (exceptCurrent: boolean = true) => {
    if (!userId) return { success: false, revokedCount: 0 };

    try {
      setActionLoading(true);
      const result = await settingsService.revokeAllSessions(userId, exceptCurrent);
      if (result.success) {
        if (exceptCurrent) {
          setSessions(prev => prev.filter(s => s.isCurrent));
        } else {
          setSessions([]);
        }
      }
      return result;
    } catch (err) {
      console.error('Error revoking all sessions:', err);
      return { success: false, revokedCount: 0 };
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    sessions,
    loading,
    actionLoading,
    error,
    twoFactorSetup,
    updateSettings,
    setup2FA,
    verify2FA,
    disable2FA,
    changePassword,
    revokeSession,
    revokeAllSessions,
    refresh: loadSettings,
  };
}

// ==================== ACCOUNT HOOK ====================

export function useAccountSettings(userId: string) {
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settingsService = getSettingsService();

  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getAccountSettings(userId);
      setSettings(data);
    } catch (err) {
      console.error('Error loading account settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId, settingsService]);

  const updateProfile = useCallback(async (input: any) => {
    if (!userId) return null;

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.updateProfile(userId, input);
      await loadSettings();
      return result;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService, loadSettings]);

  const deleteAccount = useCallback(async (password: string, reason?: string) => {
    if (!userId) return { success: false, message: 'User not found' };

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.deleteAccount(userId, password, reason);
      return result;
    } catch (err) {
      console.error('Error deleting account:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setError(message);
      return { success: false, message };
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  const exportData = useCallback(async () => {
    if (!userId) return null;

    try {
      setActionLoading(true);
      setError(null);
      const result = await settingsService.exportUserData(userId);
      return result;
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [userId, settingsService]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    actionLoading,
    error,
    updateProfile,
    deleteAccount,
    exportData,
    refresh: loadSettings,
  };
}

// ==================== GENERAL SETTINGS HOOK ====================

export function useGeneralSettings(userId: string) {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settingsService = getSettingsService();

  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getGeneralSettings(userId);
      setSettings(data);
    } catch (err) {
      console.error('Error loading general settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId, settingsService]);

  const updateSettings = useCallback(async (newSettings: Partial<GeneralSettings>) => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updateGeneralSettings(userId, newSettings);
      setSettings(updated);
      return true;
    } catch (err) {
      console.error('Error updating general settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, settingsService]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    refresh: loadSettings,
  };
}
