import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patients.service';
import {
  PatientRepository,
  DiagnosisReportRepository,
  Patient,
  PatientEncounter,
  PatientCondition,
  CreatePatientDto,
  UpdatePatientDto,
} from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';
import { Gender } from '@backend/shared-enums';

describe('PatientService', () => {
  let service: PatientService;
  let patientRepository: jest.Mocked<PatientRepository>;

  const mockPatient: Partial<Patient> = {
    id: 'patient-1',
    patientCode: 'PAT001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE,
    phoneNumber: '1234567890',
    address: '123 Main St',
    isActive: true,
    isDeleted: false,
    encounters: [],
    conditions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatePatientDto: CreatePatientDto = {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: Gender.MALE,
    phoneNumber: '1234567890',
    address: '123 Main St',
  };

  const mockUpdatePatientDto: UpdatePatientDto = {
    firstName: 'Jane',
    phoneNumber: '9876543210',
  };

  beforeEach(async () => {
    const mockPatientRepository = {
      findById: jest.fn(),
      findByPatientCode: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      filterPatientName: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restorePatient: jest.fn(),
      filter: jest.fn(),
      findWithOrSearch: jest.fn(),
      getPatientStats: jest.fn(),
    };

    const mockDiagnosisReportRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PatientRepository,
          useValue: mockPatientRepository,
        },
        {
          provide: DiagnosisReportRepository,
          useValue: mockDiagnosisReportRepository,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    patientRepository = module.get(PatientRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a patient with generated patient code', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(null);
      patientRepository.create.mockResolvedValue(mockPatient as Patient);

      const result = await service.create(mockCreatePatientDto);

      expect(patientRepository.findByPatientCode).toHaveBeenCalled();
      expect(patientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCreatePatientDto,
          patientCode: expect.any(String),
        })
      );
      expect(result).toEqual(mockPatient);
    });

    it('should throw error if patient code already exists', async () => {
      const existingPatient: Partial<Patient> = { ...mockPatient, isDeleted: false };
      patientRepository.findByPatientCode.mockResolvedValue(existingPatient as Patient);

      await expect(service.create(mockCreatePatientDto)).rejects.toThrow();
    });

    it('should generate unique patient code', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(null);
      patientRepository.create.mockResolvedValue(mockPatient as Patient);

      await service.create(mockCreatePatientDto);

      const createCall = patientRepository.create.mock.calls[0][0] as Partial<Patient>;
      expect(createCall.patientCode).toBeDefined();
      expect(createCall.patientCode?.length).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return all patients', async () => {
      const patients: Patient[] = [mockPatient as Patient];
      patientRepository.findAll.mockResolvedValue(patients);

      const result = await service.findAll();

      expect(patientRepository.findAll).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual(patients);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient as Patient);

      const result = await service.findOne('patient-1');

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-1');
      expect(result).toEqual(mockPatient);
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return paginated patients', async () => {
      const paginationDto: RepositoryPaginationDto = {
        page: 1,
        limit: 10,
      };
      const paginatedResponse: PaginatedResponseDto<Patient> = {
        data: [mockPatient as Patient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findMany(paginationDto);

      expect(patientRepository.paginate).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findPatientByCode', () => {
    it('should return a patient by code', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(mockPatient as Patient);

      const result = await service.findPatientByCode('PAT001');

      expect(patientRepository.findByPatientCode).toHaveBeenCalledWith('PAT001');
      expect(result).toEqual(mockPatient);
    });

    it('should throw error if patient not found by code', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(null);

      await expect(service.findPatientByCode('INVALID')).rejects.toThrow();
    });
  });

  describe('findPatientByName', () => {
    it('should return patients by name', async () => {
      const patients: Patient[] = [mockPatient as Patient];
      patientRepository.filterPatientName.mockResolvedValue(patients);

      const result = await service.findPatientByName('John');

      expect(patientRepository.filterPatientName).toHaveBeenCalledWith('John');
      expect(result).toEqual(patients);
    });

    it('should throw error if no patients found by name', async () => {
      patientRepository.filterPatientName.mockResolvedValue(null as unknown as Patient[]);

      await expect(service.findPatientByName('NonExistent')).rejects.toThrow();
    });
  });

  describe('getOverview', () => {
    it('should return patient overview with recent vital signs and conditions', async () => {
      const patientWithEncounters: Partial<Patient> = {
        ...mockPatient,
        encounters: [
          {
            id: 'encounter-1',
            encounterDate: new Date('2024-01-01'),
            vitalSigns: {
              heartRate: 72,
            },
            isDeleted: false,
          } as unknown as PatientEncounter,
          {
            id: 'encounter-2',
            encounterDate: new Date('2024-01-02'),
            vitalSigns: undefined,
            isDeleted: false,
          } as unknown as PatientEncounter,
        ],
        conditions: [
          { id: 'condition-1', code: 'E11.9' } as unknown as PatientCondition,
          { id: 'condition-2', code: 'I10' } as unknown as PatientCondition,
          { id: 'condition-3', code: 'M79.3' } as unknown as PatientCondition,
          { id: 'condition-4', code: 'K21.9' } as unknown as PatientCondition,
        ],
      };

      patientRepository.findByPatientCode.mockResolvedValue(patientWithEncounters as Patient);

      const result = await service.getOverview('PAT001');

      expect(patientRepository.findByPatientCode).toHaveBeenCalledWith('PAT001');
      expect(result).toEqual({
        recentVitalSigns: {
          heartRate: 72,
        },
        recentConditions: [
          { id: 'condition-1', code: 'E11.9' } as unknown as PatientCondition,
          { id: 'condition-2', code: 'I10' } as unknown as PatientCondition,
          { id: 'condition-3', code: 'M79.3' } as unknown as PatientCondition,
        ],
      });
    });

    it('should return null vital signs if no encounter has vital signs', async () => {
      const patientWithoutVitalSigns: Partial<Patient> = {
        ...mockPatient,
        encounters: [
          {
            id: 'encounter-1',
            encounterDate: new Date('2024-01-01'),
            vitalSigns: undefined,
            isDeleted: false,
          } as unknown as PatientEncounter,
        ],
        conditions: [],
      };

      patientRepository.findByPatientCode.mockResolvedValue(patientWithoutVitalSigns as Patient);

      const result = await service.getOverview('PAT001');

      expect(result?.recentVitalSigns).toBeNull();
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(null);

      await expect(service.getOverview('INVALID')).rejects.toThrow();
    });

    it('should sort encounters by date descending', async () => {
      const patientWithMultipleEncounters: Partial<Patient> = {
        ...mockPatient,
        encounters: [
          {
            id: 'encounter-1',
            encounterDate: new Date('2024-01-01'),
            vitalSigns: { heartRate: 70 },
            isDeleted: false,
          } as unknown as PatientEncounter,
          {
            id: 'encounter-2',
            encounterDate: new Date('2024-01-03'),
            vitalSigns: { heartRate: 75 },
            isDeleted: false,
          } as unknown as PatientEncounter,
          {
            id: 'encounter-3',
            encounterDate: new Date('2024-01-02'),
            vitalSigns: undefined,
            isDeleted: false,
          } as unknown as PatientEncounter,
        ],
        conditions: [],
      };

      patientRepository.findByPatientCode.mockResolvedValue(patientWithMultipleEncounters as Patient);

      const result = await service.getOverview('PAT001');

      expect(result?.recentVitalSigns?.heartRate).toBe(75);
    });

    it('should filter out deleted encounters', async () => {
      const patientWithDeletedEncounters: Partial<Patient> = {
        ...mockPatient,
        encounters: [
          {
            id: 'encounter-1',
            encounterDate: new Date('2024-01-01'),
            vitalSigns: { heartRate: 70 },
            isDeleted: true,
          } as unknown as PatientEncounter,
          {
            id: 'encounter-2',
            encounterDate: new Date('2024-01-02'),
            vitalSigns: { heartRate: 75 },
            isDeleted: false,
          } as unknown as PatientEncounter,
        ],
        conditions: [],
      };

      patientRepository.findByPatientCode.mockResolvedValue(patientWithDeletedEncounters as Patient);

      const result = await service.getOverview('PAT001');

      expect(result?.recentVitalSigns?.heartRate).toBe(75);
    });
  });

  describe('getPatientStats', () => {
    it('should return patient statistics', async () => {
      const stats = {
        totalPatients: 100,
        activePatients: 80,
        inactivePatients: 20,
        deletedPatients: 5,
        newPatientsThisMonth: 10,
      };

      patientRepository.getPatientStats.mockResolvedValue(stats);

      const result = await service.getPatientStats();

      expect(patientRepository.getPatientStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient as Patient);
      const updatedPatient: Partial<Patient> = {
        ...mockPatient,
        firstName: mockUpdatePatientDto.firstName,
        phoneNumber: mockUpdatePatientDto.phoneNumber,
      };
      patientRepository.update.mockResolvedValue(updatedPatient as Patient);

      const result = await service.update('patient-1', mockUpdatePatientDto);

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-1');
      expect(patientRepository.update).toHaveBeenCalledWith('patient-1', mockUpdatePatientDto);
      expect(result).toEqual(updatedPatient);
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', mockUpdatePatientDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should soft delete a patient', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient as Patient);
      patientRepository.softDelete.mockResolvedValue(true);

      const result = await service.remove('patient-1');

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-1');
      expect(patientRepository.softDelete).toHaveBeenCalledWith('patient-1', 'isDeleted');
      expect(result).toBe(true);
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow();
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted patient', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient as Patient);
      patientRepository.restorePatient.mockResolvedValue(true);

      const result = await service.restore('patient-1');

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-1');
      expect(patientRepository.restorePatient).toHaveBeenCalledWith('patient-1');
      expect(result).toBe(true);
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.restore('non-existent')).rejects.toThrow();
    });
  });

  describe('filter', () => {
    it('should filter patients by multiple criteria', async () => {
      const patients: Patient[] = [mockPatient as Patient];
      patientRepository.filter.mockResolvedValue(patients);

      const result = await service.filter(
        ['patient-1'],
        'John',
        'Doe',
        'PAT001'
      );

      expect(patientRepository.filter).toHaveBeenCalledWith(
        ['patient-1'],
        'John',
        'Doe',
        'PAT001'
      );
      expect(result).toEqual(patients);
    });

    it('should filter patients with empty patientIds array', async () => {
      const patients: Patient[] = [mockPatient as Patient];
      patientRepository.filter.mockResolvedValue(patients);

      const result = await service.filter([], 'John', undefined, undefined);

      expect(patientRepository.filter).toHaveBeenCalledWith([], 'John', undefined, undefined);
      expect(result).toEqual(patients);
    });
  });

  describe('findManyWithFilter', () => {
    it('should return paginated patients without search', async () => {
      const paginationDto: RepositoryPaginationDto = {
        page: 1,
        limit: 10,
        relation: ['encounters'],
      };
      const paginatedResponse: PaginatedResponseDto<Patient> = {
        data: [
          {
            ...mockPatient,
            encounters: [
              {
                id: 'encounter-1',
                encounterDate: new Date('2024-01-01'),
              },
              {
                id: 'encounter-2',
                encounterDate: new Date('2024-01-02'),
              },
            ],
          } as Patient,
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findManyWithFilter(paginationDto);

      expect(patientRepository.paginate).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortField: undefined,
        order: undefined,
        relation: ['encounters'],
      });
      expect(result.data[0].encounters[0].id).toBe('encounter-2');
      expect(result.data[0].encounters[1].id).toBe('encounter-1');
    });

    it('should return patients with OR search when search is provided', async () => {
      const paginationDto: RepositoryPaginationDto = {
        page: 1,
        limit: 10,
        search: 'John',
      };
      const paginatedResponse: PaginatedResponseDto<Patient> = {
        data: [mockPatient as Patient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientRepository.findWithOrSearch.mockResolvedValue(paginatedResponse);

      const result = await service.findManyWithFilter(paginationDto);

      expect(patientRepository.findWithOrSearch).toHaveBeenCalledWith(
        paginationDto,
        ['patientCode', 'firstName', 'lastName', 'phoneNumber', 'insuranceNumber'],
        'John'
      );
      expect(result).toEqual(paginatedResponse);
    });

    it('should sort encounters by date descending', async () => {
      const paginationDto: RepositoryPaginationDto = {
        page: 1,
        limit: 10,
      };
      const paginatedResponse: PaginatedResponseDto<Patient> = {
        data: [
          {
            ...mockPatient,
            encounters: [
              {
                id: 'encounter-1',
                encounterDate: new Date('2024-01-01'),
              },
              {
                id: 'encounter-2',
                encounterDate: new Date('2024-01-03'),
              },
              {
                id: 'encounter-3',
                encounterDate: new Date('2024-01-02'),
              },
            ],
          } as Patient,
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findManyWithFilter(paginationDto);

      const sortedEncounters = result.data[0].encounters;
      expect(sortedEncounters[0].id).toBe('encounter-2');
      expect(sortedEncounters[1].id).toBe('encounter-3');
      expect(sortedEncounters[2].id).toBe('encounter-1');
    });

    it('should handle patients with no encounters', async () => {
      const paginationDto: RepositoryPaginationDto = {
        page: 1,
        limit: 10,
      };
      const paginatedResponse: PaginatedResponseDto<Patient> = {
        data: [{ ...mockPatient, encounters: [] } as Patient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      patientRepository.paginate.mockResolvedValue(paginatedResponse);

      const result = await service.findManyWithFilter(paginationDto);

      expect(result.data[0].encounters).toEqual([]);
    });
  });

  describe('generatePatientCode', () => {
    it('should generate a patient code', () => {
      const code = (service as any).generatePatientCode();

      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(0);
    });

    it('should generate unique codes', () => {
      const code1 = (service as any).generatePatientCode();
      const code2 = (service as any).generatePatientCode();

      expect(code1).not.toBe(code2);
    });
  });

  describe('checkPatient', () => {
    it('should return patient if found', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient as Patient);

      const result = await (service as any).checkPatient('patient-1');

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-1');
      expect(result).toEqual(mockPatient);
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect((service as any).checkPatient('non-existent')).rejects.toThrow();
    });
  });

  describe('checkPatientCode', () => {
    it('should return null if patient code not found', async () => {
      patientRepository.findByPatientCode.mockResolvedValue(null);

      const result = await (service as any).checkPatientCode('PAT001');

      expect(result).toBeNull();
    });

    it('should return patient if found and deleted', async () => {
      const patient: Partial<Patient> = { ...mockPatient, isDeleted: true };
      patientRepository.findByPatientCode.mockResolvedValue(patient as Patient);

      const result = await (service as any).checkPatientCode('PAT001');

      expect(result).toEqual(patient);
    });

    it('should throw error if patient code exists and is not deleted', async () => {
      const patient: Partial<Patient> = { ...mockPatient, isDeleted: false };
      patientRepository.findByPatientCode.mockResolvedValue(patient as Patient);

      await expect((service as any).checkPatientCode('PAT001')).rejects.toThrow();
    });
  });
});

