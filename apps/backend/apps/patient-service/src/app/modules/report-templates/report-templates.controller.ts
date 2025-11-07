import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportTemplatesService } from './report-templates.service';
import { CreateReportTemplateDto, FilterReportTemplateDto, UpdateReportTemplateDto } from '@backend/shared-domain';

@Controller()
export class ReportTemplatesController {
  constructor(
    private readonly reportTemplatesService: ReportTemplatesService
  ) {}

  @MessagePattern('PatientService.ReportTemplates.Create')
  async create(
    @Payload()
    data: CreateReportTemplateDto
  ) {
    return await this.reportTemplatesService.create(data);
  }

  @MessagePattern('PatientService.ReportTemplates.FindAll')
  async findAll(
    @Payload()
    filter?: FilterReportTemplateDto
  ) {
    return await this.reportTemplatesService.findAll(filter);
  }

  @MessagePattern('PatientService.ReportTemplates.FindOne')
  async findOne(@Payload() id: string) {
    return await this.reportTemplatesService.findOne(id);
  }



  @MessagePattern('PatientService.ReportTemplates.FindPublic')
  async findPublic(
    @Payload()
    filter?: {
      requestProcedureId?: string;
      templateType?: 'custom' | 'standard';
    }
  ) {
    return await this.reportTemplatesService.findPublic(filter);
  }

  @MessagePattern('PatientService.ReportTemplates.Update')
  async update(
    @Payload()
    payload: {
      id: string;
      data: UpdateReportTemplateDto
    }
  ) {
    return await this.reportTemplatesService.update(payload.id, payload.data);
  }

  @MessagePattern('PatientService.ReportTemplates.Delete')
  async delete(@Payload() id: string) {
    return await this.reportTemplatesService.delete(id);
  }

  @MessagePattern('PatientService.ReportTemplates.Duplicate')
  async duplicate(
    @Payload()
    payload: {
      id: string;
      newTemplateName: string;
      ownerUserId: string;
    }
  ) {
    return await this.reportTemplatesService.duplicate(
      payload.id,
      payload.newTemplateName,
      payload.ownerUserId
    );
  }
}
