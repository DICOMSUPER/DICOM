import { DicomInstance } from "./dicom-instances.interface";

export interface ImageSegmentationLayer {
  id: string;
  layerName: string;
  instanceId: string;
  instance?: DicomInstance;
  segmentatorId: string;
  notes?: string | null;
  frame: number;
  snapshots: object[];
}

export interface CreateImageSegmentationLayerDto {
  layerName?: string;
  instanceId: string;
  segmentatorId?: string;
  notes?: string;
  frame?: number; // defaults to 1 in DTO class, but optional in interface
  snapshots: object[];
}

export type UpdateImageSegmentationLayerDto =
  Partial<CreateImageSegmentationLayerDto>;
