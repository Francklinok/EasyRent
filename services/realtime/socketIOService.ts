import { API_CONFIG } from '../../constants/apiConfig';

/**
 * Service pour Socket.IO côté React Native
 * Gère la connexion temps réel avec le backend Socket.IO
 */

// Types pour les événements Socket.IO
interface SocketIOMessage {
  type: string;
  data: any;
  timestamp: number;
  conversationId?: string;
  userId?: string;
}

interface SocketIOCallback {
  (data: any): void;
}

export class SocketIOService {
  private socket: any = null; // WebSocket standard ou autre implémentation
  private listeners: Map<string, SocketIOCallback[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor(private url: string = API_CONFIG.SOCKET_URL) {}

  /**
   * Connecte au serveur Socket.IO
   */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket && this.isConnected()) {
      return Promise.resolve();
    }

    this.isManualDisconnect = false;
    this.connectionPromise = this.establishConnection();
    return this.connectionPromise;
  }

  private async establishConnection(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Vérifier si une connexion est déjà en cours
        if (this.isConnecting) {
          reject(new Error('Connection already in progress'));
          return;
        }

        this.isConnecting = true;

        // Fermer toute connexion existante
        if (this.socket) {
          try {
            this.socket.close();
          } catch (e) {
            // Ignorer les erreurs de fermeture
          }
          this.socket = null;
        }

        // Récupérer le token d'authentification
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem('accessToken');

        // Si pas de token, rejeter la connexion
        if (!token) {
          console.warn('Pas de token, connexion Socket.IO impossible');
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(new Error('No authentication token available'));
          return;
        }

        // Utiliser polling d'abord pour plus de stabilité, puis upgrade vers websocket
        // Format: ws://host:port/socket.io/?EIO=4&transport=websocket
        const wsUrl = this.url.replace(/^http/, 'ws') +
          `/socket.io/?EIO=4&transport=websocket&token=${encodeURIComponent(token)}`;

        console.log('Connexion Socket.IO...');
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('Socket.IO connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          this.setupHeartbeat();
          resolve();
        };

        this.socket.onmessage = (event: MessageEvent) => {
          try {
            // Parser les messages Socket.IO
            const data = event.data.toString();
            this.handleSocketIOMessage(data);
          } catch (error) {
            console.error('Error parsing Socket.IO message:', error);
          }
        };

        this.socket.onclose = (event: CloseEvent) => {
          console.log('Socket.IO disconnected:', event.code, event.reason || 'No reason');
          this.isConnecting = false;
          this.connectionPromise = null;
          this.stopHeartbeat();

          // Ne pas tenter de reconnexion si c'est une déconnexion manuelle
          if (!this.isManualDisconnect) {
            this.handleReconnection();
          }
        };

        this.socket.onerror = (error: Event) => {
          // Réduire le bruit dans les logs - juste loguer qu'il y a eu une erreur
          console.warn('Socket.IO connection error occurred');
          this.isConnecting = false;
          this.connectionPromise = null;
          this.stopHeartbeat();
          reject(error);
        };

        // Timeout de connexion
        setTimeout(() => {
          if (this.isConnecting) {
            this.socket?.close();
            reject(new Error('Socket.IO connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      }
    });
  }

  /**
   * Gère les messages Socket.IO (format Engine.IO)
   * Engine.IO packet types:
   * 0 = open, 1 = close, 2 = ping, 3 = pong, 4 = message, 5 = upgrade, 6 = noop
   * Socket.IO packet types (après le 4): 0 = connect, 1 = disconnect, 2 = event, 3 = ack, 4 = error
   */
  private handleSocketIOMessage(data: string): void {
    if (!data || data.length === 0) return;

    const packetType = data.charAt(0);

    switch (packetType) {
      case '0': // Engine.IO open - contient les infos de session
        try {
          const sessionData = JSON.parse(data.substring(1));
          console.log('Engine.IO session established, sid:', sessionData.sid);
          // Envoyer immédiatement une connexion au namespace par défaut
          this.socket?.send('40');
        } catch (error) {
          console.warn('Error parsing Engine.IO open packet');
        }
        break;

      case '1': // Engine.IO close
        console.log('Engine.IO close received');
        break;

      case '2': // Engine.IO ping - répondre avec pong
        this.socket?.send('3');
        break;

      case '3': // Engine.IO pong - ignorer
        break;

      case '4': // Socket.IO message
        this.handleSocketIOPacket(data.substring(1));
        break;

      case '6': // Engine.IO noop
        break;

      default:
        // Messages Socket.IO directs (42xxx)
        if (data.startsWith('42')) {
          try {
            const jsonData = data.substring(2);
            const [eventName, ...payload] = JSON.parse(jsonData);
            this.dispatchEvent(eventName, payload[0] || {});
          } catch (error) {
            console.warn('Error parsing Socket.IO event');
          }
        }
    }
  }

  /**
   * Gère les paquets Socket.IO (après le préfixe Engine.IO "4")
   */
  private handleSocketIOPacket(data: string): void {
    if (!data || data.length === 0) return;

    const socketIOType = data.charAt(0);

    switch (socketIOType) {
      case '0': // Socket.IO connect
        console.log('Socket.IO namespace connected');
        this.authenticateSocket();
        break;

      case '1': // Socket.IO disconnect
        console.log('Socket.IO disconnect received');
        break;

      case '2': // Socket.IO event
        try {
          const jsonData = data.substring(1);
          const [eventName, ...payload] = JSON.parse(jsonData);
          this.dispatchEvent(eventName, payload[0] || {});
        } catch (error) {
          console.warn('Error parsing Socket.IO event');
        }
        break;

      case '4': // Socket.IO error
        console.warn('Socket.IO error:', data.substring(1));
        break;
    }
  }

  /**
   * Authentifie la socket avec le token utilisateur
   */
  private async authenticateSocket(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('accessToken');

      if (token) {
        this.emit('authenticate', { token });
      }
    } catch (error) {
      console.error('Error authenticating socket:', error);
    }
  }

  /**
   * Configure le heartbeat pour maintenir la connexion
   */
  private setupHeartbeat(): void {
    this.stopHeartbeat(); // Nettoyer tout heartbeat existant
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.send('2'); // Ping
      }
    }, 25000); // Ping toutes les 25 secondes
  }

  /**
   * Arrête le heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Gère la reconnexion automatique
   */
  private handleReconnection(): void {
    // Annuler toute reconnexion en cours
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Ne pas reconnecter si déconnexion manuelle ou max atteint
    if (this.isManualDisconnect) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting Socket.IO reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect().catch(error => {
          console.warn('Socket.IO reconnection failed');
        });
      }, delay);
    } else {
      console.warn('Socket.IO max reconnection attempts reached');
      // Réinitialiser les tentatives après un délai plus long
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
      }, 30000); // Attendre 30s avant de permettre de nouvelles tentatives
    }
  }

  /**
   * Émet un événement vers le serveur
   */
  emit(event: string, data?: any): void {
    if (!this.isConnected()) {
      console.warn('Socket.IO not connected, queuing message:', event);
      // Optionnel : implémenter une queue pour les messages en attente
      return;
    }

    try {
      const message = data ? [event, data] : [event];
      const socketIOMessage = '42' + JSON.stringify(message);
      this.socket.send(socketIOMessage);
    } catch (error) {
      console.error('Error emitting Socket.IO event:', error);
    }
  }

  /**
   * Écoute un événement du serveur
   */
  on(event: string, callback: SocketIOCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback);

    // Retourne une fonction de désabonnement
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Supprime tous les listeners d'un événement
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Déclenche les callbacks pour un événement
   */
  private trigger(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in Socket.IO event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Dispatche un événement reçu du serveur vers les listeners locaux
   */
  private dispatchEvent(event: string, data: any): void {
    this.trigger(event, data);
  }

  /**
   * Vérifie si la socket est connectée
   */
  isConnected(): boolean {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Déconnecte la socket
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();

    // Annuler toute reconnexion en cours
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }

    this.listeners.clear();
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Rejoint une room (pour les conversations)
   */
  joinRoom(roomId: string): void {
    this.emit('join', { room: roomId });
  }

  /**
   * Quitte une room
   */
  leaveRoom(roomId: string): void {
    this.emit('leave', { room: roomId });
  }

  /**
   * Envoie un indicateur de frappe
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    this.emit('typing', { conversationId, isTyping });
  }

  /**
   * Envoie un message via Socket.IO
   */
  sendMessage(message: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
  }): void {
    this.emit('message', message);
  }
}

// Instance unique
let socketIOService: SocketIOService | null = null;

/**
 * Récupère l'instance du service Socket.IO
 */
export function getSocketIOService(): SocketIOService {
  if (!socketIOService) {
    socketIOService = new SocketIOService();
  }
  return socketIOService;
}

/**
 * Connecte Socket.IO
 */
export async function connectSocketIO(): Promise<void> {
  const service = getSocketIOService();
  await service.connect();
}

/**
 * Déconnecte Socket.IO
 */
export function disconnectSocketIO(): void {
  if (socketIOService) {
    socketIOService.disconnect();
    socketIOService = null;
  }
}