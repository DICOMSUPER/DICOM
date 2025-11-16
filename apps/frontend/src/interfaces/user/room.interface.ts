import { RoomType } from "@/enums/patient.enum";
import { Department } from "./department.interface";
import { RoomStatus } from "@/enums/room.enum";
import { ServiceRoom } from "./service-room.interface";

export interface Room {
  id: string;
  roomCode: string;
  roomType: RoomType;
  floor: number;
  capacity: number;
  pricePerDay: string;
  status: RoomStatus;
  description: string;
  hasTV: boolean;
  hasAirConditioning: boolean;
  hasWiFi: boolean;
  hasTelephone: boolean;
  hasAttachedBathroom: boolean;
  isWheelchairAccessible: boolean;
  hasOxygenSupply: boolean;
  hasNurseCallButton: boolean;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department: Department;
  roomStats?: {
    currentInProgress?: number;
    maxWaiting?: number;
  };
  serviceRooms: ServiceRoom[];
}

export interface RoomPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateRoomDto {
  roomCode: string;
  roomType: string;
  department: string;
  floor: number;
  capacity: number;
  status: string;
  description: string;
  hasTV: boolean;
  hasAirConditioning: boolean;
  hasWiFi: boolean;
  hasTelephone: boolean;
  hasAttachedBathroom: boolean;
  isWheelchairAccessible: boolean;
  hasOxygenSupply: boolean;
  hasNurseCallButton: boolean;
  notes: string;
  isActive: boolean;
}

export type UpdateRoomDto = Partial<CreateRoomDto>;
