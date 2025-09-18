import { Severity } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";

export interface DiagnosesReport extends BaseEntity {
  diagnosis_id: string;
  study_id: string;
  primary_diagnosis?: string;
  secondary_diagnoses?: string[];
  severity?: Severity;
  notes?: string;
  physician_notes?: string;
  follow_up_required?: boolean;
  follow_up_instructions?: string;
  diagnosis_date?: Date;
  diagnosedBy?: string;
}
