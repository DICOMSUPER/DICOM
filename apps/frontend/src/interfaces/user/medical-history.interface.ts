import { BaseEntity } from "../base.interface";

export interface MedicalHistory extends BaseEntity {
  history_id: string;
  allergies?: string;
}