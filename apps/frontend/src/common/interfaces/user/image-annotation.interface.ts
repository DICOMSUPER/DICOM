import { AnnotationStatus, AnnotationType } from "@/common/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { DicomInstance } from "../image-dicom/dicom-instances.interface";


export interface ImageAnnotation extends BaseEntity {
  id: string;
  annotationId?: string;
  instanceId: string;
  annotatorId: string;
  annotationType: AnnotationType;
  annotationData: Record<string, unknown>;
  coordinates?: Record<string, unknown>;
  measurementValue?: number;
  measurementUnit?: string;
  textContent?: string;
  colorCode?: string;
  annotationStatus: AnnotationStatus;
  annotationDate?: string;
  reviewDate?: string;
  notes?: string;
  isVisible?: boolean;
  createdBy?: string;
  instance?: DicomInstance;
}