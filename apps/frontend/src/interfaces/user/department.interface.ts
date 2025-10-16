import { BaseEntity } from "../base.interface";

export interface Department  extends BaseEntity {
  id: string;
  headDepartmentId: string;
  departmentName: string;
  departmentCode: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface RoomPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}