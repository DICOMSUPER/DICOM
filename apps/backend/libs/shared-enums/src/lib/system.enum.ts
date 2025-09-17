export enum NotificationType {
  AI_RESULT = 'ai_result',
  URGENT_CASE = 'urgent_case',
  ASSIGNMENT = 'assignment',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}
export enum LogCategory {
  SYSTEM = 'system',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  IMAGING = 'imaging',
  PATIENT = 'patient',
  NETWORK = 'network',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  BACKUP = 'backup',
  RESTORE = 'restore',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  ERROR = 'error',
}