import { getGraphQLService } from './graphqlService';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ========== TYPES ==========
export enum NotificationType {
  // User-related
  USER_REGISTRATION = 'user_registration',
  USER_VERIFICATION = 'user_verification',

  // Property-related
  PROPERTY_VIEWED = 'property_viewed',
  PROPERTY_CREATED = 'property_created',
  PROPERTY_PUBLISHED = 'property_published',

  // Service-related
  SERVICE_CREATED = 'service_created',

  // Booking/Reservation
  BOOKING_REQUEST = 'booking_request',
  BOOKING_CONFIRMED = 'booking_confirmed',
  VISIT_SCHEDULED = 'visit_scheduled',
  VISIT_REMINDER = 'visit_reminder',

  // Payment/Financial
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',

  // Communication
  MESSAGE_RECEIVED = 'message_received',
  CONVERSATION_STARTED = 'conversation_started',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  propertyId?: string;
  propertyTitle?: string;
  userId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface PushNotificationToken {
  token: string;
  userId: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

/**
 * Service pour gérer les notifications push et in-app
 */
export class NotificationService {
  private graphql = getGraphQLService();
  private pushToken: string | null = null;

  /**
   * Configure les notifications Expo
   */
  async initialize(): Promise<void> {
    // Configurer le comportement par défaut des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Demander les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Permission de notification refusée');
      return;
    }

    // Obtenir le token push
    try {
      const token = await this.getExpoPushToken();
      if (token) {
        this.pushToken = token;
        console.log('✅ Push token obtenu:', token);
      }
    } catch (error) {
      console.error('❌ Erreur obtention push token:', error);
    }
  }

  /**
   * Obtient le token Expo Push
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn('⚠️ Project ID non configuré');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Erreur getExpoPushToken:', error);
      return null;
    }
  }

  /**
   * Enregistre le token push de l'utilisateur sur le serveur
   */
  async registerPushToken(userId: string): Promise<boolean> {
    if (!this.pushToken) {
      console.warn('Pas de push token disponible');
      return false;
    }

    const mutation = `
      mutation RegisterPushToken($userId: ID!, $token: String!, $platform: String!) {
        registerPushToken(userId: $userId, token: $token, platform: $platform)
      }
    `;

    try {
      const result = await this.graphql.mutate<{ registerPushToken: boolean }>(
        mutation,
        {
          userId,
          token: this.pushToken,
          platform: Platform.OS,
        }
      );

      return result.registerPushToken;
    } catch (error) {
      console.error('Erreur enregistrement push token:', error);
      return false;
    }
  }

  /**
   * Envoie une notification locale (in-app)
   */
  async sendLocalNotification(payload: NotificationPayload): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.message,
          data: {
            type: payload.type,
            ...payload.data,
            propertyId: payload.propertyId,
            propertyTitle: payload.propertyTitle,
          },
          sound: true,
          badge: 1,
        },
        trigger: null, // Immédiat
      });

      console.log('✅ Notification locale envoyée:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erreur envoi notification locale:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification via le backend (push + in-app)
   */
  async sendNotification(
    userId: string | string[],
    payload: NotificationPayload
  ): Promise<boolean> {
    const mutation = `
      mutation SendNotification($input: SendNotificationInput!) {
        sendNotification(input: $input) {
          success
          notificationId
        }
      }
    `;

    try {
      const result = await this.graphql.mutate<{
        sendNotification: { success: boolean; notificationId: string };
      }>(mutation, {
        input: {
          userId,
          type: payload.type,
          channels: ['push', 'in_app'],
          priority: payload.priority || 'normal',
          title: payload.title,
          message: payload.message,
          data: {
            inApp: {
              userId,
              title: payload.title,
              message: payload.message,
              category: this.getNotificationCategory(payload.type),
            },
            push: {
              title: payload.title,
              body: payload.message,
              data: payload.data || {},
            },
          },
          metadata: {
            propertyId: payload.propertyId,
            propertyTitle: payload.propertyTitle,
          },
        },
      });

      return result.sendNotification.success;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      return false;
    }
  }

  /**
   * Récupère les notifications de l'utilisateur
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    onlyUnread: boolean = false
  ): Promise<any[]> {
    const query = `
      query GetUserNotifications($userId: ID!, $limit: Int, $onlyUnread: Boolean) {
        userNotifications(userId: $userId, limit: $limit, onlyUnread: $onlyUnread) {
          id
          type
          title
          message
          isRead
          createdAt
          data
          metadata {
            propertyId
            propertyTitle
            actionUrl
          }
        }
      }
    `;

    try {
      const result = await this.graphql.query<{ userNotifications: any[] }>(
        query,
        { userId, limit, onlyUnread }
      );

      return result.userNotifications;
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      return [];
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const mutation = `
      mutation MarkNotificationAsRead($notificationId: ID!) {
        markNotificationAsRead(notificationId: $notificationId)
      }
    `;

    try {
      const result = await this.graphql.mutate<{ markNotificationAsRead: boolean }>(
        mutation,
        { notificationId }
      );

      return result.markNotificationAsRead;
    } catch (error) {
      console.error('Erreur marquage notification lue:', error);
      return false;
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const mutation = `
      mutation MarkAllNotificationsAsRead($userId: ID!) {
        markAllNotificationsAsRead(userId: $userId)
      }
    `;

    try {
      const result = await this.graphql.mutate<{ markAllNotificationsAsRead: boolean }>(
        mutation,
        { userId }
      );

      return result.markAllNotificationsAsRead;
    } catch (error) {
      console.error('Erreur marquage toutes notifications lues:', error);
      return false;
    }
  }

  /**
   * Obtient le nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      query GetUnreadNotificationsCount($userId: ID!) {
        unreadNotificationsCount(userId: $userId)
      }
    `;

    try {
      const result = await this.graphql.query<{ unreadNotificationsCount: number }>(
        query,
        { userId }
      );

      return result.unreadNotificationsCount;
    } catch (error) {
      console.error('Erreur comptage notifications non lues:', error);
      return 0;
    }
  }

  /**
   * Configure un listener pour les notifications reçues
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Configure un listener pour les clics sur notifications
   */
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Supprime le badge de l'application
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Obtient la catégorie de notification pour le backend
   */
  private getNotificationCategory(type: NotificationType): string {
    const categoryMap: Record<string, string> = {
      [NotificationType.PROPERTY_VIEWED]: 'property',
      [NotificationType.PROPERTY_CREATED]: 'property',
      [NotificationType.PROPERTY_PUBLISHED]: 'property',
      [NotificationType.SERVICE_CREATED]: 'service',
      [NotificationType.BOOKING_REQUEST]: 'booking',
      [NotificationType.BOOKING_CONFIRMED]: 'booking',
      [NotificationType.VISIT_SCHEDULED]: 'visit',
      [NotificationType.VISIT_REMINDER]: 'visit',
      [NotificationType.PAYMENT_RECEIVED]: 'payment',
      [NotificationType.PAYMENT_FAILED]: 'payment',
      [NotificationType.MESSAGE_RECEIVED]: 'message',
      [NotificationType.CONVERSATION_STARTED]: 'message',
    };

    return categoryMap[type] || 'general';
  }
}

// Instance singleton
let notificationServiceInstance: NotificationService | null = null;

/**
 * Récupère l'instance du service Notification
 */
export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}
