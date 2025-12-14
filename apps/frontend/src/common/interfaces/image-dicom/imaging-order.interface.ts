import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import { BaseEntity, Patient } from "../patient/patient-workflow.interface";
import { ImagingModality } from "./imaging_modality.interface";
import { RequestProcedure } from "./request-procedure.interface";
import { User } from "../user/user.interface";
import { ImagingOrderForm } from "./imaging-order-form.interface";
import { DicomStudy } from "./dicom-study.interface";

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
  studies?: DicomStudy[] | [];

  //from filter
  patient: Patient;
  orderPhysician: User;
}

interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface QueueInfo {
  maxWaiting: number | null;
  currentInProgress: number | null;
  stats: QueueStats;
}
