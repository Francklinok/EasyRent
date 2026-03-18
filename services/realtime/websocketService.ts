interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface SubscriptionCallback {
  (data: any): void;
}

interface Subscription {
  id: string;
  type: string;
  callback: SubscriptionCallback;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 5000;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          // Pas de reconnexion - Socket.IO est utilisé à la place
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          // Échec silencieux - Socket.IO est utilisé à la place
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        this.connect().catch(() => {
          // Silencieux
        });
      }, delay);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);

    this.subscriptions.forEach((subscription) => {
      if (subscription.type === message.type) {
        try {
          subscription.callback(message.payload);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      }
    });
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.messageQueue.push(message);
      }
    } else {
      this.messageQueue.push(message);
      this.connect().catch((error) => {
        console.error('Failed to connect for sending message:', error);
      });
    }
  }

  subscribe(type: string, callback: SubscriptionCallback): string {
    const id = `${type}_${Date.now()}_${Math.random()}`;
    const subscription: Subscription = {
      id,
      type,
      callback,
    };

    this.subscriptions.set(id, subscription);

    // Envoyer la demande d'abonnement au serveur
    this.sendMessage({
      type: 'SUBSCRIBE',
      payload: { subscription: type },
      timestamp: Date.now(),
    });

    return id;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Envoyer la demande de désabonnement au serveur
      this.sendMessage({
        type: 'UNSUBSCRIBE',
        payload: { subscription: subscription.type },
        timestamp: Date.now(),
      });

      this.subscriptions.delete(subscriptionId);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

// Instance singleton du service WebSocket
import { API_CONFIG, buildWebSocketUrl } from '../../constants/apiConfig';

let websocketService: WebSocketService | null = null;

export const getWebSocketService = (url?: string): WebSocketService => {
  if (!websocketService) {
    // Utiliser l'URL WebSocket configurée ou celle fournie
    const wsUrl = url || buildWebSocketUrl();
    websocketService = new WebSocketService(wsUrl);
    console.log('WebSocket Service initialized with URL:', wsUrl);
  }
  return websocketService;
};

export const connectWebSocket = async (): Promise<void> => {
  const service = getWebSocketService();
  await service.connect();
};

export const disconnectWebSocket = (): void => {
  if (websocketService) {
    websocketService.disconnect();
    websocketService = null;
  }
};

export { WebSocketService };
export type { WebSocketMessage, SubscriptionCallback, Subscription };