import { ImagingOrderForm } from "./imaging-order-form.interface";
import { ImagingModality } from "./imaging_modality.interface";
import { RequestProcedure } from "./request-procedure.interface";
import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";

export interface ImagingOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  // orderingPhysicianId: string;
  modalityId: string;
  procedureId: string | null;
  orderStatus: ImagingOrderStatus;
  bodyPart: string;
  completedDate: string | null;
  clinicalIndication: string;
  contrastRequired: boolean;
  specialInstructions: string;
  roomId: string;
  notes: string;
  modality: ImagingModality;
  imagingOrderForm: ImagingOrderForm;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  procedure?: RequestProcedure;
}
