import { Gender } from "@/enums/user.enum";
import { BaseEntity } from "../base.interface";



export interface Patient extends BaseEntity {
  patient_id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  blood_type?: string;
  medical_history_id?: string;
  insurance_number?: string;
  is_active?: boolean;
  created_by?: string;
}

