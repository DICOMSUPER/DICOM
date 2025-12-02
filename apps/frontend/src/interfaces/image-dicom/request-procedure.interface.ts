import { BaseEntity } from "../patient/patient-workflow.interface";
import { BodyPart } from "./body-part.interface";
import { ImagingModality } from "./imaging_modality.interface";

export interface RequestProcedure extends BaseEntity {
  name: string;
  modalityId: string;
  modality?: ImagingModality | null;
  bodyPartId: string;
  bodyPart?: BodyPart | null;
  description?: string | null;
  isActive?: boolean;
}
