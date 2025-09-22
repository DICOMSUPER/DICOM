import { QueueStatus, QueuePriorityLevel } from '@/enums/patient.enum';

export interface QueueAssignment {
  id: string;
  visitId: string;
  queueNumber: number;
  assignmentDate: Date;
  assignmentExpiresDate: Date;
  status: QueueStatus;
  priority: QueuePriorityLevel;
  roomId?: string;
  priorityReason?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  visit?: {
    id: string;
    patientId: string;
    encounterType: string;
    chiefComplaint?: string;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      patientCode: string;
    };
  };
}

export interface CreateQueueAssignmentDto {
  visitId: string;
  queueNumber: number;
  roomId?: string;
  priority?: QueuePriorityLevel;
  priorityReason?: string;
  status?: QueueStatus;
  createdBy: string;
}

export interface UpdateQueueAssignmentDto {
  roomId?: string;
  priority?: QueuePriorityLevel;
  priorityReason?: string;
  status?: QueueStatus;
}

export interface QueueAssignmentSearchFilters {
  visitId?: string;
  status?: QueueStatus;
  priority?: QueuePriorityLevel;
  roomId?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
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
