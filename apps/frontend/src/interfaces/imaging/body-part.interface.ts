import { BaseEntity } from "../base.interface";

export interface BodyPart extends BaseEntity {
  id: string;
  name: string;
  description?: string;
}
