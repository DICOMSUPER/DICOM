import { QueueStatus, VisitType } from "@/enums/patient.enum";
import { BaseEntity } from "../base.interface";
import { Patient } from "./patient.interface";

export interface PatientEncounter extends BaseEntity {
  visit_id: string;
  patient_id: string;
  patient: Patient
  visit_date?: Date;
  visit_type: VisitType;
  chief_complaint?: string;
  symptoms?: string;
  vital_signs?: Record<string, any> | null;
  assigned_physician_id?: string;
  notes?: string;
  created_by?: string;
}

export interface QueueFilters {
  status?: QueueStatus | 'All';
  visitType?: VisitType | 'All';
  priority?: string;
  period?: 'today' | 'week' | 'month';
}

export interface QueueStats {
  appointments: number;
  totalServedTokens: number;
  remainingTokens: number;
  currentServingToken: string;
}