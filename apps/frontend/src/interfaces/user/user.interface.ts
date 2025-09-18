import { Roles } from "@/enums/user.enum";
import { BaseEntity } from "../base.interface";



export interface User extends BaseEntity {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  employee_id?: string;
  is_verified?: boolean;
  role?: Roles;
  department_id?: string;
  is_active?: boolean;
}

