import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { BaseEntity, Patient } from "../patient/patient-workflow.interface";
import { ImagingModality } from "./imaging_modality.interface";
import { RequestProcedure } from "./request-procedure.interface";
import { User } from "../user/user.interface";
import { ImagingOrderForm } from "./imaging-order-form.interface";

export interface CreateImagingOrderDto {
  // patientId: string;
  orderingPhysicianId?: string;
  // modalityId: string;
  // bodyPart: string;
  request_procedure_id?: string;
  orderStatus?: ImagingOrderStatus;
  clinicalIndication?: string;
  contrastRequired?: boolean;
  specialInstructions?: string;
}

export type UpdateImagingOrderDto = Partial<CreateImagingOrderDto>;

export interface ImagingOrder extends BaseEntity {
  orderNumber: string;
  patientId?: string;
  orderingPhysicianId?: string;
  modalityId?: string;
  modality?: ImagingModality;
  procedureId?: string;
  procedure?: RequestProcedure;
  orderStatus?: ImagingOrderStatus;
  imagingOrderForm?: ImagingOrderForm;
  imagingOrderFormId?: string;
  bodyPart?: string;
  completedDate?: Date;
  clinicalIndication?: string;
  contrastRequired?: boolean;
  specialInstructions?: string;
  roomId?: string;
  notes?: string;

  //from filter
  patient: Patient;
  orderPhysician: User;
}
