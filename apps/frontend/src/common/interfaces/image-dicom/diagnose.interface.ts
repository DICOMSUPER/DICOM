import { DiagnosisType, Severity, DiagnosisStatus } from "@/common/enums/patient-workflow.enum";

export interface CreateDiagnosisPayload {
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description: string;
  diagnosisType: DiagnosisType;
  severity: Severity;
  diagnosisDate: string;
  diagnosedBy: string;
  diagnosisStatus: DiagnosisStatus;
  notes?: string;
}
