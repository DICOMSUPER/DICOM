import { BaseEntity } from "../base.interface";
import { Room } from "./room.interface";



export interface Department extends BaseEntity {
  id: string;
  departmentName: string;
  departmentCode: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  headDepartmentId?: string | null;
  headDepartment?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    employeeId?: string | null;
    isVerified: boolean;
    role: string;
    departmentId?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
  };
  rooms?: Room[];
  createdAt: Date;
  updatedAt: Date;
}


export interface RoomPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}