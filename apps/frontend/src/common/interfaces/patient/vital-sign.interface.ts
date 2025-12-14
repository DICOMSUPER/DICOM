export interface VitalSign {
  id: number;
//   patientId: number;
  encounterId?: number;
  measuredAt: string;
  temperature?: number;
  heartRate?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  respiratoryRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}