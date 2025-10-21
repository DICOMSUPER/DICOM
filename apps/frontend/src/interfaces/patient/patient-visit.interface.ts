import { QueuePriorityLevel, QueueStatus } from "@/enums/patient.enum";




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