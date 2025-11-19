import { BaseEntity } from "../base.interface";
import { AiAnalysis } from "./ai-analysis.interface";

export interface AiModel extends BaseEntity {
  modelId: string;
  name: string;
  provider?: string;
  externalModelId?: string;
  bodyPartName?: string;
  version?: string;
  url?: string;
  description?: string;
  isActive?: boolean;
  analyses?: AiAnalysis[];

}
