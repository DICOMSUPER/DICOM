import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AiAnalysesService } from './ai-analyses.service';
import {
  AiAnalysis,
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { AiResultDiagnosis } from '@backend/shared-interfaces';
import { AnalysisStatus } from '@backend/shared-enums';

@Controller()
export class AiAnalysesController {
  constructor(private readonly aiAnalysesService: AiAnalysesService) { }

  @MessagePattern('ai_analysis.create')
  async create(@Payload() createAiAnalysisDto: CreateAiAnalysisDto) {
    return await this.aiAnalysesService.create(createAiAnalysisDto);
  }

  // @MessagePattern('SystemService.AiAnalysis.DiagnosisImage')
  // async diagnosisImageByAI(@Payload() body: { base64Image: string, folder: string }) {
  //   return await this.aiAnalysesService.diagnosisImageByAI(body.base64Image, body.folder);
  // }

  @MessagePattern('SystemService.AiAnalysis.DiagnosisImage')
  async diagnosisImageByAI(
    @Payload()
    data: {
      body: {
        base64Image: string;
        aiModelId: string;
        modelName: string;
        versionName: string;
        selectedStudyId?: string;
        folder: string;
      };
      userId: string;
    }
  ) {
    return await this.aiAnalysesService.diagnosisImageByAI(
      data.body.base64Image,
      data.body.aiModelId,
      data.body.modelName,
      data.body.versionName,
      data.userId,
      data.body.folder,
      data.body.selectedStudyId
    );
  }

  @MessagePattern('SystemService.AiAnalysis.AnalyzeDiagnosisWithImageAndROI')
  async analyzeDiagnosisWithImageAndROI(
    @Payload()
    data: {
      imageUrl: string;
      modelName: string;
      aiResult: AiResultDiagnosis;
    }
  ) {
    try {
      return await this.aiAnalysesService.analyzeDiagnosisWithImageAndROI(
        data.imageUrl,
        data.modelName,
        data.aiResult
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to analyze diagnosis with image and ROI',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.findAll')
  async findAll(@Payload() filter: FilterAiAnalysisDto) {
    try {
      return await this.aiAnalysesService.findAll(filter);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all AI analyses',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.findOne')
  async findOne(@Payload() payload: { id: string }) {
    try {
      return await this.aiAnalysesService.findOne(payload.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find one AI analysis',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.update')
  async update(@Payload() payload: { id: string; data: UpdateAiAnalysisDto }) {
    return await this.aiAnalysesService.update(payload.id, payload.data);
  }

  @MessagePattern('ai_analysis.submitFeedback')
  async submitFeedback(
    @Payload()
    payload: {
      id: string;
      userId: string;
      isHelpful: boolean;
      feedbackComment?: string;
    }
  ) {
    try {
      return await this.aiAnalysesService.submitFeedback(
        payload.id,
        payload.userId,
        payload.isHelpful,
        payload.feedbackComment
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to submit feedback',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.exportToExcel')
  async exportToExcel(
    @Payload()
    filter: {
      fromDate?: string;
      toDate?: string;
      status?: AnalysisStatus;
      isHelpful?: boolean;
    }
  ) {
    try {
      return await this.aiAnalysesService.exportToExcel(filter);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to export AI analyses to Excel',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.getByStudyId')
  async getAiAnalysisByStudyId(
    @Payload() payload: { studyId: string }
  ): Promise<AiAnalysis[]> {
    try {
      return await this.aiAnalysesService.getByStudyId(payload.studyId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get AI analysis by study ID',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.getStats')
  async getStats() {
    try {
      const stats = await this.aiAnalysesService.getStats();
      return { data: stats };
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get AI analysis stats',
        'SystemService'
      );
    }
  }

  @MessagePattern('ai_analysis.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.aiAnalysesService.remove(payload.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete AI analysis',
        'SystemService'
      );
    }
  }
}
