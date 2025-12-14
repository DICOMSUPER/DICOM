import { Roles } from "@/common/enums/user.enum";
import { BaseEntity } from "../patient/patient-workflow.interface";
import { Department } from "./department.interface";

export interface User extends BaseEntity {
  username: string;
  email: string;
  password_hash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  isVerified?: boolean;
  role?: Roles;
  departmentId?: string;
  isActive?: boolean;

  department?: Department;
}
