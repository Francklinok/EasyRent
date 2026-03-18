import { API_CONFIG } from '../../constants/apiConfig';

export interface ConnectionTestResult {
  success: boolean;
  url: string;
  responseTime?: number;
  error?: string;
}

export class ChatConnectionTester {
  static async testChatConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_CONFIG.CHAT_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        url: API_CONFIG.CHAT_URL,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        success: false,
        url: API_CONFIG.CHAT_URL,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async testWebSocketConnection(): Promise<ConnectionTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      try {
        const ws = new WebSocket(API_CONFIG.WS_URL);
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            success: false,
            url: API_CONFIG.WS_URL,
            responseTime: Date.now() - startTime,
            error: 'Connection timeout'
          });
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            success: true,
            url: API_CONFIG.WS_URL,
            responseTime: Date.now() - startTime
          });
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          resolve({
            success: false,
            url: API_CONFIG.WS_URL,
            responseTime: Date.now() - startTime,
            error: 'WebSocket connection failed'
          });
        };
      } catch (error) {
        resolve({
          success: false,
          url: API_CONFIG.WS_URL,
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  static async testAllConnections(): Promise<{
    chat: ConnectionTestResult;
    websocket: ConnectionTestResult;
  }> {
    const [chat, websocket] = await Promise.all([
      this.testChatConnection(),
      this.testWebSocketConnection()
    ]);

    return { chat, websocket };
  }
}