import { Test, TestingModule } from '@nestjs/testing';
import { ReportTemplatesService } from './report-templates.service';
import { ReportTemplateRepository } from './report-templates.repository';
import { EntityManager } from 'typeorm';
import { getEntityManagerToken } from '@nestjs/typeorm';
import {
  ReportTemplate,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  FilterReportTemplateDto,
} from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';
import { TemplateType } from '@backend/shared-enums';

describe('ReportTemplatesService', () => {
  let service: ReportTemplatesService;
  let reportTemplateRepository: jest.Mocked<ReportTemplateRepository>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockTemplate: Partial<ReportTemplate> = {
    reportTemplatesId: 'template-1',
    templateName: 'Chest X-Ray Template',
    bodyPartId: 'body-part-1',
    modalityId: 'modality-1',
    templateType: TemplateType.STANDARD,
    isPublic: true,
    isDeleted: false,
  };

  const mockCreateTemplateDto: CreateReportTemplateDto = {
    templateName: 'Chest X-Ray Template',
    bodyPartId: 'body-part-1',
    modalityId: 'modality-1',
    templateType: TemplateType.STANDARD,
    descriptionTemplate: 'Template content',
  };

  const mockUpdateTemplateDto: UpdateReportTemplateDto = {
    templateName: 'Updated Template Name',
    descriptionTemplate: 'Updated content',
  };

  const mockFilterDto: FilterReportTemplateDto = {
    bodyPartId: 'body-part-1',
    modalityId: 'modality-1',
    templateType: TemplateType.STANDARD,
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    const mockReportTemplateRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByModaltyIdandBodyPartId: jest.fn(),
    };

    const mockEntityManager = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportTemplatesService,
        {
          provide: ReportTemplateRepository,
          useValue: mockReportTemplateRepository,
        },
        {
          provide: getEntityManagerToken(),
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<ReportTemplatesService>(ReportTemplatesService);
    reportTemplateRepository = module.get(ReportTemplateRepository);
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a report template', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      reportTemplateRepository.findOne.mockResolvedValue(null);
      reportTemplateRepository.create.mockResolvedValue(mockTemplate as ReportTemplate);

      const result = await service.create(mockCreateTemplateDto as any);

      expect(reportTemplateRepository.findOne).toHaveBeenCalledWith(
        { where: { templateName: (mockCreateTemplateDto as any).templateName } },
        [],
        transactionalEm
      );
      expect(reportTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...(mockCreateTemplateDto as any),
          isPublic: true,
        }),
        transactionalEm
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should throw error if template name already exists', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      reportTemplateRepository.findOne.mockResolvedValue(mockTemplate as ReportTemplate);

      await expect(service.create(mockCreateTemplateDto as any)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all templates with filters', async () => {
      const templates: ReportTemplate[] = [mockTemplate as ReportTemplate];
      reportTemplateRepository.findAll.mockResolvedValue(templates);

      const result = await service.findAll(mockFilterDto as any);

      expect(reportTemplateRepository.findAll).toHaveBeenCalledWith({
        where: {
          bodyPartId: 'body-part-1',
          modalityId: 'modality-1',
          templateType: 'standard',
        },
      });
      expect(result).toEqual(templates);
    });

    it('should return all templates without filters', async () => {
      const templates: ReportTemplate[] = [mockTemplate as ReportTemplate];
      reportTemplateRepository.findAll.mockResolvedValue(templates);

      const result = await service.findAll({});

      expect(reportTemplateRepository.findAll).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(templates);
    });
  });

  describe('findOne', () => {
    it('should return a template by id', async () => {
      reportTemplateRepository.findOne.mockResolvedValue(mockTemplate as ReportTemplate);

      const result = await service.findOne('template-1');

      expect(reportTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { reportTemplatesId: 'template-1' },
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should throw error if template not found', async () => {
      reportTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      const updatedTemplate: unknown = {
        ...(mockTemplate as any),
        templateName: (mockUpdateTemplateDto as any).templateName,
        content: (mockUpdateTemplateDto as any).content,
      };
      reportTemplateRepository.findOne
        .mockResolvedValueOnce(mockTemplate as ReportTemplate)
        .mockResolvedValueOnce(null);
      reportTemplateRepository.update.mockResolvedValue(updatedTemplate as ReportTemplate);

      const result = await service.update('template-1', mockUpdateTemplateDto as any);

      expect(reportTemplateRepository.update).toHaveBeenCalledWith('template-1', mockUpdateTemplateDto);
      expect(result).toEqual(updatedTemplate);
    });

    it('should throw error if template not found', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      reportTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateTemplateDto as any)).rejects.toThrow();
    });

    it('should throw error if template name already exists for different template', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      const existingTemplate: unknown = { ...(mockTemplate as any), reportTemplatesId: 'template-2' };
      reportTemplateRepository.findOne
        .mockResolvedValueOnce(mockTemplate as ReportTemplate)
        .mockResolvedValueOnce(existingTemplate as ReportTemplate);

      await expect(service.update('template-1', mockUpdateTemplateDto as any)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should soft delete a template', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      reportTemplateRepository.findOne.mockResolvedValue(mockTemplate as ReportTemplate);
      reportTemplateRepository.softDelete.mockResolvedValue(true);

      const result = await service.remove('template-1');

      expect(reportTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { reportTemplatesId: 'template-1' },
      });
      expect(reportTemplateRepository.softDelete).toHaveBeenCalledWith('template-1', 'isDeleted');
      expect(result).toBe(true);
    });

    it('should throw error if template not found', async () => {
      const transactionalEm = {};
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      reportTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return paginated templates', async () => {
      const paginationDto: RepositoryPaginationDto = { page: 1, limit: 10 };
      const paginatedResponse: unknown = {
        data: [mockTemplate as ReportTemplate],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      reportTemplateRepository.paginate.mockResolvedValue(paginatedResponse as any);

      const result = await service.findMany(paginationDto);

      expect(reportTemplateRepository.paginate).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findByModaltyIdandBodyPartId', () => {
    it('should return templates by modality and body part', async () => {
      const templates: ReportTemplate[] = [mockTemplate as ReportTemplate];
      reportTemplateRepository.findByModaltyIdandBodyPartId.mockResolvedValue(templates);

      const result = await service.findByModaltyIdandBodyPartId('modality-1', 'body-part-1');

      expect(reportTemplateRepository.findByModaltyIdandBodyPartId).toHaveBeenCalledWith(
        'modality-1',
        'body-part-1'
      );
      expect(result).toEqual(templates);
    });
  });
});

