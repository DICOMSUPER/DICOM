export enum CacheEntity {
  //stats
  analysisStats = 'analysis-stats',

  //imaging service entities
  bodyParts = 'body-parts',
  dicomInstances = 'dicom-instances',
  dicomSeries = 'dicom-series',
  dicomStudies = 'dicom-studies',
  dicomStudySignatures = 'dicom-study-signatures',
  imageAnnotations = 'image-annotations',
  imagingModalities = 'imaging-modalities',
  imagingOrders = 'imaging-orders',
  modalityMachines = 'modality-machines',
  requestProcedures = 'request-procedures',
  imagingOrderForms = 'imaging-order-forms',
  imageSegmentationLayers = 'image-segmentation-layers',

  //user service entities
  users = 'users',
  departments = 'departments',
  digitalSignatures = 'digital-signatures',
  employeeRoomAssignments = 'employee-room-assignments',
  roomSchedules = 'room-schedules',
  rooms = 'rooms',
  serviceRooms = 'service-rooms',
  services = 'services',
  shiftTemplates = 'shift-templates',

  //patient service entities
  patients = 'patients',
  patientConditions = 'patient-conditions',
  patientEncounters = 'patient-encounters',
  reportTemplates = 'report-templates',
  diagnosticReports = 'diagnostic-reports',

  //system service entities
  aiAnnalysis = 'ai-analysis',
  notifications = 'notifications',
}

export enum CacheKeyPattern {
  paginated = 'paginated',
  all = 'all',
  id = 'id',
  byReferenceId = 'by-reference-id',
  filter = 'filter',
  filterWithPagination = 'filter-with-pagination',
  statsInDateRange = 'stats-in-date-range',
  byOrderId = 'by-order-id',
  byStudyId = 'by-study-id',
  bySeriesId = 'by-series-id',
  byInstanceId = 'by-instance-id',
  stats = 'stats',
  byPatientId = 'by-patient-id',
  roomStats = 'room-stats',
  roomStats2 = 'room-stats2',
  filterByRoomId = 'filter-by-room-id',
  roomStatsInDateRange = 'room-stats-in-date-range',
  byRoomId = 'by-room-id',

  receptionStats = 'reception-stats',
}

export const CACHE_TTL_SECONDS = 300 * 1000; // 5 minutes in milliseconds
