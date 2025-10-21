import { VitalSignsSimplified } from "@/interfaces/patient/patient-workflow.interface";


export interface NextAppointment {
  date: string;
  time: string;
  type: string;
  doctor: string;
}


export interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'Completed' | 'Pending';
  results?: string;
}

export interface MedicalProcedure {
  id: string;
  date: string;
  procedure: string;
  doctor: string;
  location: string;
  notes: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface Diagnosis {
  id: string;
  date: string;
  condition: string;
  icd10Code: string;
  doctor: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}





