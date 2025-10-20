import { BaseEntity } from "../base.interface";
export interface ImagingModality extends BaseEntity {
  id: string;
  modalityCode: string;
  modalityName: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
