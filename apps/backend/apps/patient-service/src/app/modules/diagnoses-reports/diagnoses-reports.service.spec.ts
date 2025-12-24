import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosesReportService } from './diagnoses-reports.service';
import {
  DiagnosisReportRepository,
  PatientEncounterRepository,
  DiagnosesReport,
  PatientEncounter,
  CreateDiagnosesReportDto,
  UpdateDiagnosesReportDto,
} from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';
import { DiagnosisStatus, DiagnosisType, Severity } from '@backend/shared-enums';

describe('DiagnosesReportService', () => {
  let service: DiagnosesReportService;
  let diagnosisReportRepository: jest.Mocked<DiagnosisReportRepository>;
  let encounterRepository: jest.Mocked<PatientEncounterRepository>;
  let reportRepository: jest.Mocked<Repository<DiagnosesReport>>;
  let redisService: jest.Mocked<RedisService>;

  const mockEncounter: Partial<PatientEncounter> = {
    id: 'encounter-1',
    patient: {
      id: 'patient-1',
      firstName: 'John',
      lastName: 'Doe',
    } as any,
  };

  const mockReport: Partial<DiagnosesReport> = {
    id: 'report-1',
    encounterId: 'encounter-1',
    diagnosisName: 'Type 2 Diabetes',
    diagnosisDate: new Date('2024-01-01'),
    diagnosisStatus: DiagnosisStatus.PENDING_APPROVAL,
    diagnosisType: DiagnosisType.PRIMARY,
    isDeleted: false,
    encounter: mockEncounter as PatientEncounter,
  };

  const mockCreateReportDto: CreateDiagnosesReportDto = {
    encounterId: 'encounter-1',
    studyId: 'study-1',
    diagnosisName: 'Type 2 Diabetes',
    diagnosisDate: '2024-01-01',
    diagnosisStatus: DiagnosisStatus.PENDING_APPROVAL,
    diagnosisType: DiagnosisType.PRIMARY,
    severity: Severity.MILD,
  };

  const mockUpdateReportDto: UpdateDiagnosesReportDto = {
    diagnosisStatus: DiagnosisStatus.PENDING_APPROVAL,
    notes: 'Confirmed diagnosis',
  };

  beforeEach(async () => {
    const mockDiagnosisReportRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      filter: jest.fn(),
    };

    const mockEncounterRepository = {
      findById: jest.fn(),
    };

    const mockReportRepository = {
      createQueryBuilder: jest.fn(),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosesReportService,
        {
          provide: DiagnosisReportRepository,
          useValue: mockDiagnosisReportRepository,
        },
        {
          provide: PatientEncounterRepository,
          useValue: mockEncounterRepository,
        },
        {
          provide: getRepositoryToken(DiagnosesReport),
          useValue: mockReportRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<DiagnosesReportService>(DiagnosesReportService);
    diagnosisReportRepository = module.get(DiagnosisReportRepository);
    encounterRepository = module.get(PatientEncounterRepository);
    reportRepository = module.get(getRepositoryToken(DiagnosesReport));
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a diagnosis report', async () => {
      encounterRepository.findById.mockResolvedValue(mockEncounter as PatientEncounter);
      diagnosisReportRepository.create.mockResolvedValue(mockReport as DiagnosesReport);

      const result = await service.create(mockCreateReportDto as any);

      expect(encounterRepository.findById).toHaveBeenCalledWith('encounter-1', ['patient']);
      expect(diagnosisReportRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });

    it('should generate diagnosis name from patient name and date if not provided', async () => {
      const dtoWithoutName = { ...(mockCreateReportDto as any), diagnosisName: undefined };
      encounterRepository.findById.mockResolvedValue(mockEncounter as PatientEncounter);
      diagnosisReportRepository.create.mockResolvedValue(mockReport as DiagnosesReport);

      await service.create(dtoWithoutName);

      expect(diagnosisReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosisName: expect.stringContaining('Doe John'),
        })
      );
    });

    it('should use current date if diagnosisDate not provided', async () => {
      const dtoWithoutDate = { ...(mockCreateReportDto as any), diagnosisDate: undefined };
      encounterRepository.findById.mockResolvedValue(mockEncounter as PatientEncounter);
      diagnosisReportRepository.create.mockResolvedValue(mockReport as DiagnosesReport);

      await service.create(dtoWithoutDate);

      expect(diagnosisReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosisDate: expect.any(Date),
        })
      );
    });

    it('should throw error if encounter not found', async () => {
      encounterRepository.findById.mockResolvedValue(null);

      await expect(service.create(mockCreateReportDto as any)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all diagnosis reports', async () => {
      const reports: DiagnosesReport[] = [mockReport as DiagnosesReport];
      diagnosisReportRepository.findAll.mockResolvedValue(reports);

      const result = await service.findAll();

      expect(diagnosisReportRepository.findAll).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual(reports);
    });
  });

  describe('findOne', () => {
    it('should return a diagnosis report by id', async () => {
      diagnosisReportRepository.findById.mockResolvedValue(mockReport as DiagnosesReport);

      const result = await service.findOne('report-1');

      expect(diagnosisReportRepository.findById).toHaveBeenCalledWith('report-1', ['encounter', 'encounter.patient']);
      expect(result).toEqual(mockReport);
    });

    it('should throw error if report not found', async () => {
      diagnosisReportRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return paginated diagnosis reports', async () => {
      const paginationDto: RepositoryPaginationDto = { page: 1, limit: 10 };
      const paginatedResponse: unknown = {
        data: [mockReport as DiagnosesReport],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      diagnosisReportRepository.paginate.mockResolvedValue(paginatedResponse as any);

      const result = await service.findMany(paginationDto);

      expect(diagnosisReportRepository.paginate).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('update', () => {
    it('should update a diagnosis report', async () => {
      const updatedReport: unknown = {
        ...(mockReport as any),
        diagnosisStatus: (mockUpdateReportDto as any).diagnosisStatus,
        notes: (mockUpdateReportDto as any).notes,
      };
      diagnosisReportRepository.findById.mockResolvedValue(mockReport as DiagnosesReport);
      diagnosisReportRepository.update.mockResolvedValue(updatedReport as DiagnosesReport);

      const result = await service.update('report-1', mockUpdateReportDto as any);

      expect(diagnosisReportRepository.findById).toHaveBeenCalledWith('report-1');
      expect(diagnosisReportRepository.update).toHaveBeenCalledWith('report-1', mockUpdateReportDto);
      expect(result).toEqual(updatedReport);
    });

    it('should throw error if report not found', async () => {
      diagnosisReportRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateReportDto as any)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should soft delete a diagnosis report', async () => {
      diagnosisReportRepository.findById.mockResolvedValue(mockReport as DiagnosesReport);
      diagnosisReportRepository.softDelete.mockResolvedValue(true);

      const result = await service.remove('report-1');

      expect(diagnosisReportRepository.findById).toHaveBeenCalledWith('report-1');
      expect(diagnosisReportRepository.softDelete).toHaveBeenCalledWith('report-1', 'isDeleted');
      expect(result).toBe(true);
    });

    it('should throw error if report not found', async () => {
      diagnosisReportRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow();
    });
  });

  describe('filter', () => {
    it('should filter reports by studyIds and status', async () => {
      const reports: DiagnosesReport[] = [mockReport as DiagnosesReport];
      diagnosisReportRepository.filter.mockResolvedValue(reports);

      const result = await service.filter(['study-1'], DiagnosisStatus.PENDING_APPROVAL);

      expect(diagnosisReportRepository.filter).toHaveBeenCalledWith(['study-1'], DiagnosisStatus.PENDING_APPROVAL);
      expect(result).toEqual(reports);
    });

    it('should filter reports by studyIds only', async () => {
      const reports: DiagnosesReport[] = [mockReport as DiagnosesReport];
      diagnosisReportRepository.filter.mockResolvedValue(reports);

      const result = await service.filter(['study-1']);

      expect(diagnosisReportRepository.filter).toHaveBeenCalledWith(['study-1'], undefined);
      expect(result).toEqual(reports);
    });
  });

  describe('findByStudyId', () => {
    it('should return reports for a study', async () => {
      const reports: DiagnosesReport[] = [mockReport as DiagnosesReport];
      diagnosisReportRepository.findAll.mockResolvedValue(reports);

      const result = await service.findByStudyId('study-1');

      expect(diagnosisReportRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studyId: 'study-1', isDeleted: false },
          order: { createdAt: 'DESC' },
        }),
        ['encounter', 'encounter.patient']
      );
      expect(result).toEqual(reports);
    });

    it('should return empty array if no reports found', async () => {
      diagnosisReportRepository.findAll.mockResolvedValue([]);

      const result = await service.findByStudyId('study-1');

      expect(result).toEqual([]);
    });

    it('should throw error if studyId is not provided', async () => {
      await expect(service.findByStudyId('')).rejects.toThrow();
    });
  });

  describe('findAllWithFilter', () => {
    it('should return cached results if available', async () => {
      const filter = { page: 1, limit: 10 };
      const userInfo = { userId: 'user-1', role: 'physician' };
      const cachedResponse: unknown = {
        data: [mockReport as DiagnosesReport],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      redisService.get.mockResolvedValue(cachedResponse);

      const result = await service.findAllWithFilter(filter, userInfo);

      expect(redisService.get).toHaveBeenCalled();
      expect(result).toEqual(cachedResponse);
    });

    it('should query database and cache results if not cached', async () => {
      const filter = { page: 1, limit: 10 };
      const userInfo = { userId: 'user-1', role: 'physician' };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReport], 1]),
      };

      redisService.get.mockResolvedValue(null);
      reportRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAllWithFilter(filter, userInfo);

      expect(reportRepository.createQueryBuilder).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
      expect(result.data).toEqual([mockReport]);
    });

    it('should filter by patient name', async () => {
      const filter = { page: 1, limit: 10, patientName: 'John' };
      const userInfo = { userId: 'user-1', role: 'physician' };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReport], 1]),
      };

      redisService.get.mockResolvedValue(null);
      reportRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAllWithFilter(filter, userInfo);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('patientName'),
        expect.any(Object)
      );
    });

    it('should filter by physician role', async () => {
      const filter = { page: 1, limit: 10 };
      const userInfo = { userId: 'user-1', role: 'physician' };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReport], 1]),
      };

      redisService.get.mockResolvedValue(null);
      reportRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAllWithFilter(filter, userInfo);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'encounter.assignedPhysicianId = :userId',
        { userId: 'user-1' }
      );
    });
  });
});

