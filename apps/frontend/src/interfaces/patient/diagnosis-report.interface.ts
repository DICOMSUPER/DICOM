import { Severity } from "@/enums/image-dicom.enum";
import { QueryParams } from "../pagination/pagination.interface";
import { DiagnosisStatus, DiagnosisType } from "./patient-workflow.interface";


export interface FilterDiagnosesReport extends QueryParams {
  encounterId?: string;
  patientName?: string;
  studyId?: string;
  diagnosisName?: string;
  diagnosisType?: DiagnosisType;
  diagnosisStatus?: DiagnosisStatus;
  severity?: Severity;
  diagnosisDateFrom?: Date;
  diagnosisDateTo?: Date;
  diagnosedBy?: string;
  reportTemplateId?: string;
}