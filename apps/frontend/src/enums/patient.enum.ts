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

export enum QueueStatus {
  WAITING = "waiting",
  COMPLETED = "completed",
}
export enum PriorityLevel {
  ROUTINE = "Routine",  // bình thường
  MEDIUM = "Medium",    // trung bình
  HIGH = "High",        // cao
  URGENT = "Urgent",    // khẩn cấp
}