import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateReportTemplateDto,
  FilterReportTemplateDto,
  ReportTemplate,
  UpdateReportTemplateDto,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ReportTemplateRepository } from './report-templates.repository';

@Injectable()
export class ReportTemplatesService {
  constructor(
    @Inject()
    private readonly reportTemplateRepository: ReportTemplateRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
<<<<<<< HEAD
  ) { }
  create = async (createReportTemplateDto: CreateReportTemplateDto): Promise<ReportTemplate> => {
=======
  ) {}
  create = async (
    createReportTemplateDto: CreateReportTemplateDto,
    userInfo: { userId: string; role: string }
  ): Promise<ReportTemplate> => {
    console.log('service user info', userInfo);

>>>>>>> main
    return await this.entityManager.transaction(async (em) => {
      const existingReportTemplate =
        await this.reportTemplateRepository.findOne(
          {
            where: { templateName: createReportTemplateDto.templateName },
          },
          [],
          em
        );

      if (existingReportTemplate) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Report template with the same name already exists',
          'PATIENT_SERVICE'
        );
      }

      return await this.reportTemplateRepository.create(
        {
          ...createReportTemplateDto,
          ownerUserId: userInfo.userId,
          isPublic: true,
        },
        em
      );
    });
  };

  findAll = async (
    filterReportTemplateDto: FilterReportTemplateDto
  ): Promise<ReportTemplate[]> => {
    return await this.reportTemplateRepository.findAll({
      where: {
        ...(filterReportTemplateDto.bodyPartId && {
          bodyPartId: filterReportTemplateDto.bodyPartId,
        }),
        ...(filterReportTemplateDto.modalityId && {
          modalityId: filterReportTemplateDto.modalityId,
        }),
        ...(filterReportTemplateDto.templateType && {
          templateType: filterReportTemplateDto.templateType,
        }),
      },
    });
  };

  findOne = async (id: string): Promise<ReportTemplate | null> => {
    const reportTemplate = await this.reportTemplateRepository.findOne({
      where: { reportTemplatesId: id },
    });

    if (!reportTemplate) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Report template not found',
        'PATIENT_SERVICE'
      );
    }

    return reportTemplate;
  };

  update = async (
    id: string,
    updateReportTemplateDto: UpdateReportTemplateDto
  ): Promise<ReportTemplate | null> => {
    return await this.entityManager.transaction(async (em) => {
      const reportTemplate = await this.reportTemplateRepository.findOne({
        where: { reportTemplatesId: id },
      });

      if (!reportTemplate) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Report template not found',
          'PATIENT_SERVICE'
        );
      }
      const existingReportTemplate =
        await this.reportTemplateRepository.findOne({
          where: { templateName: updateReportTemplateDto.templateName },
        });

      if (
        existingReportTemplate &&
        existingReportTemplate.reportTemplatesId !== id
      ) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Report template with the same name already exists',
          'PATIENT_SERVICE'
        );
      }

      return await this.reportTemplateRepository.update(
        id,
        updateReportTemplateDto
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const reportTemplate = await this.reportTemplateRepository.findOne({
        where: { reportTemplatesId: id },
      });

      if (!reportTemplate) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Report template not found',
          'PATIENT_SERVICE'
        );
      }

      return await this.reportTemplateRepository.softDelete(id, 'isDeleted');
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ReportTemplate>> => {
    return await this.reportTemplateRepository.paginate(paginationDto);
  };

  findByModaltyIdandBodyPartId = async (
    modalityId: string,
    bodyPartId: string
  ): Promise<ReportTemplate[]> => {
    return await this.reportTemplateRepository.findByModaltyIdandBodyPartId(
      modalityId,
      bodyPartId
    );
  };


}
