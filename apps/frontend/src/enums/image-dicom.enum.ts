export enum ImagingOrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum Urgency {
  ROUTINE = "routine",
  URGENT = "urgent",
  STAT = "stat",
}

export enum DicomStudyStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  VERIFIED = "verified",
  REPORTED = "reported",
}

export enum AnalysisStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum Severity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

export enum AnnotationType {
  TEXT = "text",  
  ARROW = "arrow",
  CIRCLE = "circle",
  RECTANGLE = "rectangle",
  POLYGON = "polygon",
  MEASUREMENT = "measurement",
}