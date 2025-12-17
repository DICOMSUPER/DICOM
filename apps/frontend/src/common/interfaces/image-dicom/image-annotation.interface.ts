import { AnnotationStatus, AnnotationType } from "@/common/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { DicomInstance } from "./dicom-instances.interface";
import type { Annotation, Handles } from "@cornerstonejs/tools/types";
import { User } from "../user/user.interface";
export interface ImageAnnotation extends BaseEntity {
  id: string;
  annotationId?: string;
  instanceId: string;
  annotatorId: string;
  annotationType: AnnotationType;
  annotationData: Annotation;
  coordinates?: Handles;
  measurementValue?: number;
  measurementUnit?: string;
  textContent?: string;
  colorCode?: string;
  annotationStatus: AnnotationStatus;
  annotationDate?: string;
  reviewDate?: string;
  reviewerId?: string;
  reviewer?: User;
  notes?: string;
  instance?: DicomInstance;
}