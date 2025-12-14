import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from "@/common/enums/patient-workflow.enum";
import { QueryParams } from "../pagination/pagination.interface";

export interface PatientEncounterFilters extends QueryParams {
  encounterId?: string;
  status?: EncounterStatus | "all";
  priority?: EncounterPriorityLevel | "all";
  roomId?: string;
  createdBy?: string;
  patientCode?: string;
  patientName?: string;
  assignmentDateFrom?: string;
  assignmentDateTo?: string;
  orderNumber?: number;
}

export interface FilterEncounterWithPaginationParams extends QueryParams {
  page?: number;
  limit?: number;
  serviceId?: string;
  search?: string;
  searchField?: string;
  sortField?: string;
  order?: "asc" | "desc";
  status?: EncounterStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  priority?: string;
  type?: EncounterType;
}

export interface QueueStats {
  appointments: number;
  totalServedTokens: number;
  remainingTokens: number;
  currentServingToken: string;
}
