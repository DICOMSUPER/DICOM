export enum VisitType {
  OUTPATIENT = "outpatient",
  INPATIENT = "inpatient",
  EMERGENCY = "emergency",
}

export enum RoomType {
  CT = "CT",
  WC = "WC",
}

export enum QueueStatus {
  WAITING = "waiting",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

export enum QueuePriorityLevel {
  ROUTINE = "routine",
  URGENT = "urgent",
  STAT = "stat"
}