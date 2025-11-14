import { BaseEntity } from "../base.interface";
import { PaginatedQuery } from "../pagination/pagination.interface";
import { ServiceRoom } from "./service-room.interface";

export interface Services extends BaseEntity {
  id: string;
  serviceCode: string;
  serviceName: string;
  description?: string;
  isActive: boolean;
  serviceRooms: ServiceRoom[];
}

export interface CreateServiceDto {
  serviceCode?: string;
  serviceName: string;
  description?: string;
  isActive?: boolean;
}

export interface IFilterService extends PaginatedQuery {
  serviceCode?: string;
  serviceName?: string;
  isActive?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;
