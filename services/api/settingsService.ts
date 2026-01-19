import { getGraphQLService } from './graphqlService';

// ==================== TYPES ====================

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
  dataSharing: {
    analytics: boolean;
    thirdParty: boolean;
    marketing: boolean;
    personalization: boolean;
  };
  activityTracking: boolean;
  locationSharing: boolean;
  readReceipts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'email' | 'authenticator' | null;
  loginNotifications: boolean;
  biometricEnabled: boolean;
  trustedDevicesEnabled: boolean;
  maxActiveSessions: number;
  lastPasswordChange: string | null;
  lastSecurityCheck: string | null;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface BlockedUser {
  id: string;
  username: string;
  avatar: string | null;
  blockedAt: string;
}

export interface AccountSettings {
  email: string;
  phoneNumber: string | null;
  username: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface GeneralSettings {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// ==================== GRAPHQL QUERIES ====================

const PRIVACY_SETTINGS_QUERY = `
  query GetPrivacySettings($userId: ID!) {
    privacySettings(userId: $userId) {
      profileVisibility
      showEmail
      showPhone
      showAddress
      showOnlineStatus
      showLastActive
      allowSearchByEmail
      allowSearchByPhone
      dataSharing {
        analytics
        thirdParty
        marketing
        personalization
      }
      activityTracking
      locationSharing
      readReceipts
    }
  }
`;

const UPDATE_PRIVACY_SETTINGS_MUTATION = `
  mutation UpdatePrivacySettings($userId: ID!, $input: PrivacySettingsInput!) {
    updatePrivacySettings(userId: $userId, input: $input) {
      profileVisibility
      showEmail
      showPhone
      showAddress
      showOnlineStatus
      showLastActive
      allowSearchByEmail
      allowSearchByPhone
      dataSharing {
        analytics
        thirdParty
        marketing
        personalization
      }
      activityTracking
      locationSharing
      readReceipts
    }
  }
`;

const SECURITY_SETTINGS_QUERY = `
  query GetSecuritySettings($userId: ID!) {
    securitySettings(userId: $userId) {
      twoFactorEnabled
      twoFactorMethod
      loginNotifications
      biometricEnabled
      trustedDevicesEnabled
      maxActiveSessions
      lastPasswordChange
      lastSecurityCheck
    }
  }
`;

const UPDATE_SECURITY_SETTINGS_MUTATION = `
  mutation UpdateSecuritySettings($input: UpdateSecuritySettingsInput!) {
    updateSecuritySettings(input: $input) {
      twoFactorEnabled
      twoFactorMethod
      loginNotifications
      biometricEnabled
      trustedDevicesEnabled
      maxActiveSessions
      lastPasswordChange
      lastSecurityCheck
    }
  }
`;

const ACTIVE_SESSIONS_QUERY = `
  query GetActiveSessions($userId: ID!) {
    activeSessions(userId: $userId) {
      id
      deviceName
      deviceType
      ipAddress
      location
      lastActive
      isCurrent
    }
  }
`;

const BLOCKED_USERS_QUERY = `
  query GetBlockedUsers($userId: ID!) {
    blockList(userId: $userId) {
      id
      username
      avatar
      blockedAt
    }
  }
`;

const ACCOUNT_SETTINGS_QUERY = `
  query GetAccountSettings($userId: ID!) {
    user(id: $userId) {
      email
      phoneNumber
      username
      isEmailVerified
      createdAt
      lastLogin
    }
  }
`;

const GENERAL_SETTINGS_QUERY = `
  query GetGeneralSettings($userId: ID!) {
    userPreferences(userId: $userId) {
      language
      currency
      timezone
      dateFormat
      notifications {
        email
        push
        sms
        marketing
      }
      theme
    }
  }
`;

const UPDATE_GENERAL_SETTINGS_MUTATION = `
  mutation UpdatePreferences($userId: ID!, $input: UpdatePreferencesInput!) {
    updatePreferences(userId: $userId, input: $input) {
      language
      currency
      timezone
      dateFormat
      notifications {
        email
        push
        sms
        marketing
      }
      theme
    }
  }
`;

const SETUP_2FA_MUTATION = `
  mutation Setup2FA($userId: ID!, $method: TwoFactorMethod!) {
    setup2FA(userId: $userId, method: $method) {
      secret
      qrCode
      backupCodes
    }
  }
`;

const VERIFY_2FA_MUTATION = `
  mutation Verify2FA($userId: ID!, $code: String!) {
    verify2FA(userId: $userId, code: $code) {
      success
      message
    }
  }
`;

const DISABLE_2FA_MUTATION = `
  mutation Disable2FA($userId: ID!, $password: String!) {
    disable2FA(userId: $userId, password: $password) {
      success
      message
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($userId: ID!, $currentPassword: String!, $newPassword: String!) {
    changePassword(userId: $userId, currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

const REVOKE_SESSION_MUTATION = `
  mutation RevokeSession($userId: ID!, $sessionId: ID!) {
    revokeSession(userId: $userId, sessionId: $sessionId) {
      success
      message
    }
  }
`;

const REVOKE_ALL_SESSIONS_MUTATION = `
  mutation RevokeAllSessions($userId: ID!, $exceptCurrent: Boolean) {
    revokeAllSessions(userId: $userId, exceptCurrent: $exceptCurrent) {
      success
      message
      revokedCount
    }
  }
`;

const BLOCK_USER_MUTATION = `
  mutation BlockUser($userId: ID!, $targetUserId: ID!) {
    blockUser(userId: $userId, targetUserId: $targetUserId) {
      success
      message
    }
  }
`;

const UNBLOCK_USER_MUTATION = `
  mutation UnblockUser($userId: ID!, $targetUserId: ID!) {
    unblockUser(userId: $userId, targetUserId: $targetUserId) {
      success
      message
    }
  }
`;

const DELETE_ACCOUNT_MUTATION = `
  mutation DeleteAccount($userId: ID!, $password: String!, $reason: String) {
    deleteAccount(userId: $userId, password: $password, reason: $reason) {
      success
      message
    }
  }
`;

const EXPORT_DATA_MUTATION = `
  mutation ExportUserData($userId: ID!) {
    exportUserData(userId: $userId) {
      success
      downloadUrl
      expiresAt
    }
  }
`;

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($userId: ID!, $input: UpdateProfileInput!) {
    updateProfile(userId: $userId, input: $input) {
      id
      firstName
      lastName
      username
      phoneNumber
      email
    }
  }
`;

// ==================== SERVICE CLASS ====================

class SettingsService {
  private graphqlService = getGraphQLService();

  // ==================== PRIVACY ====================

  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const response = await this.graphqlService.query<{ privacySettings: PrivacySettings }>(
        PRIVACY_SETTINGS_QUERY,
        { userId }
      );
      return response.privacySettings;
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      // Return defaults if not found
      return {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showAddress: false,
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
    }
  }

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await this.graphqlService.query<{ updatePrivacySettings: PrivacySettings }>(
      UPDATE_PRIVACY_SETTINGS_MUTATION,
      { userId, input: settings }
    );
    return response.updatePrivacySettings;
  }

  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    try {
      const response = await this.graphqlService.query<{ blockList: BlockedUser[] }>(
        BLOCKED_USERS_QUERY,
        { userId }
      );
      return response.blockList || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  }

  async blockUser(userId: string, targetUserId: string): Promise<boolean> {
    const response = await this.graphqlService.query<{ blockUser: { success: boolean } }>(
      BLOCK_USER_MUTATION,
      { userId, targetUserId }
    );
    return response.blockUser.success;
  }

  async unblockUser(userId: string, targetUserId: string): Promise<boolean> {
    const response = await this.graphqlService.query<{ unblockUser: { success: boolean } }>(
      UNBLOCK_USER_MUTATION,
      { userId, targetUserId }
    );
    return response.unblockUser.success;
  }

  // ==================== SECURITY ====================

  async getSecuritySettings(userId: string): Promise<SecuritySettings> {
    try {
      const response = await this.graphqlService.query<{ securitySettings: SecuritySettings }>(
        SECURITY_SETTINGS_QUERY,
        { userId }
      );
      return response.securitySettings;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        loginNotifications: true,
        biometricEnabled: false,
        trustedDevicesEnabled: false,
        maxActiveSessions: 5,
        lastPasswordChange: null,
        lastSecurityCheck: null,
      };
    }
  }

  async getActiveSessions(userId: string): Promise<ActiveSession[]> {
    try {
      const response = await this.graphqlService.query<{ activeSessions: ActiveSession[] }>(
        ACTIVE_SESSIONS_QUERY,
        { userId }
      );
      return response.activeSessions || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  async updateSecuritySettings(userId: string, settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await this.graphqlService.query<{ updateSecuritySettings: SecuritySettings }>(
      UPDATE_SECURITY_SETTINGS_MUTATION,
      { input: { userId, ...settings } }
    );
    return response.updateSecuritySettings;
  }

  async setup2FA(userId: string, method: 'sms' | 'email' | 'authenticator'): Promise<TwoFactorSetupResponse> {
    const response = await this.graphqlService.query<{ setup2FA: TwoFactorSetupResponse }>(
      SETUP_2FA_MUTATION,
      { userId, method }
    );
    return response.setup2FA;
  }

  async verify2FA(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const response = await this.graphqlService.query<{ verify2FA: { success: boolean; message: string } }>(
      VERIFY_2FA_MUTATION,
      { userId, code }
    );
    return response.verify2FA;
  }

  async disable2FA(userId: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await this.graphqlService.query<{ disable2FA: { success: boolean; message: string } }>(
      DISABLE_2FA_MUTATION,
      { userId, password }
    );
    return response.disable2FA;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await this.graphqlService.query<{ changePassword: { success: boolean; message: string } }>(
      CHANGE_PASSWORD_MUTATION,
      { userId, currentPassword, newPassword }
    );
    return response.changePassword;
  }

  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const response = await this.graphqlService.query<{ revokeSession: { success: boolean } }>(
      REVOKE_SESSION_MUTATION,
      { userId, sessionId }
    );
    return response.revokeSession.success;
  }

  async revokeAllSessions(userId: string, exceptCurrent: boolean = true): Promise<{ success: boolean; revokedCount: number }> {
    const response = await this.graphqlService.query<{ revokeAllSessions: { success: boolean; revokedCount: number } }>(
      REVOKE_ALL_SESSIONS_MUTATION,
      { userId, exceptCurrent }
    );
    return response.revokeAllSessions;
  }

  // ==================== ACCOUNT ====================

  async getAccountSettings(userId: string): Promise<AccountSettings> {
    try {
      const response = await this.graphqlService.query<{ user: AccountSettings }>(
        ACCOUNT_SETTINGS_QUERY,
        { userId }
      );
      return response.user;
    } catch (error) {
      console.error('Error fetching account settings:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<any> {
    const response = await this.graphqlService.query<{ updateProfile: any }>(
      UPDATE_PROFILE_MUTATION,
      { userId, input }
    );
    return response.updateProfile;
  }

  async deleteAccount(userId: string, password: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await this.graphqlService.query<{ deleteAccount: { success: boolean; message: string } }>(
      DELETE_ACCOUNT_MUTATION,
      { userId, password, reason }
    );
    return response.deleteAccount;
  }

  async exportUserData(userId: string): Promise<{ success: boolean; downloadUrl: string; expiresAt: string }> {
    const response = await this.graphqlService.query<{ exportUserData: { success: boolean; downloadUrl: string; expiresAt: string } }>(
      EXPORT_DATA_MUTATION,
      { userId }
    );
    return response.exportUserData;
  }

  // ==================== GENERAL ====================

  async getGeneralSettings(userId: string): Promise<GeneralSettings> {
    try {
      const response = await this.graphqlService.query<{ userPreferences: GeneralSettings }>(
        GENERAL_SETTINGS_QUERY,
        { userId }
      );
      return response.userPreferences;
    } catch (error) {
      console.error('Error fetching general settings:', error);
      return {
        language: 'fr',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        theme: 'system',
      };
    }
  }

  async updateGeneralSettings(userId: string, settings: Partial<GeneralSettings>): Promise<GeneralSettings> {
    const response = await this.graphqlService.query<{ updatePreferences: GeneralSettings }>(
      UPDATE_GENERAL_SETTINGS_MUTATION,
      { userId, input: settings }
    );
    return response.updatePreferences;
  }
}

// ==================== SINGLETON ====================

let settingsServiceInstance: SettingsService | null = null;

export const getSettingsService = (): SettingsService => {
  if (!settingsServiceInstance) {
    settingsServiceInstance = new SettingsService();
  }
  return settingsServiceInstance;
};

export default SettingsService;
