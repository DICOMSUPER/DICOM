import {
  ClinicalStatus,
  ConditionVerificationStatus,
} from '@backend/shared-enums';
import { IPatientBasic } from './patient.interface';

export interface IPatientCondition {
  id: string;
  patientId: string;
  code: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: ClinicalStatus;
  verificationStatus?: ConditionVerificationStatus;
  severity?: string;
  stageSummary?: string;
  bodySite?: string;
  recordedDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: IPatientBasic;
}

export interface IConditionWithDetails extends IPatientCondition {
  patient?: IPatientBasic;
}
