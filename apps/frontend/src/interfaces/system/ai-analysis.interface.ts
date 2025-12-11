import { AnalysisStatus } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";
import { QueryParams } from "../pagination/pagination.interface";
import { AiModel } from "./ai-model.interface";
import { AiResultDiagnosis } from "./ai-result.interface";

export interface AiAnalysis extends BaseEntity {
  analysisId: string;
  studyId: string;
  analysisStatus?: AnalysisStatus;
  analysisResults?: AiResultDiagnosis;
  // findings?: string;
  errorMessage?: string;
  aiModelId: string;
  modelName?: string;
  versionName?: string;
  originalImage?: string;
  originalImageName?: string;
  // aiModel?: AiModel;
  
  // Feedback fields
  isHelpful?: boolean;
  feedbackComment?: string;
  feedbackUserId?: string;
  feedbackAt?: Date;
}

export interface CreateAiAnalysisDto {
  patientId: string;
  studyId: string;
  status: AnalysisStatus;
  analysisResults?: any;
  findings?: string;
  errorMessage?: string;
}

export interface FilterAiAnalysisDto extends QueryParams {
  patientId?: string;
  studyId?: string;
  seriesId?: string;
  status?: AnalysisStatus;
  startDate?: string;
  endDate?: string;
  isHelpful?: boolean;
}

export interface SubmitFeedbackDto {
  isHelpful: boolean;
  feedbackComment?: string;
}
