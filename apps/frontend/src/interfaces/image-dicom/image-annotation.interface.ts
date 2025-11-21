import { AnnotationStatus, AnnotationType } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { DicomInstance } from "./dicom-instances.interface";
import type { Annotation, AnnotationData, Handles } from "@cornerstonejs/tools/types";

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
  notes?: string;
  instance?: DicomInstance;
}