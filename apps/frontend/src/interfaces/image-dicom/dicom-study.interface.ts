import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";

export interface DicomStudy extends BaseEntity {
  study_id: string;
  study_instance_uid: string;
  patient_id: string;
  order_id?: string;
  modality_id: string;
  study_date: Date;
  study_time: string;
  study_description?: string;
  referring_physician?: string;
  performing_physician_id?: string;
  technician_id?: string;
  study_status?: DicomStudyStatus;
  number_of_series?: number;
  number_of_instances?: number;
  storage_path?: string;
}