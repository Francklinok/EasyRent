/**
 * Simple EventEmitter pour les événements du chat
 */
class ChatEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export const chatEvents = new ChatEventEmitter();

// Événements disponibles
export const CHAT_EVENTS = {
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  CONVERSATION_UPDATED: 'conversation:updated',
} as const;
