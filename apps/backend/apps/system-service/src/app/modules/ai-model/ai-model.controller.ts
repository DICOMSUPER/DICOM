import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
  import {AiModelService } from './ai-model.service';
import { CreateAiModelDto, FilterAiModelDto, UpdateAiModelDto } from '@backend/shared-domain';


@Controller()
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @MessagePattern('ai_model.create')
  async create(@Payload() createAiModelDto: CreateAiModelDto) {
    return await this.aiModelService.create(createAiModelDto);
  }

  // @MessagePattern('SystemService.AiModel.DiagnosisImage')
  // async diagnosisImageByAI(@Payload() body: { base64Image: string, folder: string }) {
  //   return await this.aiModelService.diagnosisImageByAI(body.base64Image, body.folder);
  // }

  // @MessagePattern('SystemService.AiModel.DiagnosisImage')
  // async diagnosisImageByAI(
  //   @Payload() body: { base64Image: string}
  // ) {
  //   return await this.aiModelService.diagnosisImageByAI(
  //     body.base64Image,
     
  //   );
  // }

  @MessagePattern('ai_model.findAll')
  async findAll(@Payload() filter: FilterAiModelDto) {
    return await this.aiModelService.findAll(filter);
  }

  @MessagePattern('ai_model.findOne')
  async findOne(@Payload() payload: { id: string }) {
    return await this.aiModelService.findOne(payload.id);
  }

  @MessagePattern('ai_model.update')
  async update(@Payload() payload: { id: string; data: UpdateAiModelDto }) {
    return await this.aiModelService.update(payload.id, payload.data);
  }

  @MessagePattern('ai_model.remove')
  async remove(@Payload() payload: { id: string }) {
    return await this.aiModelService.remove(payload.id);
  }
}
