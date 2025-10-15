import { QueuePriorityLevel, QueueStatus } from "@/enums/patient.enum";


import { BaseEntity, EncounterType, PaginationParams, Patient } from "./patient-workflow.interface";

// export interface PatientEncounter extends BaseEntity {
//   patientId: string;
//   patient: Patient
//   encounterDate?: Date;
//   encounterType: EncounterType;
//   chiefComplaint?: string;
//   symptoms?: string;
//   vitalSigns?: Record<string, any> | null;
//   assignedPhysicianId?: string;
//   notes?: string;
//   createdBy?: string;
// }

export interface QueueFilters {
    encounterId?: string,
    status?: QueueStatus | "all",
    priority?: QueuePriorityLevel | "all",
    roomId?: string,
    createdBy?: string,
    patientId?: string,
    assignmentDateFrom?: string ,
    assignmentDateTo?: string ,
    queueNumber?: number ,
}

export interface QueueStats {
  appointments: number;
  totalServedTokens: number;
  remainingTokens: number;
  currentServingToken: string;
}