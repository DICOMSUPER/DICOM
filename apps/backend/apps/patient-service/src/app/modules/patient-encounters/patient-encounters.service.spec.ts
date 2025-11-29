import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PatientEncounterService } from './patient-encounters.service';
import {
  PatientEncounterRepository,
  PatientEncounter,
  ServiceRoom,
  CreatePatientEncounterDto,
} from '@backend/shared-domain';
import { PaginationService } from '@backend/database';
import { ClientProxy } from '@nestjs/microservices';
import { EntityManager } from 'typeorm';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { firstValueFrom, of } from 'rxjs';
import { EncounterStatus, EncounterPriorityLevel, EncounterType, Roles } from '@backend/shared-enums';

jest.mock('rxjs/internal/firstValueFrom');

describe('PatientEncounterService', () => {
  let service: PatientEncounterService;
  let encounterRepository: jest.Mocked<PatientEncounterRepository>;
  let paginationService: jest.Mocked<PaginationService>;
  let userService: jest.Mocked<ClientProxy>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockEncounter: Partial<PatientEncounter> = {
    id: 'encounter-1',
    patientId: 'patient-1',
    serviceRoomId: 'service-room-1',
    encounterDate: new Date('2024-01-01'),
    status: EncounterStatus.WAITING,
    priority: EncounterPriorityLevel.ROUTINE,
    orderNumber: 1,
    isDeleted: false,
    patient: {
      id: 'patient-1',
      firstName: 'John',
      lastName: 'Doe',
    } as any,
  };

  const mockServiceRoom: Partial<ServiceRoom> = {
    id: 'service-room-1',
    roomId: 'room-1',
  };

  const mockCreateEncounterDto: CreatePatientEncounterDto = {
    patientId: 'patient-1',
    encounterDate: '2024-01-01',
    encounterType: EncounterType.INPATIENT,
    priority: EncounterPriorityLevel.ROUTINE,
    serviceRoomId: 'service-room-1',
  };

  beforeEach(async () => {
    const mockEncounterRepository = {
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getLatestEncounterInDate: jest.fn(),
      getEncounterStats: jest.fn(),
      getStatsInDateRange: jest.fn(),
      getEncounterStatsByServiceRoomIdsInDate: jest.fn(),
      filterEncounter: jest.fn(),
      batchUpdate: jest.fn(),
    };

    const mockPaginationService = {
      paginate: jest.fn(),
    };

    const mockUserService = {
      send: jest.fn(),
    };

    const mockEntityManager = {
      transaction: jest.fn(),
    };

    (firstValueFrom as jest.Mock).mockImplementation(async (obs) => {
      const value = await obs.toPromise();
      return value;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientEncounterService,
        {
          provide: PatientEncounterRepository,
          useValue: mockEncounterRepository,
        },
        {
          provide: PaginationService,
          useValue: mockPaginationService,
        },
        {
          provide: process.env.USER_SERVICE_NAME || 'USER_SERVICE',
          useValue: mockUserService,
        },
        {
          provide: getEntityManagerToken(),
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<PatientEncounterService>(PatientEncounterService);
    encounterRepository = module.get(PatientEncounterRepository);
    paginationService = module.get(PaginationService);
    userService = module.get(process.env.USER_SERVICE_NAME || 'USER_SERVICE');
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderNumberInDate', () => {
    it('should return order number 1 if no encounters exist', async () => {
      userService.send.mockReturnValueOnce(of(mockServiceRoom as ServiceRoom));
      userService.send.mockReturnValueOnce(of([mockServiceRoom as ServiceRoom]));
      encounterRepository.getLatestEncounterInDate.mockResolvedValue(null);

      const result = await service.getOrderNumberInDate('service-room-1');

      expect(result).toBe(1);
      expect(encounterRepository.getLatestEncounterInDate).toHaveBeenCalled();
    });

    it('should return incremented order number if encounter exists', async () => {
      const latestEncounter: unknown = { ...(mockEncounter as any), orderNumber: 5 };
      userService.send.mockReturnValueOnce(of(mockServiceRoom as ServiceRoom));
      userService.send.mockReturnValueOnce(of([mockServiceRoom as ServiceRoom]));
      encounterRepository.getLatestEncounterInDate.mockResolvedValue(latestEncounter as PatientEncounter);

      const result = await service.getOrderNumberInDate('service-room-1');

      expect(result).toBe(6);
    });
  });

  describe('create', () => {
    it('should create an encounter with order number and WAITING status', async () => {
      userService.send.mockReturnValue(of(mockServiceRoom as ServiceRoom));
      userService.send.mockReturnValueOnce(of(mockServiceRoom as ServiceRoom));
      userService.send.mockReturnValueOnce(of([mockServiceRoom as ServiceRoom]));
      encounterRepository.getLatestEncounterInDate.mockResolvedValue(null);
      encounterRepository.create.mockResolvedValue(mockEncounter as PatientEncounter);

      const result = await service.create(mockCreateEncounterDto as any);

      expect(encounterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...(mockCreateEncounterDto as any),
          orderNumber: 1,
          status: EncounterStatus.WAITING,
        })
      );
      expect(result).toEqual(mockEncounter);
    });
  });

  describe('findAll', () => {
    it('should return all encounters', async () => {
      const encounters: PatientEncounter[] = [mockEncounter as PatientEncounter];
      encounterRepository.findAll.mockResolvedValue(encounters);

      const result = await service.findAll();

      expect(encounterRepository.findAll).toHaveBeenCalledWith(
        { where: { isDeleted: false } },
        ['patient']
      );
      expect(result).toEqual(encounters);
    });
  });

  describe('findOne', () => {
    it('should return an encounter by id', async () => {
      encounterRepository.findOne.mockResolvedValue(mockEncounter as PatientEncounter);

      const result = await service.findOne('encounter-1');

      expect(encounterRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'encounter-1' },
        relations: ['patient'],
      });
      expect(result).toEqual(mockEncounter);
    });

    it('should throw error if encounter not found', async () => {
      encounterRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return paginated encounters with patient relation', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse: unknown = {
        data: [mockEncounter as PatientEncounter],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      encounterRepository.paginate.mockResolvedValue(paginatedResponse as any);

      const result = await service.findMany(paginationDto);

      expect(encounterRepository.paginate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...paginationDto,
          relation: expect.arrayContaining(['patient']),
        })
      );
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('update', () => {
    it('should update an encounter', async () => {
      const updateDto: unknown = { status: EncounterStatus.ARRIVED };
      const updatedEncounter: unknown = { ...(mockEncounter as any), ...(updateDto as any) };

      encounterRepository.findOne.mockResolvedValue(mockEncounter as PatientEncounter);
      encounterRepository.update.mockResolvedValue(updatedEncounter as PatientEncounter);

      const result = await service.update('encounter-1', updateDto as any);

      expect(encounterRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'encounter-1' },
        relations: ['patient'],
      });
      expect(encounterRepository.update).toHaveBeenCalledWith('encounter-1', updateDto);
      expect(result).toEqual(updatedEncounter);
    });
  });

  describe('remove', () => {
    it('should soft delete an encounter', async () => {
      encounterRepository.findOne.mockResolvedValue(mockEncounter as PatientEncounter);
      encounterRepository.softDelete.mockResolvedValue(true);

      const result = await service.remove('encounter-1');

      expect(encounterRepository.softDelete).toHaveBeenCalledWith('encounter-1', 'isDeleted');
      expect(result).toBe(true);
    });
  });

  describe('getEncounterStats', () => {
    it('should return encounter statistics', async () => {
      const stats = {
        totalEncounters: 100,
        todayEncounter: 10,
        encountersThisMonth: 50,
        encountersByType: {},
        averageEncountersPerPatient: 0,
        todayStatEncounter: 0,
      };

      encounterRepository.getEncounterStats.mockResolvedValue(stats);

      const result = await service.getEncounterStats();

      expect(encounterRepository.getEncounterStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('findByPatientId', () => {
    it('should return paginated encounters for a patient', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse: unknown = {
        data: [mockEncounter as PatientEncounter],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      paginationService.paginate.mockResolvedValue(paginatedResponse as any);

      const result = await service.findByPatientId('patient-1', paginationDto);

      expect(paginationService.paginate).toHaveBeenCalled();
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getAllInRoom', () => {
    it('should return encounters for authorized user', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        roomId: 'room-1',
      };
      const mockUser = { id: 'user-1', role: Roles.PHYSICIAN };
      const paginatedResponse: unknown = {
        data: [mockEncounter as PatientEncounter],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      userService.send.mockReturnValue(of(mockUser));
      userService.send.mockReturnValueOnce(of(mockUser));
      userService.send.mockReturnValueOnce(of([mockServiceRoom as ServiceRoom]));
      paginationService.paginate.mockResolvedValue(paginatedResponse as any);

      const result = await service.getAllInRoom(filterDto, 'user-1');

      expect(result).toEqual(paginatedResponse);
    });

    it('should throw error for unauthorized user', async () => {
      const filterDto = { page: 1, limit: 10 };
      const mockUser = { id: 'user-1', role: Roles.RECEPTION_STAFF };

      userService.send.mockReturnValue(of(mockUser));

      await expect(service.getAllInRoom(filterDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return empty result if no service rooms found', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        roomId: 'room-1',
      };
      const mockUser = { id: 'user-1', role: Roles.PHYSICIAN };

      userService.send.mockReturnValue(of(mockUser));
      userService.send.mockReturnValueOnce(of(mockUser));
      userService.send.mockReturnValueOnce(of([]));

      const result = await service.getAllInRoom(filterDto, 'user-1');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getStatsInDateRange', () => {
    it('should return stats for date range', async () => {
      const stats = { total: 10, completed: 5 };
      encounterRepository.getStatsInDateRange.mockResolvedValue(stats);

      const result = await service.getStatsInDateRange('2024-01-01', '2024-01-31');

      expect(encounterRepository.getStatsInDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(result).toEqual(stats);
    });

    it('should throw error for invalid date format', async () => {
      await expect(service.getStatsInDateRange('invalid', '2024-01-31')).rejects.toThrow();
    });

    it('should throw error if dateFrom > dateTo', async () => {
      await expect(service.getStatsInDateRange('2024-01-31', '2024-01-01')).rejects.toThrow();
    });

    it('should filter by roomId if provided', async () => {
      const stats = { total: 5 };
      userService.send.mockReturnValue(of([mockServiceRoom]));
      encounterRepository.getStatsInDateRange.mockResolvedValue(stats);

      const result = await service.getStatsInDateRange('2024-01-01', '2024-01-31', 'room-1');

      expect(encounterRepository.getStatsInDateRange).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
        ['service-room-1']
      );
      expect(result).toEqual(stats);
    });
  });

  describe('autoMarkCancelledEncounters', () => {
    it('should mark waiting encounters as cancelled', async () => {
      const waitingEncounters = [mockEncounter];
      const transactionalEm = {
        find: jest.fn(),
      };

      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback(transactionalEm);
      });

      encounterRepository.findAll.mockResolvedValue(waitingEncounters as any);
      encounterRepository.batchUpdate.mockResolvedValue(waitingEncounters as any);

      const result = await service.autoMarkCancelledEncounters();

      expect(result.updatedCount).toBe(1);
      expect(result.encounters).toEqual(waitingEncounters);
      expect(encounterRepository.batchUpdate).toHaveBeenCalledWith(
        ['encounter-1'],
        expect.objectContaining({
          status: EncounterStatus.CANCELLED,
        }),
        transactionalEm
      );
    });

    it('should return zero count if no waiting encounters', async () => {
      entityManager.transaction.mockImplementation(async (callback: any) => {
        return callback({});
      });

      encounterRepository.findAll.mockResolvedValue([]);

      const result = await service.autoMarkCancelledEncounters();

      expect(result.updatedCount).toBe(0);
      expect(result.encounters).toEqual([]);
    });
  });

  describe('getEncounterStatsFromRoomIdsInDate', () => {
    it('should return queue info for rooms', async () => {
      const filters = [
        { roomId: 'room-1', serviceRoomIds: ['service-room-1'] },
      ];
      const encounters = [
        { ...(mockEncounter as any), status: EncounterStatus.WAITING },
        { ...(mockEncounter as any), id: 'encounter-2', status: EncounterStatus.ARRIVED },
      ];

      userService.send.mockReturnValue(of([mockServiceRoom]));
      encounterRepository.getEncounterStatsByServiceRoomIdsInDate.mockResolvedValue(encounters);

      const result = await service.getEncounterStatsFromRoomIdsInDate(filters);

      expect(result['room-1']).toBeDefined();
      expect(result['room-1'].maxWaiting).toBeGreaterThan(0);
    });

    it('should return empty object if no rooms provided', async () => {
      const result = await service.getEncounterStatsFromRoomIdsInDate([]);

      expect(result).toEqual({});
    });

    it('should handle rooms with no service rooms', async () => {
      const filters = [{ roomId: 'room-1', serviceRoomIds: [] }];

      userService.send.mockReturnValue(of([]));

      const result = await service.getEncounterStatsFromRoomIdsInDate(filters);

      expect(result['room-1']).toEqual({
        maxWaiting: 0,
        currentInProgress: 0,
      });
    });
  });

  describe('filterEncounter', () => {
    it('should filter encounters with search fields', async () => {
      const filterData = {
        paginationDto: { page: 1, limit: 10 },
        priority: EncounterPriorityLevel.URGENT,
        status: EncounterStatus.WAITING,
      };
      const paginatedResponse = {
        data: [mockEncounter],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      encounterRepository.filterEncounter.mockResolvedValue(paginatedResponse as any);

      const result = await service.filterEncounter(filterData);

      expect(encounterRepository.filterEncounter).toHaveBeenCalledWith(
        expect.objectContaining({
          ...filterData,
          searchFields: expect.arrayContaining(['patientCode', 'firstName', 'lastName']),
        })
      );
      expect(result).toEqual(paginatedResponse);
    });
  });
});

