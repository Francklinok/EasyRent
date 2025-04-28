// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteLogEndpoint?: string;
}

class Logger {
  private options: LoggerOptions = {
    level: __DEV__ ? 'debug' : 'info',
    enableConsole: true,
    enableRemote: !__DEV__,
    remoteLogEndpoint: '/api/logs'
  };
  
  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  private logBuffer: Array<{level: LogLevel, message: string, data?: any, timestamp: Date}> = [];
  private isFlushingLogs = false;
  
  /**
   * Configure les options du logger
   */
  configure(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Détermine si un niveau de log doit être traité
   */
  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] >= this.LOG_LEVELS[this.options.level];
  }
  
  /**
   * Enregistre un message de debug
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  /**
   * Enregistre un message d'information
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  /**
   * Enregistre un avertissement
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  /**
   * Enregistre une erreur
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
  
  /**
   * Traite un message de log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date();
    
    // Affichage console si activé
    if (this.options.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      if (data) {
        console[consoleMethod](`[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`, data);
      } else {
        console[consoleMethod](`[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`);
      }
    }
    
    // Ajout au buffer pour envoi distant
    if (this.options.enableRemote) {
      this.logBuffer.push({ level, message, data, timestamp });
      this.scheduleFlushLogs();
    }
  }
  
  /**
   * Planifie l'envoi des logs au serveur
   */
  private scheduleFlushLogs(): void {
    if (this.isFlushingLogs || this.logBuffer.length < 10) return;
    
    // Envoyer les logs toutes les 30 secondes au maximum
    setTimeout(() => this.flushLogs(), 30000);
  }
  
  /**
   * Envoie les logs au serveur
   */
  async flushLogs(): Promise<void> {
    if (!this.options.enableRemote || this.logBuffer.length === 0 || this.isFlushingLogs) return;
    
    this.isFlushingLogs = true;
    
    try {
      const logsToSend = [...this.logBuffer];
      this.logBuffer = [];
      
      // Envoyer les logs au serveur distant
      if (this.options.remoteLogEndpoint) {
        const response = await fetch(this.options.remoteLogEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            logs: logsToSend,
            device: {
              // Ajouter des informations sur l'appareil
              platform: Platform.OS,
              version: Platform.Version,
              appVersion: process.env.APP_VERSION || '1.0.0'
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de l'envoi des logs: ${response.status}`);
        }
      }
    } catch (error) {
      // En cas d'échec, remettre les logs dans le buffer
      console.error('Échec de l\'envoi des logs au serveur', error);
      // Ne pas remettre tous les logs pour éviter une croissance infinie du buffer
      if (this.logBuffer.length < 50) {
        this.logBuffer = [...this.logBuffer, ...logsToSend.slice(-10)];
      }
    } finally {
      this.isFlushingLogs = false;
    }
  }
}

// Import nécessaire pour Platform
import { Platform } from 'react-native';

export const logger = new Logger();