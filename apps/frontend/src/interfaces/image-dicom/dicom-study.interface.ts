import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { Room } from "../user/room.interface";

import { DicomSeries } from "./dicom-series.interface";
import { ImagingOrder } from "./imaging_order.interface";
import {
  DiagnosisReport,
  DiagnosisStatus,
  Patient,
} from "../patient/patient-workflow.interface";
import { ModalityMachine } from "./modality-machine.interface";
import { PaginatedQuery } from "../pagination/pagination.interface";

export interface DicomStudyFilterQuery {
  studyStatus?: DicomStudyStatus;
  reportStatus?: DiagnosisStatus;
  modalityId?: string;
  modalityMachineId?: string;
  mrn?: string;
  patientFirstName?: string;
  patientLastName?: string;
  bodyPart?: string;
  startDate?: string;
  endDate?: string;
  studyUID?: string;
  roomId?: string;
}

export interface CreateDiagnosisPayload {
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description: string;
  diagnosisType: "primary" | "secondary" | "other";
  severity: "mild" | "moderate" | "severe";
  diagnosisDate: string;
  diagnosedBy: string;
  notes?: string;
}

export interface DicomStudy extends BaseEntity {
  id: string;
  studyInstanceUid: string;
  patientId: string;
  patientCode: string;
  orderId?: string;
  modalityMachineId: string;
  studyDate: string;
  studyTime: string;
  studyDescription?: string;
  referringPhysicianId?: string;
  performingTechnicianId?: string;
  verifyingRadiologistId?: string;
  studyStatus?: DicomStudyStatus;
  numberOfSeries?: number;
  storagePath?: string;

  // Nested objects included for filter API
  patient?: Patient; // Included for filter API
  imagingOrder?: ImagingOrder; // Included for filter API
  modalityMachine?: ModalityMachine;
  series?: DicomSeries[]; // Included for filter API
  report?: DiagnosisReport; // Included for filter API
  room?: Room; // Included for filter API
}

export default interface DicomStudyReferenceQuery
  extends Partial<PaginatedQuery> {
  id: string;
  type: string;
}
