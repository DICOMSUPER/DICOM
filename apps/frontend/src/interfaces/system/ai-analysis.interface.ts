import { AnalysisStatus } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { QueryParams } from "../pagination/pagination.interface";
import { AiModel } from "./ai-model.interface";

export interface AiAnalysis extends BaseEntity {
  analysisId: string;
  studyId: string;
  analysisStatus?: AnalysisStatus;
  analysisResults?: Record<string, any>;
  findings?: string;
  errorMessage?: string;
  aiModelId: string;
  aiModel?: AiModel;
}
export interface CreateAiAnalysisDto {
  patientId: string;
  studyId: string;
  seriesId: string;
  status: AnalysisStatus;
  analysisResults?: any;
  findings?: string;
  errorMessage?: string;
  startedAt?: string | Date;
  completedAt?: string | Date;
}

export interface FilterAiAnalysisDto extends QueryParams {
  patientId?: string;
  studyId?: string;
  seriesId?: string;
  status?: AnalysisStatus;
  startDate?: string;
  endDate?: string;
}
