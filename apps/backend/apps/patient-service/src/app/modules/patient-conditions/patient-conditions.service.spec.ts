import { Test, TestingModule } from '@nestjs/testing';
import { PatientConditionService } from './patient-conditions.service';
import {
  PatientConditionRepository,
  PatientCondition,
  CreatePatientConditionDto,
  UpdatePatientConditionDto,
} from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';
import { ClinicalStatus } from '@backend/shared-enums';

describe('PatientConditionService', () => {
  let service: PatientConditionService;
  let patientConditionRepository: jest.Mocked<PatientConditionRepository>;

  const mockCondition: Partial<PatientCondition> = {
    id: 'condition-1',
    patientId: 'patient-1',
    code: 'E11.9',
    codeDisplay: 'Type 2 diabetes mellitus without complications',
    codeSystem: 'ICD-10',
    clinicalStatus: ClinicalStatus.ACTIVE,
    isDeleted: false,
  };

  const mockCreateConditionDto: CreatePatientConditionDto = {
    patientId: 'patient-1',
    code: 'E11.9',
    codeDisplay: 'Type 2 diabetes mellitus without complications',
    codeSystem: 'ICD-10',
    clinicalStatus: ClinicalStatus.ACTIVE,
  };

  const mockUpdateConditionDto: UpdatePatientConditionDto = {
    clinicalStatus: ClinicalStatus.RESOLVED,
    notes: 'Condition resolved after treatment',
  };

  beforeEach(async () => {
    const mockPatientConditionRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientConditionService,
        {
          provide: PatientConditionRepository,
          useValue: mockPatientConditionRepository,
        },
      ],
    }).compile();

    service = module.get<PatientConditionService>(PatientConditionService);
    patientConditionRepository = module.get(PatientConditionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a patient condition', async () => {
      patientConditionRepository.create.mockResolvedValue(mockCondition as PatientCondition);

      const result = await service.create(mockCreateConditionDto);

      expect(patientConditionRepository.create).toHaveBeenCalledWith(mockCreateConditionDto);
      expect(result).toEqual(mockCondition);
    });
  });

  describe('findAll', () => {
    it('should return all patient conditions', async () => {
      const conditions: PatientCondition[] = [mockCondition as PatientCondition];
      patientConditionRepository.findAll.mockResolvedValue(conditions);

      const result = await service.findAll();

      expect(patientConditionRepository.findAll).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual(conditions);
    });
  });

  describe('findOne', () => {
    it('should return a patient condition by id', async () => {
      patientConditionRepository.findById.mockResolvedValue(mockCondition as PatientCondition);

      const result = await service.findOne('condition-1');

      expect(patientConditionRepository.findById).toHaveBeenCalledWith('condition-1');
      expect(result).toEqual(mockCondition);
    });

    it('should throw error if condition not found', async () => {
      patientConditionRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return paginated patient conditions', async () => {
      const paginationDto: RepositoryPaginationDto = { page: 1, limit: 10 };
      const paginatedResponse: PaginatedResponseDto<PatientCondition> = {
        data: [mockCondition as PatientCondition],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientConditionRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findMany(paginationDto);

      expect(patientConditionRepository.paginate).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('update', () => {
    it('should update a patient condition', async () => {
      const updatedCondition: Partial<PatientCondition> = {
        ...mockCondition,
        clinicalStatus: mockUpdateConditionDto.clinicalStatus,
        notes: mockUpdateConditionDto.notes,
      };
      patientConditionRepository.findById.mockResolvedValue(mockCondition as PatientCondition);
      patientConditionRepository.update.mockResolvedValue(updatedCondition as PatientCondition);

      const result = await service.update('condition-1', mockUpdateConditionDto);

      expect(patientConditionRepository.findById).toHaveBeenCalledWith('condition-1');
      expect(patientConditionRepository.update).toHaveBeenCalledWith('condition-1', mockUpdateConditionDto);
      expect(result).toEqual(updatedCondition);
    });

    it('should throw error if condition not found', async () => {
      patientConditionRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdateConditionDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should soft delete a patient condition', async () => {
      patientConditionRepository.findById.mockResolvedValue(mockCondition as PatientCondition);
      patientConditionRepository.softDelete.mockResolvedValue(true);

      const result = await service.remove('condition-1');

      expect(patientConditionRepository.findById).toHaveBeenCalledWith('condition-1');
      expect(patientConditionRepository.softDelete).toHaveBeenCalledWith('condition-1', 'isDeleted');
      expect(result).toBe(true);
    });

    it('should throw error if condition not found', async () => {
      patientConditionRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow();
    });
  });

  describe('findByPatientId', () => {
    it('should return paginated conditions for a patient', async () => {
      const paginationDto: RepositoryPaginationDto = { page: 1, limit: 10 };
      const paginatedResponse: PaginatedResponseDto<PatientCondition> = {
        data: [mockCondition as PatientCondition],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientConditionRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findByPatientId('patient-1', paginationDto);

      expect(patientConditionRepository.paginate).toHaveBeenCalledWith(
        paginationDto,
        {
          where: { patientId: 'patient-1', isDeleted: false },
          order: { createdAt: 'DESC' },
        }
      );
      expect(result).toEqual(paginatedResponse);
    });
  });
});

