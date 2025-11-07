import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateReportTemplateDto,
  FilterReportTemplateDto,
  ReportTemplate,
  UpdateReportTemplateDto,
} from '@backend/shared-domain';
import { TemplateType } from '@backend/shared-enums';

@Injectable()
export class ReportTemplatesService {
  constructor(
    @InjectRepository(ReportTemplate)
    private readonly reportTemplateRepository: Repository<ReportTemplate>
  ) {}

  async create(data: CreateReportTemplateDto) {
    const template = this.reportTemplateRepository.create(data);

    return await this.reportTemplateRepository.save(template);
  }

  async findAll(filter?: FilterReportTemplateDto) {
    const qb = this.reportTemplateRepository.createQueryBuilder('template');

    if (filter?.ownerUserId) {
      qb.andWhere('template.ownerUserId = :ownerUserId', {
        ownerUserId: filter.ownerUserId,
      });
    }

    if (filter?.templateType) {
      qb.andWhere('template.templateType = :templateType', {
        templateType: filter.templateType,
      });
    }

    if (filter?.isPublic !== undefined) {
      qb.andWhere('template.isPublic = :isPublic', {
        isPublic: filter.isPublic,
      });
    }

    qb.orderBy('template.createdAt', 'DESC');

    if (filter?.page && filter?.limit) {
      const skip = (filter.page - 1) * filter.limit;
      qb.skip(skip).take(filter.limit);
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: filter?.page || 1,
      limit: filter?.limit || total,
    };
  }

  async findOne(id: string) {
    const template = await this.reportTemplateRepository.findOne({
      where: { reportTemplatesId: id },
    });

    if (!template) {
      throw new NotFoundException(`ReportTemplate with ID ${id} not found`);
    }

    return template;
  }

  async findByOwner(ownerUserId: string) {
    return await this.reportTemplateRepository.find({
      where: { ownerUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublic(filter?: {
    requestProcedureId?: string;
    templateType?: 'custom' | 'standard';
  }) {
    const qb = this.reportTemplateRepository
      .createQueryBuilder('template')
      .where('template.isPublic = :isPublic', { isPublic: true });

    if (filter?.requestProcedureId) {
      qb.andWhere('template.requestProcedureId = :requestProcedureId', {
        requestProcedureId: filter.requestProcedureId,
      });
    }

    if (filter?.templateType) {
      qb.andWhere('template.templateType = :templateType', {
        templateType: filter.templateType,
      });
    }

    qb.orderBy('template.createdAt', 'DESC');

    return await qb.getMany();
  }

  async update(id: string, data: UpdateReportTemplateDto) {
    const template = await this.findOne(id);

    if (data.templateName !== undefined) {
      template.templateName = data.templateName;
    }
    if (data.templateType !== undefined) {
      template.templateType = data.templateType as TemplateType;
    }
    if (data.modalityId !== undefined) {
      template.modalityId = data.modalityId;
    }

    if (data.isPublic !== undefined) {
      template.isPublic = data.isPublic;
    }
    if (data.descriptionTemplate !== undefined) {
      template.descriptionTemplate = data.descriptionTemplate;
    }
    if (data.technicalTemplate !== undefined) {
      template.technicalTemplate = data.technicalTemplate;
    }
    if (data.findingsTemplate !== undefined) {
      template.findingsTemplate = data.findingsTemplate;
    }
    if (data.conclusionTemplate !== undefined) {
      template.conclusionTemplate = data.conclusionTemplate;
    }
    if (data.recommendationTemplate !== undefined) {
      template.recommendationTemplate = data.recommendationTemplate;
    }

    return await this.reportTemplateRepository.save(template);
  }

  async delete(id: string) {
    const template = await this.findOne(id);
    await this.reportTemplateRepository.remove(template);
    return {
      success: true,
      message: 'ReportTemplate deleted successfully',
    };
  }

  async duplicate(id: string, newTemplateName: string, ownerUserId: string) {
    const originalTemplate = await this.findOne(id);

    const duplicatedTemplate = this.reportTemplateRepository.create({
      templateName: newTemplateName,
      templateType: originalTemplate.templateType as TemplateType,
      ownerUserId: ownerUserId,
      // mod: originalTemplate.requestProcedureId,
      isPublic: false, // Duplicated templates default to private
      descriptionTemplate: originalTemplate.descriptionTemplate,
      technicalTemplate: originalTemplate.technicalTemplate,
      findingsTemplate: originalTemplate.findingsTemplate,
      conclusionTemplate: originalTemplate.conclusionTemplate,
      recommendationTemplate: originalTemplate.recommendationTemplate,
    });

    return await this.reportTemplateRepository.save(duplicatedTemplate);
  }
}
