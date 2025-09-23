import { BaseEntity } from "../base.interface";
import { PatientEncounter } from "./patient-workflow.interface";

export interface QueueAssignment extends BaseEntity {
  id: string;
  encounterId: string;
  queueNumber: number;
  assignmentDate: Date;
  assignmentExpiresDate: Date;
  status: QueueStatus;
  priority: QueuePriorityLevel;
  roomId?: string;
  priorityReason?: string;
  createdBy?: string;
  encounter: PatientEncounter;
}

export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum QueuePriorityLevel {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
}
