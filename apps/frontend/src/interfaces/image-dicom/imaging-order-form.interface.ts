

import { BaseEntity, Patient } from "../patient/patient-workflow.interface";
import { Room } from "../user/room.interface";
import { CreateImagingOrderDto, ImagingOrder } from "./imaging-order.interface";

export interface ICreateImagingOrderForm {
  patientId: string;
  encounterId: string;
  roomId: string;
  diagnosis?: string;
  notes?: string;
  imagingOrders: CreateImagingOrderDto[];
}
export enum OrderFormStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface ImagingOrderForm {
  id: string;
  patientId: string;
  encounterId: string;
  orderingPhysicianId: string;
  imagingOrders?: ImagingOrder[]; // Optional if not always loaded
  orderFormStatus: OrderFormStatus;
  notes?: string;
  roomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}
export interface IImagingOrderForm extends BaseEntity {
  patientId: string;
  patient?: Patient;
  encounterId: string;
  orderingPhysicianId?: string;
  imagingOrders?: ImagingOrder[];
  orderFormStatus: OrderFormStatus;
  diagnosis?: string | null;
  notes?: string | null;
  roomId?: string | null;
  room: Room | null;
}
export interface ImagingOrderFormFilters {
  status?: OrderFormStatus | "all";
  patientName?: string;
}


// export interface ImagingOrder {
//   createdAt: string;
//   updatedAt: string;
//   isDeleted: boolean;
//   id: string;
//   orderNumber: number;
//   procedureId: string;
//   orderStatus: string;
//   imagingOrderFormId: string;
//   completedDate: string | null;
//   clinicalIndication: string;
//   contrastRequired: boolean;
//   specialInstructions: string;
// }

// export interface ImagingOrderForm {
//   createdAt: string;
//   updatedAt: string;
//   isDeleted: boolean;
//   id: string;
//   patientId: string;
//   encounterId: string;
//   orderingPhysicianId: string;
//   orderFormStatus: string;
//   notes: string;
//   roomId: string;
//   imagingOrders: ImagingOrder[];
// }

export interface ImagingOrderFormResponseData {
  data: ImagingOrderForm[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ImagingOrderFormResponse {
  success: boolean;
  data: ImagingOrderFormResponseData;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
}