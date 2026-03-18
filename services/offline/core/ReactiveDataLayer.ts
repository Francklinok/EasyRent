/**
 * ReactiveDataLayer - Couche réactive pour synchronisation automatique de l'UI
 *
 * Fonctionnalités:
 * - EventEmitter pour les changements de données
 * - Subscriptions par type d'entité ou par ID
 * - Auto-invalidation des caches liés via graphe de dépendances
 * - Observables simplifiés pour React hooks
 */

import {
  EntityTable,
  DataEventType,
  DataChangeEvent,
  DataChangeCallback,
  EntityDependency,
  Observable,
  BehaviorSubject,
} from './types';

// ============================================================================
// SIMPLE BEHAVIOR SUBJECT IMPLEMENTATION
// ============================================================================

class SimpleBehaviorSubject<T> implements BehaviorSubject<T> {
  private value: T;
  private subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  next(value: T): void {
    this.value = value;
    this.subscribers.forEach((callback) => callback(value));
  }

  getValue(): T {
    return this.value;
  }

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current value
    callback(this.value);

    return () => {
      this.subscribers.delete(callback);
    };
  }
}

// ============================================================================
// DEPENDENCY RULES
// ============================================================================

/**
 * Règles de dépendances entre entités
 * Quand une entité change, les entités liées sont notifiées
 */
const DEPENDENCY_RULES: Record<EntityTable, (entity: any) => EntityDependency[]> = {
  properties: (property) => [
    { type: 'favorites' },
    { type: 'activities' },
  ],

  activities: (activity) => [
    { type: 'properties', id: activity.propertyId },
    { type: 'wallet' },
    { type: 'notifications' },
    { type: 'conversations' },
  ],

  transactions: (transaction) => [
    { type: 'wallet', id: transaction.walletId },
  ],

  wallet: () => [
    { type: 'transactions' },
  ],

  favorites: (favorite) => [
    { type: 'properties', id: favorite.propertyId },
  ],

  services: () => [
    { type: 'service_subscriptions' },
    { type: 'favorites' },
  ],

  service_subscriptions: (subscription) => [
    { type: 'services', id: subscription.serviceId },
    { type: 'wallet' },
  ],

  notifications: () => [],

  conversations: (conversation) => [
    { type: 'messages' },
  ],

  messages: (message) => [
    { type: 'conversations', id: message.conversationId },
  ],

  users: () => [],

  sync_queue: () => [],

  metadata: () => [],
};

// ============================================================================
// REACTIVE DATA LAYER
// ============================================================================

class ReactiveDataLayer {
  private eventListeners: Map<string, Set<DataChangeCallback>> = new Map();
  private entitySubjects: Map<string, SimpleBehaviorSubject<any>> = new Map();
  private listSubjects: Map<string, SimpleBehaviorSubject<any[]>> = new Map();
  private customDependencies: Map<string, Set<EntityDependency>> = new Map();

  // ==========================================================================
  // EVENT EMISSION
  // ==========================================================================

  /**
   * Émet un événement de changement de données
   */
  emit<T>(
    entityType: EntityTable,
    eventType: DataEventType,
    data: T,
    options?: {
      previousData?: T;
      source?: 'local' | 'remote' | 'sync';
      entityId?: string;
    }
  ): void {
    const entityId = options?.entityId || (data as any)?.id || 'unknown';

    const event: DataChangeEvent<T> = {
      entityType,
      eventType,
      entityId,
      data,
      previousData: options?.previousData,
      timestamp: Date.now(),
      source: options?.source || 'local',
    };

    // Notifier les listeners par type d'entité
    this.notifyListeners(entityType, event);
    this.notifyListeners(`${entityType}:${entityId}`, event);
    this.notifyListeners('*', event); // Listeners globaux

    // Mettre à jour les subjects
    this.updateSubjects(entityType, entityId, data, eventType);

    // Propager aux dépendants
    this.propagateToDependents(entityType, data, eventType);

    console.log(`[ReactiveData] Emitted ${eventType} for ${entityType}:${entityId}`);
  }

  /**
   * Émet un événement d'invalidation
   */
  invalidate(entityType: EntityTable, entityId?: string): void {
    const event: DataChangeEvent<null> = {
      entityType,
      eventType: 'invalidated',
      entityId: entityId || '*',
      data: null,
      timestamp: Date.now(),
      source: 'local',
    };

    if (entityId) {
      this.notifyListeners(`${entityType}:${entityId}`, event);
    }
    this.notifyListeners(entityType, event);
  }

  // ==========================================================================
  // SUBSCRIPTIONS
  // ==========================================================================

  /**
   * S'abonne aux changements d'un type d'entité
   */
  subscribe<T>(
    entityType: EntityTable | '*',
    callback: DataChangeCallback<T>
  ): () => void {
    const key = entityType;

    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set());
    }

    this.eventListeners.get(key)!.add(callback as DataChangeCallback);

    return () => {
      this.eventListeners.get(key)?.delete(callback as DataChangeCallback);
    };
  }

  /**
   * S'abonne aux changements d'une entité spécifique par ID
   */
  subscribeToId<T>(
    entityType: EntityTable,
    id: string,
    callback: DataChangeCallback<T>
  ): () => void {
    const key = `${entityType}:${id}`;

    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set());
    }

    this.eventListeners.get(key)!.add(callback as DataChangeCallback);

    return () => {
      this.eventListeners.get(key)?.delete(callback as DataChangeCallback);
    };
  }

  /**
   * S'abonne à plusieurs types d'événements
   */
  subscribeToMany(
    subscriptions: Array<{ entityType: EntityTable; callback: DataChangeCallback }>
  ): () => void {
    const unsubscribers = subscriptions.map(({ entityType, callback }) =>
      this.subscribe(entityType, callback)
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  // ==========================================================================
  // OBSERVABLES
  // ==========================================================================

  /**
   * Crée un observable pour une entité spécifique
   */
  observe<T>(entityType: EntityTable, id: string, initialValue?: T): Observable<T | null> {
    const key = `${entityType}:${id}`;

    if (!this.entitySubjects.has(key)) {
      const subject = new SimpleBehaviorSubject<T | null>(initialValue || null);
      this.entitySubjects.set(key, subject);

      // S'abonner aux changements pour mettre à jour le subject
      this.subscribeToId<T>(entityType, id, (event) => {
        if (event.eventType === 'deleted') {
          subject.next(null);
        } else {
          subject.next(event.data);
        }
      });
    }

    return this.entitySubjects.get(key)!;
  }

  /**
   * Crée un observable pour une liste d'entités
   */
  observeList<T>(
    entityType: EntityTable,
    queryKey: string,
    initialValue?: T[]
  ): Observable<T[]> {
    const key = `${entityType}:list:${queryKey}`;

    if (!this.listSubjects.has(key)) {
      const subject = new SimpleBehaviorSubject<T[]>(initialValue || []);
      this.listSubjects.set(key, subject);
    }

    return this.listSubjects.get(key)!;
  }

  /**
   * Met à jour un observable de liste
   */
  updateListObservable<T>(
    entityType: EntityTable,
    queryKey: string,
    updater: (current: T[]) => T[]
  ): void {
    const key = `${entityType}:list:${queryKey}`;
    const subject = this.listSubjects.get(key);

    if (subject) {
      const current = subject.getValue();
      subject.next(updater(current));
    }
  }

  // ==========================================================================
  // DEPENDENCY MANAGEMENT
  // ==========================================================================

  /**
   * Enregistre une dépendance personnalisée
   */
  registerDependency(
    parent: { type: EntityTable; id: string },
    child: EntityDependency
  ): void {
    const key = `${parent.type}:${parent.id}`;

    if (!this.customDependencies.has(key)) {
      this.customDependencies.set(key, new Set());
    }

    this.customDependencies.get(key)!.add(child);
  }

  /**
   * Récupère les dépendants d'une entité
   */
  getDependents(
    entityType: EntityTable,
    entity: any
  ): EntityDependency[] {
    const rulesFn = DEPENDENCY_RULES[entityType];
    const ruleDependents = rulesFn ? rulesFn(entity) : [];

    const customKey = `${entityType}:${entity?.id}`;
    const customDependents = this.customDependencies.get(customKey);

    if (customDependents) {
      return [...ruleDependents, ...Array.from(customDependents)];
    }

    return ruleDependents;
  }

  /**
   * Propage un changement aux entités dépendantes
   */
  private propagateToDependents<T>(
    entityType: EntityTable,
    entity: T,
    eventType: DataEventType
  ): void {
    const dependents = this.getDependents(entityType, entity);

    for (const dependent of dependents) {
      // Invalider le cache des dépendants
      this.invalidate(dependent.type, dependent.id);

      // Notifier les listeners des dépendants
      const event: DataChangeEvent<null> = {
        entityType: dependent.type,
        eventType: 'invalidated',
        entityId: dependent.id || '*',
        data: null,
        timestamp: Date.now(),
        source: 'local',
      };

      this.notifyListeners(dependent.type, event);
      if (dependent.id) {
        this.notifyListeners(`${dependent.type}:${dependent.id}`, event);
      }
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Émet plusieurs événements en batch (optimise les re-renders)
   */
  emitBatch<T>(
    events: Array<{
      entityType: EntityTable;
      eventType: DataEventType;
      data: T;
      entityId?: string;
    }>
  ): void {
    // Grouper par type d'entité pour optimiser
    const grouped = new Map<EntityTable, typeof events>();

    for (const event of events) {
      if (!grouped.has(event.entityType)) {
        grouped.set(event.entityType, []);
      }
      grouped.get(event.entityType)!.push(event);
    }

    // Émettre les événements individuels
    for (const event of events) {
      this.emit(event.entityType, event.eventType, event.data, {
        entityId: event.entityId,
      });
    }

    // Émettre un événement batch pour les listeners qui préfèrent
    const batchEvent: DataChangeEvent<typeof events> = {
      entityType: 'metadata' as EntityTable,
      eventType: 'synced',
      entityId: 'batch',
      data: events,
      timestamp: Date.now(),
      source: 'sync',
    };

    this.notifyListeners('batch', batchEvent);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private notifyListeners<T>(key: string, event: DataChangeEvent<T>): void {
    const listeners = this.eventListeners.get(key);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('[ReactiveData] Listener error:', error);
        }
      });
    }
  }

  private updateSubjects<T>(
    entityType: EntityTable,
    entityId: string,
    data: T,
    eventType: DataEventType
  ): void {
    const key = `${entityType}:${entityId}`;
    const subject = this.entitySubjects.get(key);

    if (subject) {
      if (eventType === 'deleted') {
        subject.next(null);
      } else {
        subject.next(data);
      }
    }

    // Mettre à jour les listes qui pourraient contenir cette entité
    for (const [listKey, listSubject] of this.listSubjects.entries()) {
      if (listKey.startsWith(`${entityType}:list:`)) {
        const currentList = listSubject.getValue() as any[];

        switch (eventType) {
          case 'created':
            listSubject.next([data, ...currentList]);
            break;

          case 'updated':
            listSubject.next(
              currentList.map((item) =>
                (item as any).id === entityId ? data : item
              )
            );
            break;

          case 'deleted':
            listSubject.next(
              currentList.filter((item) => (item as any).id !== entityId)
            );
            break;
        }
      }
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Nettoie toutes les subscriptions
   */
  clear(): void {
    this.eventListeners.clear();
    this.entitySubjects.clear();
    this.listSubjects.clear();
    this.customDependencies.clear();
    console.log('[ReactiveData] All subscriptions cleared');
  }

  /**
   * Supprime un observable spécifique
   */
  removeObservable(entityType: EntityTable, id: string): void {
    const key = `${entityType}:${id}`;
    this.entitySubjects.delete(key);
  }

  /**
   * Supprime un observable de liste
   */
  removeListObservable(entityType: EntityTable, queryKey: string): void {
    const key = `${entityType}:list:${queryKey}`;
    this.listSubjects.delete(key);
  }

  // ==========================================================================
  // DEBUGGING
  // ==========================================================================

  /**
   * Obtient les statistiques des subscriptions
   */
  getStats(): {
    listeners: number;
    entitySubjects: number;
    listSubjects: number;
    customDependencies: number;
  } {
    let listenerCount = 0;
    this.eventListeners.forEach((set) => {
      listenerCount += set.size;
    });

    return {
      listeners: listenerCount,
      entitySubjects: this.entitySubjects.size,
      listSubjects: this.listSubjects.size,
      customDependencies: this.customDependencies.size,
    };
  }

  /**
   * Debug: liste toutes les clés de subscription
   */
  getSubscriptionKeys(): string[] {
    return Array.from(this.eventListeners.keys());
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: ReactiveDataLayer | null = null;

export function getReactiveDataLayer(): ReactiveDataLayer {
  if (!instance) {
    instance = new ReactiveDataLayer();
  }
  return instance;
}

export const reactiveDataLayer = getReactiveDataLayer();

export default ReactiveDataLayer;

// ============================================================================
// REACT HOOK HELPERS
// ============================================================================

/**
 * Helper pour créer un hook React basé sur un observable
 */
export function createObservableHook<T>(observable: Observable<T>) {
  return {
    subscribe: observable.subscribe,
    getValue: observable.getValue,
  };
}

/**
 * Type guard pour vérifier si un événement est d'un certain type
 */
export function isEventType<T>(
  event: DataChangeEvent<any>,
  eventType: DataEventType
): event is DataChangeEvent<T> {
  return event.eventType === eventType;
}

/**
 * Type guard pour vérifier si un événement concerne un type d'entité
 */
export function isEntityType<T>(
  event: DataChangeEvent<any>,
  entityType: EntityTable
): event is DataChangeEvent<T> {
  return event.entityType === entityType;
}
