import { getGraphQLService } from './graphqlService';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  location?: string;
  role: 'client' | 'landlord' | 'agent' | 'admin';
  isPremium: boolean;
  premiumPlan?: string;
  premiumExpiry?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  rating: number;
  responseTime?: string;
  preferences: {
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisible: boolean;
      activityTracking: boolean;
      dataCollection: boolean;
    };
    app: {
      language: string;
      currency: string;
      theme: string;
    };
  };
  stats: {
    totalTransactions: number;
    totalEarnings: number;
    propertiesListed: number;
    favoriteProperties: number;
    walletBalance: number;
    cryptoValue: number;
  };
  verification: {
    identity: boolean;
    address: boolean;
    income: boolean;
    documents: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photo?: string;
  location?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

export interface ProfileStats {
  propertiesCount: number;
  reservationsCount: number;
  reviewsCount: number;
  averageRating: number;
  totalEarnings: number;
  totalSpent: number;
  memberSince: string;
  verificationLevel: string;
}

export class ProfileService {
  private graphqlService = getGraphQLService();

  async getProfile(userId: string): Promise<UserProfile> {
    const query = `
      query GetProfile($userId: ID!) {
        user(id: $userId) {
          id
          firstName
          lastName
          email
          phone
          photo
          role
          isPremium
          premiumPlan
          premiumExpiry
          isEmailVerified
          isPhoneVerified
          trustLevel
          rating
          responseTime
          preferences {
            notifications {
              push
              email
              sms
              marketing
            }
            language
            currency
            theme
          }
          stats {
            totalProperties
            totalReservations
            totalTransactions
            memberSince
          }
          verification {
            email
            phone
            identity
            address
            level
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    const user = response.user;
    
    return {
      ...user,
      location: user.address?.city || '',
      stats: {
        totalTransactions: user.stats?.totalTransactions || 0,
        totalEarnings: user.stats?.totalEarnings || 0,
        propertiesListed: user.stats?.totalProperties || 0,
        favoriteProperties: 0,
        walletBalance: 0,
        cryptoValue: 0
      },
      preferences: {
        notifications: user.preferences?.notifications || { push: true, email: true, sms: false, marketing: false },
        privacy: { profileVisible: true, activityTracking: true, dataCollection: true },
        app: {
          language: user.preferences?.language || 'fr',
          currency: user.preferences?.currency || 'EUR',
          theme: user.preferences?.theme || 'system'
        }
      },
      verification: {
        identity: user.verification?.identity || false,
        address: user.verification?.address || false,
        income: false,
        documents: []
      }
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const mutation = `
      mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
          id
          firstName
          lastName
          email
          phone
          photo
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { input });
    return response.updateProfile;
  }

  async upgradeToPremuim(userId: string, planId: string, paymentMethod: string): Promise<boolean> {
    const mutation = `
      mutation UpgradeToPremium($userId: ID!, $planId: String!, $paymentMethod: String!) {
        upgradeToPremium(userId: $userId, planId: $planId, paymentMethod: $paymentMethod) {
          success
          premiumExpiry
          transactionId
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, planId, paymentMethod });
    return response.upgradeToPremium.success;
  }

  async getProfileStats(): Promise<ProfileStats> {
    const query = `
      query GetProfileStats {
        profileStats {
          propertiesCount
          reservationsCount
          reviewsCount
          averageRating
          totalEarnings
          totalSpent
          memberSince
          verificationLevel
        }
      }
    `;

    const response = await this.graphqlService.query(query, {});
    return response.profileStats;
  }

  async verifyIdentity(userId: string, documentType: string, documentData: string): Promise<boolean> {
    const mutation = `
      mutation VerifyIdentity($userId: ID!, $documentType: String!, $documentData: String!) {
        verifyIdentity(userId: $userId, documentType: $documentType, documentData: $documentData) {
          success
          verificationLevel
          trustLevel
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, documentType, documentData });
    return response.verifyIdentity.success;
  }

  async updateNotificationSettings(userId: string, settings: UserProfile['preferences']['notifications']): Promise<boolean> {
    const mutation = `
      mutation UpdateNotificationSettings($userId: ID!, $settings: NotificationSettingsInput!) {
        updateNotificationSettings(userId: $userId, settings: $settings) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, settings });
    return response.updateNotificationSettings.success;
  }

  async updatePrivacySettings(userId: string, settings: UserProfile['preferences']['privacy']): Promise<boolean> {
    const mutation = `
      mutation UpdatePrivacySettings($userId: ID!, $settings: PrivacySettingsInput!) {
        updatePrivacySettings(userId: $userId, settings: $settings) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, settings });
    return response.updatePrivacySettings.success;
  }

  async exportUserData(userId: string): Promise<{ downloadUrl: string; expiresAt: string }> {
    const mutation = `
      mutation ExportUserData($userId: ID!) {
        exportUserData(userId: $userId) {
          downloadUrl
          expiresAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId });
    return response.exportUserData;
  }

  async deleteAccount(userId: string, reason?: string): Promise<boolean> {
    const mutation = `
      mutation DeleteAccount($userId: ID!, $reason: String) {
        deleteAccount(userId: $userId, reason: $reason) {
          success
          deletedAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, reason });
    return response.deleteAccount.success;
  }

  async getTrustScore(userId: string): Promise<{
    score: number;
    level: string;
    factors: Array<{ name: string; value: number; weight: number }>;
    nextLevelRequirements: string[];
  }> {
    // trustScore query not yet implemented on backend
    // Return default values to avoid GraphQL errors
    return {
      score: 0,
      level: 'unverified',
      factors: [],
      nextLevelRequirements: [],
    };
  }

  async uploadProfilePhoto(userId: string, photoFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('userId', userId);

    const response = await fetch('/api/upload/profile-photo', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result.photoUrl;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    const mutation = `
      mutation UpdateUserPreferences($userId: ID!, $preferences: UserPreferencesInput!) {
        updateUserPreferences(userId: $userId, preferences: $preferences) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, preferences });
    return response.updateUserPreferences.success;
  }
}

// Export singleton instance
export const profileService = new ProfileService();