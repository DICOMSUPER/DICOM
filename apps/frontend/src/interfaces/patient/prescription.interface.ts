import { BaseEntity } from "../base.interface";

export interface Prescription extends BaseEntity {
  prescription_id: string;
  prescription_number?: string;
  visit_id?: string;
  report_id?: string;
  physician_id?: string;
  prescription_date?: Date;
  notes?: string;
  created_by?: string;
}

export interface PrescriptionItem extends BaseEntity {
  item_id: string;
  prescription_id?: string;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  notes?: string;
}
