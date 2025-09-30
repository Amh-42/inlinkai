import fs from 'fs';
import path from 'path';

interface AuthLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  category: 'AUTH' | 'SOCIAL' | 'DATABASE' | 'SESSION' | 'CONFIG';
  message: string;
  data?: any;
  error?: any;
  userId?: string;
  provider?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
}

class AuthLogger {
  private logDir: string;
  private logFile: string;
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB
  private maxLogFiles: number = 5;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'auth.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: AuthLogEntry): string {
    const baseLog = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`;
    
    const details: string[] = [];
    
    if (entry.userId) details.push(`userId=${entry.userId}`);
    if (entry.provider) details.push(`provider=${entry.provider}`);
    if (entry.endpoint) details.push(`endpoint=${entry.endpoint}`);
    if (entry.ip) details.push(`ip=${entry.ip}`);
    if (entry.userAgent) details.push(`userAgent=${entry.userAgent.substring(0, 100)}...`);
    
    let logLine = baseLog;
    if (details.length > 0) {
      logLine += ` | ${details.join(' | ')}`;
    }
    
    if (entry.data) {
      logLine += `\n  DATA: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      logLine += `\n  ERROR: ${entry.error.message || entry.error}`;
      if (entry.error.stack) {
        logLine += `\n  STACK: ${entry.error.stack}`;
      }
    }
    
    return logLine + '\n';
  }

  private rotateLogIfNeeded() {
    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxLogSize) {
          // Rotate logs
          for (let i = this.maxLogFiles - 1; i > 0; i--) {
            const oldFile = `${this.logFile}.${i}`;
            const newFile = `${this.logFile}.${i + 1}`;
            if (fs.existsSync(oldFile)) {
              fs.renameSync(oldFile, newFile);
            }
          }
          fs.renameSync(this.logFile, `${this.logFile}.1`);
        }
      }
    } catch (error) {
      console.error('Failed to rotate auth log:', error);
    }
  }

  private writeLog(entry: AuthLogEntry) {
    try {
      this.rotateLogIfNeeded();
      const logLine = this.formatLogEntry(entry);
      fs.appendFileSync(this.logFile, logLine);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        const consoleMethod = entry.level === 'ERROR' ? 'error' : 
                             entry.level === 'WARN' ? 'warn' : 'log';
        console[consoleMethod](`🔐 AUTH LOG: ${entry.message}`, entry.data || '');
      }
    } catch (error) {
      console.error('Failed to write auth log:', error);
    }
  }

  info(category: AuthLogEntry['category'], message: string, data?: any, meta?: Partial<AuthLogEntry>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      data,
      ...meta
    });
  }

  warn(category: AuthLogEntry['category'], message: string, data?: any, meta?: Partial<AuthLogEntry>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category,
      message,
      data,
      ...meta
    });
  }

  error(category: AuthLogEntry['category'], message: string, error?: any, data?: any, meta?: Partial<AuthLogEntry>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category,
      message,
      error,
      data,
      ...meta
    });
  }

  debug(category: AuthLogEntry['category'], message: string, data?: any, meta?: Partial<AuthLogEntry>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category,
      message,
      data,
      ...meta
    });
  }

  // Specific auth event loggers
  socialSignInAttempt(provider: string, endpoint: string, userAgent?: string, ip?: string) {
    this.info('SOCIAL', `Social sign-in attempt started`, { provider }, { 
      provider, 
      endpoint, 
      userAgent, 
      ip 
    });
  }

  socialSignInSuccess(provider: string, userId: string, userEmail?: string, endpoint?: string) {
    this.info('SOCIAL', `Social sign-in successful`, { 
      provider, 
      userId, 
      userEmail 
    }, { 
      provider, 
      userId, 
      endpoint 
    });
  }

  socialSignInError(provider: string, error: any, endpoint?: string, userAgent?: string, ip?: string) {
    this.error('SOCIAL', `Social sign-in failed`, error, { 
      provider 
    }, { 
      provider, 
      endpoint, 
      userAgent, 
      ip 
    });
  }

  databaseConnection(success: boolean, error?: any) {
    if (success) {
      this.info('DATABASE', 'Database connection established successfully');
    } else {
      this.error('DATABASE', 'Database connection failed', error);
    }
  }

  configValidation(configName: string, isValid: boolean, value?: any) {
    if (isValid) {
      this.info('CONFIG', `Configuration ${configName} is valid`, { configName, hasValue: !!value });
    } else {
      this.warn('CONFIG', `Configuration ${configName} is missing or invalid`, { configName, value });
    }
  }

  sessionEvent(event: string, userId?: string, data?: any) {
    this.info('SESSION', `Session event: ${event}`, data, { userId });
  }

  // Method to get recent logs for debugging
  getRecentLogs(lines: number = 100): string {
    try {
      if (!fs.existsSync(this.logFile)) {
        return 'No auth logs found';
      }
      
      const content = fs.readFileSync(this.logFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      const recentLines = logLines.slice(-lines);
      return recentLines.join('\n');
    } catch (error) {
      return `Error reading logs: ${error}`;
    }
  }

  // Method to clear logs
  clearLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
      }
      this.info('AUTH', 'Auth logs cleared');
    } catch (error) {
      console.error('Failed to clear auth logs:', error);
    }
  }
}

// Export singleton instance
export const authLogger = new AuthLogger();

// Helper function to extract request metadata
export function extractRequestMeta(request?: Request) {
  if (!request) return {};
  
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    endpoint: request.url
  };
}
