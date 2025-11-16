import { PatientEncounter } from "../patient/patient-workflow.interface";
import { Room } from "./room.interface";
import { Services } from "./service.interface";

export interface ServiceRoom {
  id: string;
  serviceId: string;
  roomId: string;
  service?: Services;
  room?: Room;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  patientEncounter?: PatientEncounter[];
}

export interface CreateServiceRoomDto {
  serviceId: string;
  roomId: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateServiceRoomDto {
  isActive?: boolean;
  notes?: string;
}

export interface FilterServiceRoomDto {
  page?: number;
  limit?: number;
  serviceId?: string;
  roomId?: string;
  roomCode?: string;
  serviceName?: string;
  isActive?: boolean;
}
