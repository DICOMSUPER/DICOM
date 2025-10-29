import { BaseEntity } from "../patient/patient-workflow.interface";
import { Room } from "../user/room.interface";
import { CreateImagingOrderDto, ImagingOrder } from "./imaging-order.interface";

export interface ICreateImagingOrderForm  {
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

export interface IImagingOrderForm extends BaseEntity {
  patientId: string;
  encounterId: string;
  orderingPhysicianId?: string;
  imagingOrders?: ImagingOrder[];
  orderFormStatus: OrderFormStatus;
  notes?: string | null;
  roomId?: string | null;
  room: Room | null;
}
