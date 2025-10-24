import { BaseEntity } from "../base.interface";
import { DicomInstance } from "./dicom-instances.interface";

export interface DicomSeries extends BaseEntity {
  id: string;
  seriesInstanceUid: string;
  studyId: string;
  seriesNumber: number;
  seriesDescription: string;
  bodyPartExamined: string;
  seriesDate: string;
  seriesTime: string;
  protocolName: string;
  numberOfInstances: number;
  instances: DicomInstance[];
}
