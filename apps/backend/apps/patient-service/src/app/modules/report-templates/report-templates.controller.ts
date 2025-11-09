import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { CreateReportTemplateDto, ReportTemplate, UpdateReportTemplateDto } from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  Controller
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { ReportTemplatesService } from './report-templates.service';


@Controller()
export class ReportTemplatesController {

  constructor(
    private readonly reportTemplatesService: ReportTemplatesService
  ) {}

  @MessagePattern(`PatientService.ReportTemplate.Create`)
  async create(
    @Payload() createReportTemplateDto: CreateReportTemplateDto
  ): Promise<ReportTemplate> {

    try {
      return await this.reportTemplatesService.create(
        createReportTemplateDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create report template',
        "PATIENT_SERVICE"
      );
    }
  }

  @MessagePattern(
    `PatientService.ReportTemplate.FindAll`
  )
  async findAll(): Promise<ReportTemplate[]> {

    try {
      return await this.reportTemplatesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all report templates',
        "PATIENT_SERVICE"
      );
    }
  }

  @MessagePattern(
    `PatientService.ReportTemplate.FindOne`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<ReportTemplate | null> {

    try {
      const { id } = data;
      return await this.reportTemplatesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find report template with id: ${data.id}`,
        "PATIENT_SERVICE"
      );
    }
  }

  @MessagePattern(`PatientService.ReportTemplate.Update`)
  async update(
    @Payload()
    data: {
      id: string;
      updateReportTemplateDto: UpdateReportTemplateDto;
    }
  ): Promise<ReportTemplate | null> {

    try {
      const { id, updateReportTemplateDto } = data;
      return await this.reportTemplatesService.update(
        id,
        updateReportTemplateDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update for report template with this id: ${data.id}`,
        "PATIENT_SERVICE"
      );
    }
  }

  @MessagePattern(`PatientService.ReportTemplate.Delete`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {

    try {
      const { id } = data;
      return await this.reportTemplatesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete for report template with this id: ${data.id}`,
        "PATIENT_SERVICE"
      );
    }
  }



  @MessagePattern(
    `PatientService.ReportTemplate.FindMany`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<ReportTemplate>> {

    try {
      const { paginationDto } = data;
      return await this.reportTemplatesService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'modalityName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find many report templates`,
        "PATIENT_SERVICE"
      );
    }
  }
}
