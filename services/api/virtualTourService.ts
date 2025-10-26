import { getGraphQLService } from './graphqlService';

export interface VirtualTourPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  title: string;
  description: string;
  roomType: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'garden' | 'balcony' | 'garage' | 'office' | 'entrance';
  hotspots: VirtualTourHotspot[];
  panoramaUrl: string;
  thumbnail: string;
  audioUrl?: string;
  order: number;
}

export interface VirtualTourHotspot {
  id: string;
  x: number;
  y: number;
  type: 'navigation' | 'info' | 'measurement' | 'feature' | 'furniture';
  targetPointId?: string;
  content: {
    title: string;
    description?: string;
    mediaUrl?: string;
    measurementData?: {
      dimensions: string;
      surface: number;
      volume?: number;
    };
    furnitureData?: {
      brand: string;
      model: string;
      price?: number;
      purchaseUrl?: string;
    };
  };
  icon: string;
  color: string;
  animation: 'pulse' | 'bounce' | 'rotate' | 'static';
}

export interface VirtualTour {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  type: 'panoramic_360' | 'interactive_3d' | 'ar_walkthrough' | 'drone_aerial';
  status: 'active' | 'processing' | 'draft' | 'archived';
  quality: 'standard' | 'hd' | 'uhd_4k' | 'vr_ready';
  points: VirtualTourPoint[];
  settings: {
    autoPlay: boolean;
    showMiniMap: boolean;
    enableAudio: boolean;
    enableMeasurements: boolean;
    enableAR: boolean;
    startingPointId: string;
    transitionSpeed: number;
    uiTheme: 'light' | 'dark' | 'auto';
  };
  analytics: VirtualTourAnalytics;
  metadata: {
    captureDate: string;
    equipment: string;
    photographer: string;
    processingTime: number;
    fileSize: number;
    totalDuration: number;
  };
  pricing: {
    isPublic: boolean;
    requiresPremium: boolean;
    viewLimit?: number;
    scheduledTours: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VirtualTourAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageViewTime: number;
  completionRate: number;
  popularPoints: Array<{
    pointId: string;
    viewCount: number;
    averageTime: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    vr: number;
    ar: number;
  };
  engagementMetrics: {
    hotspotsClicked: number;
    measurementsTaken: number;
    screenshotsTaken: number;
    sharesCount: number;
  };
}

export interface VirtualTourSession {
  id: string;
  tourId: string;
  userId?: string;
  deviceType: 'mobile' | 'desktop' | 'vr' | 'ar';
  startTime: string;
  endTime?: string;
  pointsVisited: string[];
  interactionsLog: Array<{
    timestamp: string;
    type: 'navigation' | 'hotspot_click' | 'measurement' | 'screenshot' | 'share';
    pointId?: string;
    hotspotId?: string;
    data?: any;
  }>;
  feedbackRating?: number;
  feedbackComment?: string;
}

export interface CreateVirtualTourInput {
  propertyId: string;
  title: string;
  description: string;
  type: VirtualTour['type'];
  quality: VirtualTour['quality'];
  points: Omit<VirtualTourPoint, 'id'>[];
  settings: VirtualTour['settings'];
  metadata: VirtualTour['metadata'];
  pricing: VirtualTour['pricing'];
}

export interface UpdateVirtualTourInput {
  title?: string;
  description?: string;
  type?: VirtualTour['type'];
  quality?: VirtualTour['quality'];
  points?: VirtualTourPoint[];
  settings?: Partial<VirtualTour['settings']>;
  pricing?: Partial<VirtualTour['pricing']>;
}

export class VirtualTourService {
  private graphqlService = getGraphQLService();

  async getVirtualTour(tourId: string): Promise<VirtualTour> {
    const query = `
      query GetVirtualTour($tourId: ID!) {
        virtualTour(id: $tourId) {
          id
          propertyId
          title
          description
          type
          status
          quality
          points {
            id
            x
            y
            z
            title
            description
            roomType
            hotspots {
              id
              x
              y
              type
              targetPointId
              content {
                title
                description
                mediaUrl
                measurementData {
                  dimensions
                  surface
                  volume
                }
                furnitureData {
                  brand
                  model
                  price
                  purchaseUrl
                }
              }
              icon
              color
              animation
            }
            panoramaUrl
            thumbnail
            audioUrl
            order
          }
          settings {
            autoPlay
            showMiniMap
            enableAudio
            enableMeasurements
            enableAR
            startingPointId
            transitionSpeed
            uiTheme
          }
          analytics {
            totalViews
            uniqueViewers
            averageViewTime
            completionRate
            popularPoints {
              pointId
              viewCount
              averageTime
            }
            deviceBreakdown {
              mobile
              desktop
              vr
              ar
            }
            engagementMetrics {
              hotspotsClicked
              measurementsTaken
              screenshotsTaken
              sharesCount
            }
          }
          metadata {
            captureDate
            equipment
            photographer
            processingTime
            fileSize
            totalDuration
          }
          pricing {
            isPublic
            requiresPremium
            viewLimit
            scheduledTours
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { tourId });
    return response.virtualTour;
  }

  async getPropertyVirtualTours(propertyId: string): Promise<VirtualTour[]> {
    const query = `
      query GetPropertyVirtualTours($propertyId: ID!) {
        propertyVirtualTours(propertyId: $propertyId) {
          id
          propertyId
          title
          description
          type
          status
          quality
          analytics {
            totalViews
            uniqueViewers
            averageViewTime
            completionRate
          }
          pricing {
            isPublic
            requiresPremium
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { propertyId });
    return response.propertyVirtualTours;
  }

  async createVirtualTour(input: CreateVirtualTourInput): Promise<VirtualTour> {
    const mutation = `
      mutation CreateVirtualTour($input: CreateVirtualTourInput!) {
        createVirtualTour(input: $input) {
          id
          propertyId
          title
          description
          type
          status
          quality
          points {
            id
            x
            y
            z
            title
            description
            roomType
            panoramaUrl
            thumbnail
            order
          }
          settings {
            autoPlay
            showMiniMap
            enableAudio
            enableMeasurements
            enableAR
            startingPointId
            transitionSpeed
            uiTheme
          }
          pricing {
            isPublic
            requiresPremium
            viewLimit
            scheduledTours
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { input });
    return response.createVirtualTour;
  }

  async updateVirtualTour(tourId: string, input: UpdateVirtualTourInput): Promise<VirtualTour> {
    const mutation = `
      mutation UpdateVirtualTour($tourId: ID!, $input: UpdateVirtualTourInput!) {
        updateVirtualTour(tourId: $tourId, input: $input) {
          id
          title
          description
          type
          quality
          status
          points {
            id
            title
            description
            panoramaUrl
            thumbnail
          }
          settings {
            autoPlay
            showMiniMap
            enableAudio
            enableMeasurements
            enableAR
            uiTheme
          }
          pricing {
            isPublic
            requiresPremium
            viewLimit
          }
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId, input });
    return response.updateVirtualTour;
  }

  async startTourSession(tourId: string, deviceType: VirtualTourSession['deviceType'], userId?: string): Promise<VirtualTourSession> {
    const mutation = `
      mutation StartTourSession($tourId: ID!, $deviceType: DeviceType!, $userId: ID) {
        startTourSession(tourId: $tourId, deviceType: $deviceType, userId: $userId) {
          id
          tourId
          userId
          deviceType
          startTime
          pointsVisited
          interactionsLog {
            timestamp
            type
            pointId
            hotspotId
            data
          }
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId, deviceType, userId });
    return response.startTourSession;
  }

  async trackTourInteraction(
    sessionId: string,
    interaction: {
      type: 'navigation' | 'hotspot_click' | 'measurement' | 'screenshot' | 'share';
      pointId?: string;
      hotspotId?: string;
      data?: any;
    }
  ): Promise<boolean> {
    const mutation = `
      mutation TrackTourInteraction($sessionId: ID!, $interaction: TourInteractionInput!) {
        trackTourInteraction(sessionId: $sessionId, interaction: $interaction) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { sessionId, interaction });
    return response.trackTourInteraction.success;
  }

  async endTourSession(sessionId: string, feedbackRating?: number, feedbackComment?: string): Promise<boolean> {
    const mutation = `
      mutation EndTourSession($sessionId: ID!, $feedbackRating: Int, $feedbackComment: String) {
        endTourSession(sessionId: $sessionId, feedbackRating: $feedbackRating, feedbackComment: $feedbackComment) {
          success
          sessionDuration
          totalInteractions
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { sessionId, feedbackRating, feedbackComment });
    return response.endTourSession.success;
  }

  async getTourAnalytics(tourId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<VirtualTourAnalytics> {
    const query = `
      query GetTourAnalytics($tourId: ID!, $period: AnalyticsPeriod!) {
        tourAnalytics(tourId: $tourId, period: $period) {
          totalViews
          uniqueViewers
          averageViewTime
          completionRate
          popularPoints {
            pointId
            viewCount
            averageTime
          }
          deviceBreakdown {
            mobile
            desktop
            vr
            ar
          }
          engagementMetrics {
            hotspotsClicked
            measurementsTaken
            screenshotsTaken
            sharesCount
          }
        }
      }
    `;

    const response = await this.graphqlService.query(query, { tourId, period });
    return response.tourAnalytics;
  }

  async generateTourThumbnail(tourId: string, pointId: string): Promise<string> {
    const mutation = `
      mutation GenerateTourThumbnail($tourId: ID!, $pointId: ID!) {
        generateTourThumbnail(tourId: $tourId, pointId: $pointId) {
          thumbnailUrl
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId, pointId });
    return response.generateTourThumbnail.thumbnailUrl;
  }

  async shareTour(tourId: string, platform: 'email' | 'social' | 'embed', recipientData: any): Promise<{
    shareUrl: string;
    embedCode?: string;
    expiresAt?: string;
  }> {
    const mutation = `
      mutation ShareTour($tourId: ID!, $platform: SharePlatform!, $recipientData: ShareRecipientInput!) {
        shareTour(tourId: $tourId, platform: $platform, recipientData: $recipientData) {
          shareUrl
          embedCode
          expiresAt
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId, platform, recipientData });
    return response.shareTour;
  }

  async scheduleVirtualTour(
    tourId: string,
    userId: string,
    scheduledDateTime: string,
    agentId?: string,
    notes?: string
  ): Promise<{
    schedulingId: string;
    meetingUrl: string;
    calendarEvent: string;
  }> {
    const mutation = `
      mutation ScheduleVirtualTour(
        $tourId: ID!,
        $userId: ID!,
        $scheduledDateTime: DateTime!,
        $agentId: ID,
        $notes: String
      ) {
        scheduleVirtualTour(
          tourId: $tourId,
          userId: $userId,
          scheduledDateTime: $scheduledDateTime,
          agentId: $agentId,
          notes: $notes
        ) {
          schedulingId
          meetingUrl
          calendarEvent
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      tourId,
      userId,
      scheduledDateTime,
      agentId,
      notes
    });
    return response.scheduleVirtualTour;
  }

  async enableARMode(tourId: string): Promise<{
    arEnabled: boolean;
    arConfiguration: {
      anchors: Array<{
        pointId: string;
        worldPosition: { x: number; y: number; z: number };
        qrCode: string;
      }>;
      overlayElements: Array<{
        type: 'furniture' | 'measurement' | 'information';
        position: { x: number; y: number; z: number };
        content: any;
      }>;
    };
  }> {
    const mutation = `
      mutation EnableARMode($tourId: ID!) {
        enableARMode(tourId: $tourId) {
          arEnabled
          arConfiguration {
            anchors {
              pointId
              worldPosition {
                x
                y
                z
              }
              qrCode
            }
            overlayElements {
              type
              position {
                x
                y
                z
              }
              content
            }
          }
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId });
    return response.enableARMode;
  }

  async uploadPanorama(tourId: string, pointId: string, imageFile: File, quality: 'standard' | 'hd' | 'uhd_4k'): Promise<{
    panoramaUrl: string;
    thumbnailUrl: string;
    processingStatus: string;
  }> {
    const formData = new FormData();
    formData.append('panorama', imageFile);
    formData.append('tourId', tourId);
    formData.append('pointId', pointId);
    formData.append('quality', quality);

    const response = await fetch('/api/virtual-tours/upload-panorama', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  }

  async processPanorama(tourId: string, pointId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    estimatedTime: number;
  }> {
    const query = `
      query ProcessPanorama($tourId: ID!, $pointId: ID!) {
        processPanorama(tourId: $tourId, pointId: $pointId) {
          status
          progress
          estimatedTime
        }
      }
    `;

    const response = await this.graphqlService.query(query, { tourId, pointId });
    return response.processPanorama;
  }

  async deleteTour(tourId: string): Promise<boolean> {
    const mutation = `
      mutation DeleteVirtualTour($tourId: ID!) {
        deleteVirtualTour(tourId: $tourId) {
          success
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { tourId });
    return response.deleteVirtualTour.success;
  }
}

// Export singleton instance
export const virtualTourService = new VirtualTourService();