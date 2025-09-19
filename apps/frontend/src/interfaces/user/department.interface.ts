import { BaseEntity } from "../base.interface";

export interface Department extends BaseEntity {
  department_id: string;
  head_department_id?: string;
  department_name: string;
  department_code: string;
  description?: string;
  is_active?: boolean;
}
