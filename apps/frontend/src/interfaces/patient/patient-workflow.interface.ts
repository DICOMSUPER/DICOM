import {
  Gender,
  BloodType,
  EncounterType,
  DiagnosisType,
  DiagnosisStatus,
  Severity,
  VitalSignCode,
  VitalSignUnit,
  PatientStatus,
  PatientWorkflowStep,
  PatientViewMode,
  PatientSortBy,
  PatientFilterType,
  EncounterStatus,
  EncounterPriorityLevel,
} from "@/enums/patient-workflow.enum";
import {
  PatientCondition,
  CreatePatientConditionDto,
} from "./patient-condition.interface";
import { ServiceRoom } from "../user/service-room.interface";
import { ReportTemplate } from "./report-template.interface";
import { User } from "../user/user.interface";

// Re-export enums for convenience
export {
  Gender,
  BloodType,
  EncounterType,
  DiagnosisType,
  DiagnosisStatus,
  Severity,
  VitalSignCode,
  VitalSignUnit,
  PatientStatus,
  PatientWorkflowStep,
  PatientViewMode,
  PatientSortBy,
  PatientFilterType,
};

/**
 * Base interfaces for patient workflow
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface Patient extends BaseEntity {
  patientCode: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive?: boolean;
  createdBy?: string;
  encountersCount?: number;
  diagnosesCount?: number;
  lastEncounterDate?: Date;
  encounters?: PatientEncounter[];
  conditions?: PatientCondition[];
}

export interface PatientEncounter extends BaseEntity {
  patientId: string;
  encounterDate: Date;
  orderNumber?: number;
  encounterType: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsSimplified;
  assignedPhysicianId?: string;

  notes?: string;
  status: EncounterStatus;
  priority?: EncounterPriorityLevel;
  roomId?: string;
  roomFloor?: string;
  physicianSpecialty?: string;
  patient?: Patient;
  diagnosesCount?: number;
  createdBy?: string;
  serviceRoomId?: string;
  serviceRoom: ServiceRoom;
  isTransferred?: boolean;
  transferNotes?: string;
  transferredBy?: string;

  assignedPhysician?: User;
  createdByUser?: User;
}

export interface VitalSignMeasurement {
  code: VitalSignCode;
  display: string;
  value: number;
  unit: VitalSignUnit;
  measuredAt?: Date;
  notes?: string;
  referenceRange?: {
    low?: number;
    high?: number;
    text?: string;
  };
}

export interface VitalSignsCollection {
  [code: string]: VitalSignMeasurement;
}

export interface DiagnosisReport extends BaseEntity {
  encounterId: string;
  studyId: string;
  signatureId?: string;
  reportTemplateId?: string;
  diagnosisName: string;
  description?: string;
  diagnosisType: DiagnosisType;
  diagnosisStatus: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate: Date;
  diagnosedBy: string;
  notes?: string;
  encounter?: PatientEncounter;
  reportTemplate?: ReportTemplate | null;
}

export interface CreatePatientDto {
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive?: boolean;
  createdBy?: string;
  conditions?: CreatePatientConditionDto[];
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  patientCode?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive?: boolean;
  conditions?: CreatePatientConditionDto[];
}

export interface VitalSignsSimplified {
  bpSystolic?: number; // Blood Pressure Systolic (mmHg)
  bpDiastolic?: number; // Blood Pressure Diastolic (mmHg)
  heartRate?: number; // Heart Rate (bpm)
  respiratoryRate?: number; // Respiratory Rate (breaths/min)
  temperature?: number; // Body Temperature (°C or °F)
  oxygenSaturation?: number; // Oxygen Saturation (%)
  weight?: number; // Weight (kg or lbs)
  height?: number; // Height (cm or inches)
}

export interface CreatePatientEncounterDto {
  patientId: string;
  encounterDate: string;
  encounterType: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsSimplified;
  assignedPhysicianId?: string | null;
  serviceRoomId: string;
  notes?: string;
}

export interface UpdatePatientEncounterDto {
  encounterDate?: string;
  encounterType?: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsSimplified;
  assignedPhysicianId?: string;
  notes?: string;
  status?: EncounterStatus;
  isTransferred?: boolean;
  transferNotes?: string;
}

export interface CreateDiagnosisReportDto {
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description?: string;
  diagnosisType: DiagnosisType;
  diagnosisStatus?: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate: string;
  diagnosedBy: string;
  notes?: string;
  reportTemplateId?: string;
}

export interface UpdateDiagnosisReportDto {
  diagnosisName?: string;
  description?: string;
  diagnosisType?: DiagnosisType;
  diagnosisStatus?: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate?: string;
  notes?: string;
  reportTemplateId?: string;
}

/**
 * Search and filter interfaces
 */

export interface PatientSearchFilters {
  searchTerm?: string;
  patientCode?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  gender?: Gender;
  bloodType?: BloodType;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
}

export interface EncounterSearchFilters {
  patientId?: string;
  encounterType?: EncounterType;
  encounterDateFrom?: string;
  encounterDateTo?: string;
  assignedPhysicianId?: string;
  chiefComplaint?: string;
  searchTerm?: string;
  priority?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}

export interface DiagnosisSearchFilters {
  encounterId?: string;
  patientId?: string;
  diagnosisType?: DiagnosisType;
  diagnosisStatus?: DiagnosisStatus;
  severity?: Severity;
  diagnosedBy?: string;
  diagnosisDateFrom?: string;
  diagnosisDateTo?: string;
  diagnosisName?: string;
  followupRequired?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Pagination interfaces
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Statistics interfaces
 */

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  deletedPatients: number;
  newPatientsThisMonth: number;
}

export interface EncounterStats {
  totalEncounters: number;
  encountersByType: Record<string, number>;
  encountersThisMonth: number;
  averageEncountersPerPatient: number;
  todayEncounter: number;
  todayStatEncounter: number;
}

export interface DiagnosisStats {
  totalDiagnoses: number;
  diagnosesByType: Record<string, number>;
  diagnosesByStatus: Record<string, number>;
  diagnosesBySeverity: Record<string, number>;
  diagnosesThisMonth: number;
  followupRequiredCount: number;
}

/**
 * UI State interfaces
 */

export interface PatientListState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  pagination: PaginationParams;
  total: number;
  filters: PatientSearchFilters;
  sortBy: PatientSortBy;
  sortOrder: "asc" | "desc";
  viewMode: PatientViewMode;
  selectedPatients: string[];
}

export interface PatientDetailState {
  patient: Patient | null;
  encounters: PatientEncounter[];
  diagnoses: DiagnosisReport[];
  loading: boolean;
  error: string | null;
  activeTab: "overview" | "encounters" | "diagnoses" | "vital-signs";
}

export interface PatientFormState {
  patient: Partial<CreatePatientDto>;
  encounter: Partial<CreatePatientEncounterDto>;
  diagnosis: Partial<CreateDiagnosisReportDto>;
  vitalSigns: VitalSignsCollection;
  currentStep: PatientWorkflowStep;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

/**
 * Component props interfaces
 */

export interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onSelect: (patientId: string, selected: boolean) => void;
  selected?: boolean;
  viewMode: PatientViewMode;
}

export interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onEdit: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onSelect: (patientId: string, selected: boolean) => void;
  selectedPatients: string[];
  viewMode: PatientViewMode;
  sortBy: PatientSortBy;
  sortOrder: "asc" | "desc";
  onSort: (field: PatientSortBy) => void;
}

export interface PatientFiltersProps {
  filters: PatientSearchFilters;
  onFiltersChange: (filters: PatientSearchFilters) => void;
  onClearFilters: () => void;
  onSearch: () => void;
  loading: boolean;
}

export interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: CreatePatientDto | UpdatePatientDto) => void;
  onCancel: () => void;
  loading: boolean;
  errors: Record<string, string>;
  className?: string;
}

export interface EncounterFormProps {
  patientId: string;
  encounter?: PatientEncounter;
  onSubmit: (
    data: CreatePatientEncounterDto | UpdatePatientEncounterDto
  ) => void;
  onCancel: () => void;
  loading: boolean;
  errors: Record<string, string>;
}

export interface DiagnosisFormProps {
  encounterId: string;
  diagnosis?: DiagnosisReport;
  onSubmit: (data: CreateDiagnosisReportDto | UpdateDiagnosisReportDto) => void;
  onCancel: () => void;
  loading: boolean;
  errors: Record<string, string>;
}

export interface VitalSignsFormProps {
  vitalSigns: VitalSignsCollection;
  onChange: (vitalSigns: VitalSignsCollection) => void;
  errors: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
  path?: string;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

export interface PatientOverview {
  recentVitalSigns: VitalSignsSimplified;
  recentConditions: PatientCondition[];
}

export interface EncounterStatsInDateRange {
  totalEncounters: number;
  totalCompletedEncounters: number;
  totalArrivedEncounters: number;
}

export interface DicomStudyStatsInDateRange {
  today: {
    totalDicomStudies: number;
    totalScannedStudies: number;
    totalPendingApprovalStudies: number;
    totalApprovedStudies: number;
    totalTechnicianVerifiedStudies: number;
    totalResultPrintedStudies: number;
  };
  total: {
    totalDicomStudies: number;
    totalScannedStudies: number;
    totalPendingApprovalStudies: number;
    totalApprovedStudies: number;
    totalTechnicianVerifiedStudies: number;
    totalResultPrintedStudies: number;
  };
}
