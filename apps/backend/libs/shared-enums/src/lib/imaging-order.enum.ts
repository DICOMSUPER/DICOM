export enum OrderStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum OrderPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
  EMERGENCY = 'emergency',
}

export enum OrderType {
  DIAGNOSTIC = 'diagnostic',
  SCREENING = 'screening',
  FOLLOW_UP = 'follow_up',
  PROCEDURE = 'procedure',
}