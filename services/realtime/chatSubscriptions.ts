import { getWebSocketService } from './websocketService';
import { Message, Conversation } from '../api/chatService';

interface MessageSubscriptionPayload {
  messageAdded: Message;
}

interface ConversationSubscriptionPayload {
  conversationUpdated: Conversation;
}

interface TypingSubscriptionPayload {
  userTyping: {
    userId: string;
    userName: string;
    conversationId: string;
    isTyping: boolean;
  };
}

interface PresenceSubscriptionPayload {
  userPresenceChanged: {
    userId: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
}

class ChatSubscriptions {
  private websocketService = getWebSocketService();

  subscribeToMessages(conversationId: string, callback: (message: Message) => void): () => void {
    const subscriptionId = this.websocketService.subscribe(
      `MESSAGE_ADDED_${conversationId}`,
      (payload: MessageSubscriptionPayload) => {
        if (payload.messageAdded) {
          callback(payload.messageAdded);
        }
      }
    );

    return () => this.websocketService.unsubscribe(subscriptionId);
  }

  subscribeToConversationUpdates(conversationId: string, callback: (conversation: Conversation) => void): () => void {
    const subscriptionId = this.websocketService.subscribe(
      `CONVERSATION_UPDATED_${conversationId}`,
      (payload: ConversationSubscriptionPayload) => {
        if (payload.conversationUpdated) {
          callback(payload.conversationUpdated);
        }
      }
    );

    return () => this.websocketService.unsubscribe(subscriptionId);
  }

  subscribeToTyping(conversationId: string, callback: (typingUsers: string[]) => void): () => void {
    const typingUsers = new Set<string>();

    const subscriptionId = this.websocketService.subscribe(
      `USER_TYPING_${conversationId}`,
      (payload: TypingSubscriptionPayload) => {
        if (payload.userTyping) {
          const { userId, userName, isTyping } = payload.userTyping;

          if (isTyping) {
            typingUsers.add(userName);
          } else {
            typingUsers.delete(userName);
          }

          callback(Array.from(typingUsers));
        }
      }
    );

    return () => this.websocketService.unsubscribe(subscriptionId);
  }

  subscribeToUserPresence(callback: (presence: { userId: string; isOnline: boolean; lastSeen?: Date }) => void): () => void {
    const subscriptionId = this.websocketService.subscribe(
      'USER_PRESENCE_CHANGED',
      (payload: PresenceSubscriptionPayload) => {
        if (payload.userPresenceChanged) {
          callback(payload.userPresenceChanged);
        }
      }
    );

    return () => this.websocketService.unsubscribe(subscriptionId);
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.websocketService.sendMessage({
      type: 'USER_TYPING',
      payload: {
        conversationId,
        isTyping,
      },
      timestamp: Date.now(),
    });
  }

  sendPresenceUpdate(isOnline: boolean): void {
    this.websocketService.sendMessage({
      type: 'USER_PRESENCE',
      payload: {
        isOnline,
        lastSeen: new Date(),
      },
      timestamp: Date.now(),
    });
  }

  // Méthodes pour s'abonner à tous les événements d'une conversation
  subscribeToConversation(conversationId: string, callbacks: {
    onMessage?: (message: Message) => void;
    onConversationUpdate?: (conversation: Conversation) => void;
    onTyping?: (typingUsers: string[]) => void;
  }): () => void {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onMessage) {
      unsubscribers.push(this.subscribeToMessages(conversationId, callbacks.onMessage));
    }

    if (callbacks.onConversationUpdate) {
      unsubscribers.push(this.subscribeToConversationUpdates(conversationId, callbacks.onConversationUpdate));
    }

    if (callbacks.onTyping) {
      unsubscribers.push(this.subscribeToTyping(conversationId, callbacks.onTyping));
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Méthodes pour gérer les notifications push
  subscribeToNotifications(callback: (notification: {
    type: 'message' | 'mention' | 'reaction';
    title: string;
    body: string;
    data?: any;
  }) => void): () => void {
    const subscriptionId = this.websocketService.subscribe(
      'NOTIFICATION',
      (payload: any) => {
        if (payload.notification) {
          callback(payload.notification);
        }
      }
    );

    return () => this.websocketService.unsubscribe(subscriptionId);
  }

  async ensureConnection(): Promise<void> {
    if (!this.websocketService.isConnected()) {
      await this.websocketService.connect();
    }
  }

  disconnect(): void {
    this.websocketService.disconnect();
  }
}

// Instance singleton
let chatSubscriptions: ChatSubscriptions | null = null;

export const getChatSubscriptions = (): ChatSubscriptions => {
  if (!chatSubscriptions) {
    chatSubscriptions = new ChatSubscriptions();
  }
  return chatSubscriptions;
};

export { ChatSubscriptions };
export type {
  MessageSubscriptionPayload,
  ConversationSubscriptionPayload,
  TypingSubscriptionPayload,
  PresenceSubscriptionPayload,
};