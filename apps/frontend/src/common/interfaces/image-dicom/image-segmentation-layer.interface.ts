import { DicomInstance } from "./dicom-instances.interface";
import { User } from "../user/user.interface";
import { SegmentationStatus } from "@/common/enums/image-dicom.enum";

export interface ImageSegmentationLayer {
  id: string;
  layerName: string;
  instanceId: string;
  instance?: DicomInstance;
  segmentatorId: string;
  segmentator?: User;
  reviewerId: string;
  reviewer?: User;
  reviewDate?: Date;
  notes?: string | null;
  frame?: number;
  segmentationStatus?: SegmentationStatus;
  colorCode?: string;
  segmentationDate?: Date;
  snapshots: object[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateImageSegmentationLayerDto {
  layerName?: string;
  instanceId: string;
  segmentatorId?: string;
  notes?: string;
  frame?: number;
  segmentationStatus?: SegmentationStatus;
  colorCode?: string;
  segmentationDate?: Date | string;
  reviewerId?: string;
  reviewDate?: Date | string;
  snapshots: object[];
}

export type UpdateImageSegmentationLayerDto =
  Partial<CreateImageSegmentationLayerDto>;
