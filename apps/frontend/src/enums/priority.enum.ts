export enum PriorityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  URGENT = 'urgent',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum StatusLevel {
  ACTIVE = 'active',
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  URGENT = 'urgent'
}

export const HIGH_PRIORITY_LEVELS = [PriorityLevel.CRITICAL, PriorityLevel.HIGH];
export const URGENT_STATUS_LEVELS = [StatusLevel.URGENT, StatusLevel.ACTIVE];
