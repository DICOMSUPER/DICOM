import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AiAnalysesService } from './ai-analyses.service';
import {
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
} from '@backend/shared-domain';

@Controller()
export class AiAnalysesController {
  constructor(private readonly aiAnalysesService: AiAnalysesService) {}

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
    @Payload() body: { base64Image: string, aiModelId?: string }
  ) {
    return await this.aiAnalysesService.diagnosisImageByAI(
      body.base64Image,
      body?.aiModelId || ''
    );
  }

  @MessagePattern('ai_analysis.findAll')
  async findAll(@Payload() filter: FilterAiAnalysisDto) {
    return await this.aiAnalysesService.findAll(filter);
  }

  @MessagePattern('ai_analysis.findOne')
  async findOne(@Payload() payload: { id: string }) {
    return await this.aiAnalysesService.findOne(payload.id);
  }

  @MessagePattern('ai_analysis.update')
  async update(@Payload() payload: { id: string; data: UpdateAiAnalysisDto }) {
    return await this.aiAnalysesService.update(payload.id, payload.data);
  }

  @MessagePattern('ai_analysis.remove')
  async remove(@Payload() payload: { id: string }) {
    return await this.aiAnalysesService.remove(payload.id);
  }
}
