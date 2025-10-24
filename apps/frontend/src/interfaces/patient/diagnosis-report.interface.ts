import { Severity } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { DiagnosisStatus } from "./patient-workflow.interface";

export interface DiagnosesReport extends BaseEntity {
  id: string;
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description: string;
  diagnosisType: string;
  diagnosisStatus: DiagnosisStatus;
  severity: Severity;
  diagnosisDate: string;
  diagnosedBy: string;
  notes: string;
}
