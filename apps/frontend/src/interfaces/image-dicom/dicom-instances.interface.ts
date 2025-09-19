import { BaseEntity } from "../base.interface";

export interface DicomInstance extends BaseEntity {
  instance_id: string;
  sop_instance_uid: string;
  series_id: string;
  instance_number: number;
  file_path: string;
  file_name: string;
  image_position?: Record<string, any>;
  image_orientation?: Record<string, any>;
  pixel_spacing?: Record<string, any>;
  slice_thickness?: number;
  window_center?: number;
  window_width?: number;
  rows?: number;
  columns?: number;
}