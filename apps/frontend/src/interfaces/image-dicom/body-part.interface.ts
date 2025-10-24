import { BaseEntity } from "../patient/patient-workflow.interface";

export interface BodyPart extends BaseEntity {
  name: string;
  description?: string | null;
  isActive: boolean;
}