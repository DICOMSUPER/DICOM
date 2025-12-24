import { BaseEntity } from "../base.interface";
import { ClinicalStatus } from "@/common/enums/patient-workflow.enum";

export interface PatientCondition extends BaseEntity {
  id: string;
  patientId: string;
  code: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: ClinicalStatus;
  bodySite?: string;
  recordedDate: Date;
  notes?: string;
}

export interface CreatePatientConditionDto {
  patientId: string;
  code: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: ClinicalStatus;
  bodySite?: string;
  recordedDate?: string;
  notes?: string;
}

export interface UpdatePatientConditionDto {
  code?: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: ClinicalStatus;
  bodySite?: string;
  recordedDate?: string;
  notes?: string;
}

export interface PatientConditionSearchFilters {
  patientId?: string;
  code?: string;
  clinicalStatus?: ClinicalStatus;
  bodySite?: string;
  recordedDateFrom?: string;
  recordedDateTo?: string;
  limit?: number;
  offset?: number;
}
