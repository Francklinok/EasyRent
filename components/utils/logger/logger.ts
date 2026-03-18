interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  private currentLevel: number = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  private enableConsole: boolean = true;
  private enableStorage: boolean = false;

  setLevel(level: keyof LogLevel): void {
    this.currentLevel = LOG_LEVELS[level];
  }

  setConsoleEnabled(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  setStorageEnabled(enabled: boolean): void {
    this.enableStorage = enabled;
  }

  private shouldLog(level: number): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  private log(level: keyof LogLevel, message: string, data?: any): void {
    const levelNum = LOG_LEVELS[level];
    
    if (!this.shouldLog(levelNum)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    if (this.enableConsole) {
      switch (level) {
        case 'DEBUG':
          console.debug(formattedMessage);
          break;
        case 'INFO':
          console.info(formattedMessage);
          break;
        case 'WARN':
          console.warn(formattedMessage);
          break;
        case 'ERROR':
          console.error(formattedMessage);
          break;
      }
    }

    if (this.enableStorage) {
      // Store logs for later retrieval (implement as needed)
      this.storeLog(level, message, data);
    }
  }

  private async storeLog(level: string, message: string, data?: any): Promise<void> {
    // Implementation for storing logs (e.g., AsyncStorage, file system)
    // This is a placeholder for future implementation
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  // Utility methods for common logging scenarios
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} - ${status}`, data);
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error);
  }

  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  performance(operation: string, duration: number, data?: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, data);
  }
}

export const logger = new Logger();