export enum QueueStatus {
  WAITING = "waiting",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

export enum QueuePriorityLevel {
  ROUTINE = "Routine",
  URGENT = "Urgent",
  STAT = "Stat",
}
export enum VisitType {
  OUTPATIENT = "outpatient",
  INPATIENT = "inpatient",
  EMERGENCY = "emergency",
  FOLLOW_UP = "follow_up",
}

export enum RoomType {
  CT = "CT",
  WC = "WC",
}

export enum PriorityLevel {
  ROUTINE = "Routine", // bình thường
  MEDIUM = "Medium", // trung bình
  HIGH = "High", // cao
  URGENT = "Urgent", // khẩn cấp
  STAT = "Stat",
}
