import { BaseEntity } from "../base.interface";

export interface PatientCondition extends BaseEntity {
  history_id: string;
  allergies?: string;
}