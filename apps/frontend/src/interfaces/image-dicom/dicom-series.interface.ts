import { BaseEntity } from "../base.interface";

export interface DicomSeries extends BaseEntity {
  series_id: string;
  series_instance_uid: string;
  study_id: string;
  series_number: number;
  series_description?: string;
  body_part_examined?: string;
  series_date?: Date;
  series_time?: string;
  protocol_name?: string;
  number_of_instances?: number;
}

