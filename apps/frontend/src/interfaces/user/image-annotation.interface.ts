import { AnnotationType } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";


export interface ImageAnnotation extends BaseEntity {
  annotation_id: string;
  instance_id: string;
  annotator_id: string;
  annotation_type: AnnotationType;
  coordinates?: Record<string, any>;
  annotation_text?: string;
  color_text?: string;
  measurement_value?: number;
  measurement_unit?: string;
  is_visible?: boolean;
  created_by?: string;
}