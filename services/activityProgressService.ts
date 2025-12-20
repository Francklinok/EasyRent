import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBookingService } from './api/bookingService';

export interface ActivityProgress {
  propertyId: string;
  propertyTitle?: string;
  visitStatus: 'none' | 'pending' | 'accepted' | 'rejected';
  visitId?: string;
  reservationStatus: 'none' | 'pending' | 'accepted' | 'rejected';
  reservationId?: string;
  paymentStatus: 'none' | 'pending' | 'completed';
  paymentId?: string;
  currentStep: 'visit' | 'reservation' | 'payment' | 'completed';
}

class ActivityProgressService {
  private bookingService = getBookingService();

  /**
   * Déterminer l'étape actuelle basée sur la progression
   */
  private determineCurrentStep(progress: Partial<ActivityProgress>): ActivityProgress['currentStep'] {
    // Si visite pas encore acceptée → Étape visite
    if (progress.visitStatus !== 'accepted') {
      return 'visit';
    }
    
    // Si visite acceptée mais réservation pas acceptée → Étape réservation
    if (progress.reservationStatus !== 'accepted') {
      return 'reservation';
    }
    
    // Si réservation acceptée mais paiement pas fait → Étape paiement
    if (progress.paymentStatus !== 'completed') {
      return 'payment';
    }
    
    // Tout est complété
    return 'completed';
  }

  /**
   * Récupérer la progression pour une propriété
   */
  async getProgress(propertyId: string, userId: string): Promise<ActivityProgress> {
    try {
      console.log('📊 [ActivityProgress] Chargement progression pour:', { propertyId, userId });

      // Charger la visite
      const visit = await this.bookingService.getUserVisitForProperty(propertyId, userId);
      console.log('🏠 [ActivityProgress] Visite:', visit);

      // Charger la réservation
      const booking = await this.bookingService.getUserBookingForProperty(propertyId, userId);
      console.log('📝 [ActivityProgress] Réservation:', booking);

      // TODO: Charger le paiement quand le service sera créé
      // const payment = await paymentService.getUserPaymentForProperty(propertyId, userId);

      const progress: ActivityProgress = {
        propertyId,
        visitStatus: visit 
          ? (visit.isVisitAccepted === true ? 'accepted' : visit.status === 'REJECTED' ? 'rejected' : 'pending')
          : 'none',
        visitId: visit?.id,
        reservationStatus: booking
          ? (booking.isReservationAccepted === true ? 'accepted' : booking.status === 'REJECTED' ? 'rejected' : 'pending')
          : 'none',
        reservationId: booking?.id,
        paymentStatus: 'none', // TODO: Implémenter quand service paiement existe
        paymentId: undefined,
        currentStep: 'visit' // Sera calculé ci-dessous
      };

      // Calculer l'étape actuelle
      progress.currentStep = this.determineCurrentStep(progress);

      console.log('✅ [ActivityProgress] Progression calculée:', progress);

      // Sauvegarder dans le cache
      await this.cacheProgress(progress);

      return progress;
    } catch (error) {
      console.error('❌ [ActivityProgress] Erreur chargement progression:', error);
      
      // Retourner progression par défaut en cas d'erreur
      return {
        propertyId,
        visitStatus: 'none',
        reservationStatus: 'none',
        paymentStatus: 'none',
        currentStep: 'visit'
      };
    }
  }

  /**
   * Sauvegarder la progression dans le cache local
   */
  async cacheProgress(progress: ActivityProgress): Promise<void> {
    try {
      const key = `activity_progress_${progress.propertyId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
      console.log('💾 [ActivityProgress] Progression mise en cache:', key);
    } catch (error) {
      console.error('❌ [ActivityProgress] Erreur cache:', error);
    }
  }

  /**
   * Récupérer la progression depuis le cache
   */
  async getCachedProgress(propertyId: string): Promise<ActivityProgress | null> {
    try {
      const key = `activity_progress_${propertyId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        console.log('📦 [ActivityProgress] Progression récupérée du cache');
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('❌ [ActivityProgress] Erreur lecture cache:', error);
      return null;
    }
  }

  /**
   * Invalider le cache pour une propriété
   */
  async invalidateCache(propertyId: string): Promise<void> {
    try {
      const key = `activity_progress_${propertyId}`;
      await AsyncStorage.removeItem(key);
      console.log('🗑️ [ActivityProgress] Cache invalidé:', key);
    } catch (error) {
      console.error('❌ [ActivityProgress] Erreur invalidation cache:', error);
    }
  }

  /**
   * Récupérer toutes les activités de l'utilisateur (historique complet)
   */
  async getAllActivities(userId: string): Promise<ActivityProgress[]> {
    try {
      console.log('📊 [ActivityProgress] Chargement historique complet pour:', userId);
      
      const activities = await this.bookingService.getUserActivities(userId);
      
      const progressList: ActivityProgress[] = activities.map((activity: any) => {
        const progress: Partial<ActivityProgress> = {
          propertyId: activity.propertyId,
          propertyTitle: activity.propertyTitle,
          visitStatus: activity.visitStatus,
          visitId: activity.visitId,
          reservationStatus: activity.reservationStatus,
          reservationId: activity.reservationId,
          paymentStatus: activity.paymentStatus,
          paymentId: activity.paymentId,
        };
        
        // Recalculer l'étape actuelle
        progress.currentStep = this.determineCurrentStep(progress);
        
        return progress as ActivityProgress;
      });
      
      console.log(`✅ [ActivityProgress] ${progressList.length} activités chargées`);
      return progressList;
      
    } catch (error) {
      console.error('❌ [ActivityProgress] Erreur chargement historique:', error);
      return [];
    }
  }
}

// Singleton
let activityProgressServiceInstance: ActivityProgressService | null = null;

export const getActivityProgressService = (): ActivityProgressService => {
  if (!activityProgressServiceInstance) {
    activityProgressServiceInstance = new ActivityProgressService();
  }
  return activityProgressServiceInstance;
};

export default ActivityProgressService;
