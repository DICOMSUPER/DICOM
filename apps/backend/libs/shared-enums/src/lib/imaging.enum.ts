export enum ImagingOrderStatus {
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
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  REPORTED = 'reported',
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
  TEXT = 'textt',
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
