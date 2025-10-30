import { ImagingOrder } from "./imaging_order.interface";

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
