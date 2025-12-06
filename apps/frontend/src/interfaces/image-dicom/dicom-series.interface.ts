import { BaseEntity } from "../base.interface";
import { PaginatedQuery } from "../pagination/pagination.interface";
import { DicomInstance } from "./dicom-instances.interface";
import { ImagingModality } from "./imaging_modality.interface";

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
  modality?: string | ImagingModality;
}

export default interface DicomSeriesReferenceQuery
  extends Partial<PaginatedQuery> {
  id: string;
  type: string;
}
