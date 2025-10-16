import { QueueStatus, QueuePriorityLevel } from "@/enums/patient.enum";

import { BaseEntity, PatientEncounter } from "./patient-workflow.interface";
import { QueryParams } from '../pagination/pagination.interface';

export interface QueueAssignment extends BaseEntity {
  encounterId: string;
  queueNumber: number;
  assignmentDate: Date;
  assignmentExpiresDate: Date;
  status: QueueStatus;
  priority: QueuePriorityLevel;
  estimatedWaitTime:number
  roomId?: string;
  priorityReason?: string;
  calledBy?: string;
  calledAt?: string;
  createdBy?: string;
  encounter: PatientEncounter;
}



export interface CreateQueueAssignmentDto {
  encounterId?: string;
  roomId?: string;
  priority?: QueuePriorityLevel;
  priorityReason?: string;
  createdBy?: string;
}

export interface UpdateQueueAssignmentDto {
  roomId?: string;
  priority?: QueuePriorityLevel;
  priorityReason?: string;
  status?: QueueStatus;
}

export interface QueueAssignmentSearchFilters extends QueryParams{
  encounterId?: string;
  status?: QueueStatus | "all";
  priority?: QueuePriorityLevel | "all";
  roomId?: string;
  createdBy?: string;
  patientId?: string;
  assignmentDateFrom?: string;
  assignmentDateTo?: string;
  queueNumber?: number;
}

export interface QueueStats {
  totalWaiting: number;
  totalCompleted: number;
  totalExpired: number;
  byPriority: {
    routine: number;
    urgent: number;
    stat: number;
  };
  byStatus: {
    waiting: number;
    completed: number;
    expired: number;
  };
}
