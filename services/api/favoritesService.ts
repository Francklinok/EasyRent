import { getGraphQLService } from './graphqlService';

export interface FavoriteProperty {
  id: string;
  userId: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    type: 'house' | 'apartment' | 'land' | 'commercial';
    location: {
      address: string;
      city: string;
      postalCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    price: {
      sale?: number;
      rent?: number;
      currency: string;
    };
    surface: number;
    rooms?: number;
    features: {
      bedrooms?: number;
      bathrooms?: number;
      parking?: boolean;
      garden?: boolean;
      terrace?: boolean;
      pool?: boolean;
      elevator?: boolean;
    };
    media: {
      thumbnailUrl: string;
      images: string[];
      videos?: string[];
      virtualTour?: string;
    };
    agent: {
      id: string;
      name: string;
      phone?: string;
      email?: string;
      agency?: string;
    };
    isAvailable: boolean;
    isPremiumListing: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
  };
  addedAt: string;
  notes?: string;
  tags: string[];
  notifications: {
    priceChanges: boolean;
    statusChanges: boolean;
    similarProperties: boolean;
  };
  lastViewed?: string;
  viewCount: number;
}

export interface FavoriteStats {
  totalFavorites: number;
  availableProperties: number;
  premiumListings: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  locationDistribution: Array<{
    city: string;
    count: number;
    percentage: number;
  }>;
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  recentlyAdded: number;
  priceAlerts: number;
}

export interface FavoriteFilters {
  type?: 'house' | 'apartment' | 'land' | 'commercial';
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    radius?: number;
  };
  availability?: 'all' | 'available' | 'unavailable';
  premiumOnly?: boolean;
  sortBy?: 'dateAdded' | 'price' | 'location' | 'lastViewed';
  sortOrder?: 'asc' | 'desc';
}

export interface PriceAlert {
  id: string;
  userId: string;
  propertyId: string;
  type: 'decrease' | 'increase' | 'any';
  threshold: number;
  percentage?: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export class FavoritesService {
  private graphqlService = getGraphQLService();

  async getFavorites(userId: string, filters?: FavoriteFilters): Promise<FavoriteProperty[]> {
    const query = `
      query GetFavorites($userId: ID!, $filters: FavoriteFiltersInput) {
        favorites(userId: $userId, filters: $filters) {
          id
          userId
          propertyId
          property {
            id
            title
            type
            location {
              address
              city
              postalCode
              country
              coordinates {
                latitude
                longitude
              }
            }
            price {
              sale
              rent
              currency
            }
            surface
            rooms
            features {
              bedrooms
              bathrooms
              parking
              garden
              terrace
              pool
              elevator
            }
            media {
              thumbnailUrl
              images
              videos
              virtualTour
            }
            agent {
              id
              name
              phone
              email
              agency
            }
            isAvailable
            isPremiumListing
            views
            createdAt
            updatedAt
          }
          addedAt
          notes
          tags
          notifications {
            priceChanges
            statusChanges
            similarProperties
          }
          lastViewed
          viewCount
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId, filters });
    return response.favorites;
  }

  async addToFavorites(userId: string, propertyId: string, notes?: string, tags?: string[]): Promise<FavoriteProperty> {
    const mutation = `
      mutation AddToFavorites($userId: ID!, $propertyId: ID!, $notes: String, $tags: [String!]) {
        addToFavorites(userId: $userId, propertyId: $propertyId, notes: $notes, tags: $tags) {
          id
          userId
          propertyId
          property {
            id
            title
            type
            location {
              city
              country
            }
            price {
              sale
              rent
              currency
            }
            media {
              thumbnailUrl
            }
            isAvailable
            isPremiumListing
          }
          addedAt
          notes
          tags
          notifications {
            priceChanges
            statusChanges
            similarProperties
          }
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId, notes, tags });
    return response.addToFavorites;
  }

  async removeFromFavorites(userId: string, propertyId: string): Promise<boolean> {
    const mutation = `
      mutation RemoveFromFavorites($userId: ID!, $propertyId: ID!) {
        removeFromFavorites(userId: $userId, propertyId: $propertyId) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId });
    return response.removeFromFavorites.success;
  }

  async updateFavoriteNotes(userId: string, propertyId: string, notes: string): Promise<boolean> {
    const mutation = `
      mutation UpdateFavoriteNotes($userId: ID!, $propertyId: ID!, $notes: String!) {
        updateFavoriteNotes(userId: $userId, propertyId: $propertyId, notes: $notes) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId, notes });
    return response.updateFavoriteNotes.success;
  }

  async updateFavoriteTags(userId: string, propertyId: string, tags: string[]): Promise<boolean> {
    const mutation = `
      mutation UpdateFavoriteTags($userId: ID!, $propertyId: ID!, $tags: [String!]!) {
        updateFavoriteTags(userId: $userId, propertyId: $propertyId, tags: $tags) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId, tags });
    return response.updateFavoriteTags.success;
  }

  async updateNotificationSettings(
    userId: string,
    propertyId: string,
    notifications: FavoriteProperty['notifications']
  ): Promise<boolean> {
    const mutation = `
      mutation UpdateFavoriteNotifications(
        $userId: ID!,
        $propertyId: ID!,
        $notifications: FavoriteNotificationSettingsInput!
      ) {
        updateFavoriteNotifications(
          userId: $userId,
          propertyId: $propertyId,
          notifications: $notifications
        ) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId, notifications });
    return response.updateFavoriteNotifications.success;
  }

  async getFavoriteStats(userId: string): Promise<FavoriteStats> {
    const query = `
      query GetFavoriteStats($userId: ID!) {
        favoriteStats(userId: $userId) {
          totalFavorites
          availableProperties
          premiumListings
          averagePrice
          priceRange {
            min
            max
          }
          locationDistribution {
            city
            count
            percentage
          }
          typeDistribution {
            type
            count
            percentage
          }
          recentlyAdded
          priceAlerts
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.favoriteStats;
  }

  async trackPropertyView(userId: string, propertyId: string): Promise<boolean> {
    const mutation = `
      mutation TrackPropertyView($userId: ID!, $propertyId: ID!) {
        trackPropertyView(userId: $userId, propertyId: $propertyId) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyId });
    return response.trackPropertyView.success;
  }

  async createPriceAlert(
    userId: string,
    propertyId: string,
    type: 'decrease' | 'increase' | 'any',
    threshold: number,
    percentage?: number
  ): Promise<PriceAlert> {
    const mutation = `
      mutation CreatePriceAlert(
        $userId: ID!,
        $propertyId: ID!,
        $type: PriceAlertType!,
        $threshold: Float!,
        $percentage: Float
      ) {
        createPriceAlert(
          userId: $userId,
          propertyId: $propertyId,
          type: $type,
          threshold: $threshold,
          percentage: $percentage
        ) {
          id
          userId
          propertyId
          type
          threshold
          percentage
          isActive
          createdAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      userId,
      propertyId,
      type,
      threshold,
      percentage
    });
    return response.createPriceAlert;
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const query = `
      query GetPriceAlerts($userId: ID!) {
        priceAlerts(userId: $userId) {
          id
          userId
          propertyId
          type
          threshold
          percentage
          isActive
          createdAt
          triggeredAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.priceAlerts;
  }

  async togglePriceAlert(userId: string, alertId: string, isActive: boolean): Promise<boolean> {
    const mutation = `
      mutation TogglePriceAlert($userId: ID!, $alertId: ID!, $isActive: Boolean!) {
        togglePriceAlert(userId: $userId, alertId: $alertId, isActive: $isActive) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, alertId, isActive });
    return response.togglePriceAlert.success;
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<boolean> {
    const mutation = `
      mutation DeletePriceAlert($userId: ID!, $alertId: ID!) {
        deletePriceAlert(userId: $userId, alertId: $alertId) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, alertId });
    return response.deletePriceAlert.success;
  }

  async getSimilarProperties(userId: string, propertyId: string, limit: number = 5): Promise<any[]> {
    const query = `
      query GetSimilarProperties($userId: ID!, $propertyId: ID!, $limit: Int!) {
        similarProperties(userId: $userId, propertyId: $propertyId, limit: $limit) {
          id
          title
          type
          location {
            city
            country
          }
          price {
            sale
            rent
            currency
          }
          surface
          media {
            thumbnailUrl
          }
          similarity
          reasons
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId, propertyId, limit });
    return response.similarProperties;
  }

  async exportFavorites(userId: string, format: 'json' | 'csv' | 'pdf'): Promise<{
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  }> {
    const mutation = `
      mutation ExportFavorites($userId: ID!, $format: ExportFormat!) {
        exportFavorites(userId: $userId, format: $format) {
          downloadUrl
          filename
          expiresAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, format });
    return response.exportFavorites;
  }

  async bulkRemoveFavorites(userId: string, propertyIds: string[]): Promise<{
    success: boolean;
    removedCount: number;
    failedIds: string[];
  }> {
    const mutation = `
      mutation BulkRemoveFavorites($userId: ID!, $propertyIds: [ID!]!) {
        bulkRemoveFavorites(userId: $userId, propertyIds: $propertyIds) {
          success
          removedCount
          failedIds
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, propertyIds });
    return response.bulkRemoveFavorites;
  }

  async shareFavoritesList(userId: string, recipientEmail: string, message?: string): Promise<boolean> {
    const mutation = `
      mutation ShareFavoritesList($userId: ID!, $recipientEmail: String!, $message: String) {
        shareFavoritesList(userId: $userId, recipientEmail: $recipientEmail, message: $message) {
          success
          shareUrl
          expiresAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, recipientEmail, message });
    return response.shareFavoritesList.success;
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();