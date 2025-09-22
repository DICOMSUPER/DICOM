import { ClinicalStatus, ConditionVerificationStatus } from '@backend/shared-enums';

export class PatientConditionResponseDto {
  id!: string;
  patientId!: string;
  code!: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: ClinicalStatus;
  verificationStatus?: ConditionVerificationStatus;
  severity?: string;
  stageSummary?: string;
  bodySite?: string;
  recordedDate!: Date;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
