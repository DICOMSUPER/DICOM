import { ImagingModality } from "./imaging_modality.interface";
import { RequestProcedure } from "./request-procedure.interface";

export interface ImagingOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  orderingPhysicianId: string;
  modalityId: string;
  procedureId: string | null;
  orderStatus: string;
  bodyPart: string;
  completedDate: string | null;
  clinicalIndication: string;
  contrastRequired: boolean;
  specialInstructions: string;
  roomId: string;
  notes: string;
  modality: ImagingModality;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  procedure?:RequestProcedure
}
