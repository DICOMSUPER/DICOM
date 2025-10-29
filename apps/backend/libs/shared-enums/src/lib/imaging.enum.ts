export enum ImagingOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Urgency {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
}

export enum DicomStudyStatus {
  SCANNED = 'scanned',
  TECHNICIAN_VERIFIED = 'technician_verified',
  READING = 'reading',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  RESULT_PRINTED = 'result_printed',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum Severity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export enum AnnotationType {
  TEXT = 'text',
  ARROW = 'arrow',
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  POLYGON = 'polygon',
  MEASUREMENT = 'measurement',
}

export enum AnnotationStatus {
  DRAFT = 'draft',
  FINAL = 'final',
  REVIEWED = 'reviewed',
  ARCHIVED = 'archived',
}

export enum DiagnosisType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DIFFERENTIAL = 'differential',
  PROVISIONAL = 'provisional',
  FINAL = 'final',
}

export enum DiagnosisStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  INACTIVE = 'inactive',
  RULED_OUT = 'ruled_out',
}
