import { VisitType } from "@/enums/patient.enum";
import { BaseEntity } from "../base.interface";

export interface PatientVisit extends BaseEntity {
  visit_id: string;
  patient_id: string;
  visit_date?: Date;
  visit_type: VisitType;
  chief_complaint?: string;
  symptoms?: string;
  vital_signs?: Record<string, any>;
  assigned_physician_id?: string;
  notes?: string;
  created_by?: string;
}