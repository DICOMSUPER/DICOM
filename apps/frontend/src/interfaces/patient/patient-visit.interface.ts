import { EncounterPriorityLevel, EncounterStatus } from "@/enums/patient-workflow.enum";
import { QueryParams } from "../pagination/pagination.interface";

export interface PatientEncounterFilters extends QueryParams {
  encounterId?: string;
  status?: EncounterStatus | "all";
  priority?: EncounterPriorityLevel | "all";
  roomCode?: string;
  createdBy?: string;
  patientCode?: string;
  patientName?: string;
  assignmentDateFrom?: string;
  assignmentDateTo?: string;
  orderNumber?: number;
}

export interface QueueStats {
  appointments: number;
  totalServedTokens: number;
  remainingTokens: number;
  currentServingToken: string;
}
