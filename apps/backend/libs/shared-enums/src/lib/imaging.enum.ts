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
  REJECTED = 'rejected',
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
  // Measurement tools
  LENGTH = 'Length',
  HEIGHT = 'Height',
  ANGLE = 'Angle',
  COBB_ANGLE = 'CobbAngle',
  BIDIRECTIONAL = 'Bidirectional',
  SEGMENT_BIDIRECTIONAL = 'SegmentBidirectional',

  // ROI (Region of Interest) tools
  CIRCLE_ROI = 'CircleROI',
  ELLIPTICAL_ROI = 'EllipticalROI',
  RECTANGLE_ROI = 'RectangleROI',
  SPLINE_ROI = 'SplineROI',

  // Annotation tools
  ARROW_ANNOTATE = 'ArrowAnnotate',
  LABEL = 'Label',
  PROBE = 'Probe',
  DRAG_PROBE = 'DragProbe',
  PLANAR_FREEHAND_ROI = 'PlanarFreehandROI',
}

export enum AnnotationStatus {
  DRAFT = 'draft',
  FINAL = 'final',
  REVIEWED = 'reviewed',
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
