import { BaseEntity } from "../base.interface";
import { BodyPart } from "../image-dicom/body-part.interface";
import { ImagingModality } from "../image-dicom/imaging_modality.interface";
import { User } from "../user/user.interface";
import { DiagnosisReport } from "./patient-workflow.interface";

export interface ReportTemplate extends BaseEntity {
  id: string;
  reportTemplatesId: string;
  templateName: string;
  templateType: string;
  ownerUserId: User;
  modalityId?: string | null;
  bodyPartId?: string | null;
  isPublic: boolean;
  descriptionTemplate?: string | null;
  technicalTemplate?: string | null;
  findingsTemplate?: string | null;
  conclusionTemplate?: string | null;
  recommendationTemplate?: string | null;
  diagnosisReports?: DiagnosisReport[];
  modality?: ImagingModality | null;
  bodyPart?: BodyPart | null;
}
