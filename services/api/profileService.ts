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
  userId: string;
  period: 'week' | 'month' | 'year';
  transactions: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  earnings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  properties: {
    active: number;
    sold: number;
    rented: number;
    views: number;
  };
  activities: {
    total: number;
    recentCount: number;
    pendingCount: number;
  };
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
          location
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
            privacy {
              profileVisible
              activityTracking
              dataCollection
            }
            app {
              language
              currency
              theme
            }
          }
          stats {
            totalTransactions
            totalEarnings
            propertiesListed
            favoriteProperties
            walletBalance
            cryptoValue
          }
          verification {
            identity
            address
            income
            documents
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const mutation = `
      mutation UpdateProfile($userId: ID!, $input: UpdateProfileInput!) {
        updateProfile(userId: $userId, input: $input) {
          id
          firstName
          lastName
          email
          phone
          photo
          location
          preferences {
            notifications {
              push
              email
              sms
              marketing
            }
            privacy {
              profileVisible
              activityTracking
              dataCollection
            }
            app {
              language
              currency
              theme
            }
          }
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, input });
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

  async getProfileStats(userId: string, period: string = 'month'): Promise<ProfileStats> {
    const query = `
      query GetProfileStats($userId: ID!, $period: String!) {
        profileStats(userId: $userId, period: $period) {
          userId
          period
          transactions {
            total
            completed
            pending
            cancelled
          }
          earnings {
            total
            thisMonth
            lastMonth
            growth
          }
          properties {
            active
            sold
            rented
            views
          }
          activities {
            total
            recentCount
            pendingCount
          }
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId, period });
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
    const query = `
      query GetTrustScore($userId: ID!) {
        trustScore(userId: $userId) {
          score
          level
          factors {
            name
            value
            weight
          }
          nextLevelRequirements
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.trustScore;
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