/**
 * Logging utility for the Toolkit application
 * Provides consistent logging across the app with environment-based filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private enabled: boolean;
  private level: LogLevel;

  constructor() {
    // Enable logging in development, disable in production
    this.enabled = process.env.NODE_ENV === 'development';
    this.level = 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Special method for user-facing errors (always logged)
  userError(message: string, error?: unknown): void {
    console.error(`[USER_ERROR] ${message}`, error || '');
  }

  // Special method for API errors (always logged)
  apiError(endpoint: string, error: unknown): void {
    console.error(`[API_ERROR] ${endpoint}:`, error);
  }
}

export const logger = new Logger();
