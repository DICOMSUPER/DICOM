import { AnalysisStatus } from "@/enums/image-dicom.enum";
import { BaseEntity } from "../base.interface";

export interface AiAnalysis extends BaseEntity {
  analysis_id: string;
  study_id: string;
  series_id?: string;
  analysis_status?: AnalysisStatus;
  analysis_results?: Record<string, any>;
  findings?: string;
  error_message?: string;
  started_at?: Date;
  completed_at?: Date;
}