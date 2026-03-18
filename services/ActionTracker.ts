import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAction, ActionType, ActionStatus } from '@/types/payment';

const STORAGE_KEYS = {
  PENDING_RESERVATIONS: '@user_pending_reservations',
  ACTIVE_RENT: '@user_active_rent',
  ACTIVE_SERVICES: '@user_active_services',
  ALL_ACTIONS: '@user_all_actions'
};

class ActionTrackerService {
  // Récupère toutes les actions en attente
  async getAllPendingActions(): Promise<UserAction[]> {
    try {
      const actionsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALL_ACTIONS);
      if (!actionsJson) return [];
      
      const actions: UserAction[] = JSON.parse(actionsJson);
      return actions;
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  // Récupère les réservations en cours
  async getPendingReservations(): Promise<UserAction[]> {
    try {
      const actions = await this.getAllPendingActions();
      return actions.filter(action => action.type === 'reservation');
    } catch (error) {
      console.error('Error getting pending reservations:', error);
      return [];
    }
  }

  // Récupère les loyers à payer
  async getPendingRent(): Promise<UserAction[]> {
    try {
      const actions = await this.getAllPendingActions();
      return actions.filter(action => action.type === 'rent');
    } catch (error) {
      console.error('Error getting pending rent:', error);
      return [];
    }
  }

  // Récupère les services actifs
  async getActiveServices(): Promise<UserAction[]> {
    try {
      const actions = await this.getAllPendingActions();
      return actions.filter(action => action.type === 'service');
    } catch (error) {
      console.error('Error getting active services:', error);
      return [];
    }
  }

  // Ajoute une nouvelle action
  async addAction(action: Omit<UserAction, 'id' | 'createdAt'>): Promise<UserAction> {
    try {
      const newAction: UserAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };

      const actions = await this.getAllActions();
      actions.push(newAction);
      
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(actions));
      return newAction;
    } catch (error) {
      console.error('Error adding action:', error);
      throw error;
    }
  }

  // Met à jour le statut d'une action
  async updateActionStatus(actionId: string, status: ActionStatus): Promise<void> {
    try {
      const actions = await this.getAllActions();
      const actionIndex = actions.findIndex(a => a.id === actionId);
      
      if (actionIndex !== -1) {
        actions[actionIndex].status = status;
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(actions));
      }
    } catch (error) {
      console.error('Error updating action status:', error);
      throw error;
    }
  }

  // Récupère toutes les actions (y compris complétées)
  private async getAllActions(): Promise<UserAction[]> {
    try {
      const actionsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALL_ACTIONS);
      return actionsJson ? JSON.parse(actionsJson) : [];
    } catch (error) {
      console.error('Error getting all actions:', error);
      return [];
    }
  }

  // Supprime une action
  async deleteAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getAllActions();
      const filteredActions = actions.filter(a => a.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(filteredActions));
    } catch (error) {
      console.error('Error deleting action:', error);
      throw error;
    }
  }

  // Vide toutes les actions locales
  async clearAllActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify([]));
      console.log('🧹 [ActionTracker] All local actions cleared');
    } catch (error) {
      console.error('Error clearing actions:', error);
    }
  }

  // Synchronise avec les activités du backend
  async syncFromActivities(activities: any[]): Promise<void> {
    try {
      console.log('🔄 [ActionTracker] Syncing from activities:', activities.length);

      const currentActions = await this.getAllActions();
      console.log('🔄 [ActionTracker] Current local actions:', currentActions.length);

      // Si le backend retourne 0 activités, on nettoie les actions locales qui venaient du backend
      if (activities.length === 0) {
        const localOnlyActions = currentActions.filter(a => {
          // Garder uniquement les actions créées localement (pas celles synchronisées du backend)
          const isFromBackend = a.id.startsWith('action_') && a.metadata?.reservationId;
          return !isFromBackend;
        });
        if (localOnlyActions.length !== currentActions.length) {
          console.log(`🧹 [ActionTracker] Backend empty - removing ${currentActions.length - localOnlyActions.length} stale actions`);
          await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(localOnlyActions));
        }
        return;
      }

      const newActions: UserAction[] = [];
      const actionsToRemove: string[] = [];

      for (const activity of activities) {

        // --- 1. DÉTECTION DU PAIEMENT (vérifier le statut réel) ---
        // Une activité est payée seulement si le paymentStatus est COMPLETED
        const isPaid = activity.paymentStatus === 'COMPLETED';

        // Identifier une action existante
        const existingActionId = currentActions.find(a =>
            (a.metadata?.reservationId === activity.id) ||
            (a.metadata?.rentId === activity.id) ||
            (a.metadata?.soldId === activity.id) ||
            (a.metadata?.serviceId === activity.id) ||
            (a.id === `action_${activity.id}`)
        )?.id;

        // Si l'activité est payée, on doit nettoyer l'action correspondante si elle existe
        if (existingActionId && isPaid) {
             console.log('🧹 Activity became PAID, removing pending action:', existingActionId);
             actionsToRemove.push(existingActionId);
             continue;
        }

        // Si une action existe déjà et est toujours valide (ou si payée), on skip
        if (existingActionId || isPaid) continue;

        // --- 2. TRAITEMENT SELON LE FORMAT RÉEL DU BACKEND ActivityProgress ---
        console.log(`[ActionTracker] Processing activity ${activity.id}:`, {
            visitId: activity.visitId,
            reservationId: activity.reservationId,
            paymentId: activity.paymentId,
            visitStatus: activity.visitStatus,
            reservationStatus: activity.reservationStatus,
            paymentStatus: activity.paymentStatus,
            propertyTitle: activity.propertyTitle,
            updatedAt: activity.updatedAt
        });

        // DÉTERMINER LE TYPE D'ACTIVITÉ basé sur les champs disponibles
        let activityType: 'reservation' | 'rent' | 'service' | 'sold' = 'reservation';
        let title = 'Activité';
        let description = 'Paiement en attente';

        // VISITE
        if (activity.visitId && (activity.visitStatus === 'PENDING' || activity.visitStatus === 'ACCEPTED')) {
            activityType = 'service';
            title = `Visite - ${activity.propertyTitle || 'Propriété'}`;
            description = 'Frais de visite';
        }
        // RÉSERVATION (premier paiement - caution + loyer)
        else if (activity.reservationId && !activity.paymentId && activity.reservationStatus === 'PENDING') {
            activityType = 'reservation';
            title = `Réservation - ${activity.propertyTitle || 'Propriété'}`;
            description = 'Caution et premier mois de loyer';
        }
        // LOYER MENSUEL (paiements suivants)
        else if (activity.reservationId && activity.paymentId && activity.paymentStatus === 'PENDING') {
            activityType = 'rent';
            title = `Loyer - ${activity.propertyTitle || 'Propriété'}`;
            description = 'Loyer mensuel à payer';
        }
        // SERVICE GÉNÉRIQUE
        else {
            activityType = 'service';
            title = activity.propertyTitle || 'Service';
            description = 'Frais de service en attente';
        }

        // CRÉER L'ACTION avec le montant du backend
        console.log(`✅ Creating ${activityType} action for activity ${activity.id}`);
        newActions.push({
            id: `action_${activity.id}`,
            type: activityType,
            title: title,
            description: description,
            amount: activity.amount || 0,
            currency: 'FCFA',
            status: 'pending',
            dueDate: new Date(),
            createdAt: new Date(activity.updatedAt || new Date()),
            metadata: {
                reservationId: activity.id,
                propertyId: activity.propertyId,
                activityType: activityType
            }
        });
      }

      // Supprimer les actions locales dont l'activité n'existe plus sur le backend
      const backendActivityIds = new Set(activities.map(a => a.id));
      for (const localAction of currentActions) {
        // Vérifier uniquement les actions synchronisées depuis le backend
        if (localAction.metadata?.reservationId && !backendActivityIds.has(localAction.metadata.reservationId)) {
          if (!actionsToRemove.includes(localAction.id)) {
            console.log('🧹 [ActionTracker] Activity no longer on backend, removing:', localAction.id);
            actionsToRemove.push(localAction.id);
          }
        }
      }

      // Appliquer les changements (Suppressions et Ajouts)
      if (actionsToRemove.length > 0 || newActions.length > 0) {
        console.log(`✅ [ActionTracker] Sync result: +${newActions.length} new, -${actionsToRemove.length} cleaned`);

        let finalActions = currentActions.filter(a => !actionsToRemove.includes(a.id));
        finalActions = [...finalActions, ...newActions];

        console.log('✅ [ActionTracker] Final actions to save:', finalActions.length);
        finalActions.forEach((action, index) => {
          console.log(`   Final Action ${index + 1}: ${action.title} (${action.amount} FCFA)`);
        });

        await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(finalActions));
        console.log('✅ [ActionTracker] Actions saved to storage');
      } else {
        console.log('ℹ️ [ActionTracker] No changes to apply');
      }
    } catch (error) {
      console.error('❌ [ActionTracker] Error syncing activities:', error);
    }
  }

  // Nettoie les actions complétées de plus de 30 jours
  async cleanOldActions(): Promise<void> {
    try {
      const actions = await this.getAllActions();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredActions = actions.filter(action => {
        if (action.status === 'completed' || action.status === 'cancelled') {
          const actionDate = new Date(action.createdAt);
          return actionDate > thirtyDaysAgo;
        }
        return true;
      });

      await AsyncStorage.setItem(STORAGE_KEYS.ALL_ACTIONS, JSON.stringify(filteredActions));
    } catch (error) {
      console.error('Error cleaning old actions:', error);
    }
  }
}

export const actionTracker = new ActionTrackerService();
