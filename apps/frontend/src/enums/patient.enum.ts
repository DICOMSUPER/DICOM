export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum QueuePriorityLevel {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
}