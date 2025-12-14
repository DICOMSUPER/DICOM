import { BaseEntity } from "../base.interface";

export interface DicomInstance extends BaseEntity {
  id: string;
  sopInstanceUid: string;
  sopClassUID: string;
  seriesId: string;
  instanceNumber: number;
  filePath: string;
  fileName: string;
  numberOfFrame: number;
  rows: number;
  columns: number;
}
