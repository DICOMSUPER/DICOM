import { BaseEntity } from "./base.interface";

export interface Medication extends BaseEntity {
  medication_id: string;
  quantity?: number;
  name: string;
  description?: string;
  is_active?: boolean;
}