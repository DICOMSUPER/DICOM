import { RoomType } from "@/enums/patient.enum";
import { BaseEntity } from "../base.interface";
import { Department } from "./department.interface";


export interface Room {
  id: string;
  roomCode: string;
  roomType: string;
  floor: number;
  capacity: number;
  pricePerDay: string;
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
  createdAt: string;
  updatedAt: string;
  department: Department;
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
  pricePerDay: number;
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

export interface UpdateRoomDto extends Partial<CreateRoomDto> {} 

export interface RoomAssignment extends BaseEntity {
  assignment_id: string;
  room_id: string;
  employee_id: string;
  assigned_from: Date;
  assigned_to?: Date;
  role_in_room?: string;
  is_primary?: boolean;
  is_active?: boolean;
  created_by?: string;
}