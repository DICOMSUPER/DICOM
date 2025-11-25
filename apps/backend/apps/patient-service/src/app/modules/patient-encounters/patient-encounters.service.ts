import {
  PaginatedResponseDto,
  PaginationService,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreatePatientEncounterDto,
  FilterPatientEncounterDto,
  PatientEncounter,
  PatientEncounterRepository,
  ServiceRoom,
  UpdatePatientEncounterDto,
} from '@backend/shared-domain';
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
  Roles,
} from '@backend/shared-enums';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { Between, EntityManager, In, LessThan, Or, Raw } from 'typeorm';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';
import { InjectEntityManager } from '@nestjs/typeorm';

export interface QueueInfo {
  [roomId: string]: {
    maxWaiting: number;
    currentInProgress: number;
  };
}

export interface RoomEncounterFilters {
  roomId: string;
  serviceRoomIds: string[];
}
@Injectable()
export class PatientEncounterService {
  constructor(
    @Inject() private readonly encounterRepository: PatientEncounterRepository,
    private readonly paginationService: PaginationService,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  getOrderNumberInDate = async (serviceRoomId: string): Promise<number> => {
    const serviceRoom: ServiceRoom = await firstValueFrom(
      this.userService.send('UserService.ServiceRooms.FindOne', serviceRoomId)
    );

    const serviceRooms = await firstValueFrom(
      this.userService.send(
        'UserService.ServiceRooms.FindAllWithoutPagination',
        { roomId: serviceRoom.roomId }
      )
    );

    const serviceRoomIds = serviceRooms.map((serviceRoom: ServiceRoom) => {
      return serviceRoom.id;
    });

    const encounter = await this.encounterRepository.getLatestEncounterInDate(
      serviceRoomIds
    );

    if (!encounter) return 1;
    return encounter.orderNumber + 1;
  };

  create = async (
    createPatientEncounterDto: CreatePatientEncounterDto
  ): Promise<PatientEncounter> => {
    const orderNumber = await this.getOrderNumberInDate(
      createPatientEncounterDto?.serviceRoomId as string
    );

    const data = {
      ...createPatientEncounterDto,
      orderNumber,
      status: EncounterStatus.WAITING,
    };

    console.log('create body:', data);
    return await this.encounterRepository.create(data);
  };

  findAll = async (): Promise<PatientEncounter[]> => {
    return await this.encounterRepository.findAll(
      { where: { isDeleted: false } },
      ['patient']
    );
  };

  findOne = async (id: string): Promise<PatientEncounter | null> => {
    const encounter = await this.encounterRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!encounter) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient encounter',
        PATIENT_SERVICE
      );
    }
    return encounter;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientEncounter>> => {
    const paginationWithRelations: RepositoryPaginationDto = {
      ...paginationDto,
      relation: Array.from(
        new Set([...(paginationDto.relation ?? []), 'patient'])
      ),
    };

    return await this.encounterRepository.paginate(paginationWithRelations);
  };

  update = async (
    id: string,
    updatePatientEncounterDto: UpdatePatientEncounterDto
  ): Promise<PatientEncounter | null> => {
    const encounter = await this.findOne(id);
    return await this.encounterRepository.update(id, updatePatientEncounterDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.findOne(id);
    return await this.encounterRepository.softDelete(id, 'isDeleted');
  };

  getEncounterStats = async (): Promise<any> => {
    return await this.encounterRepository.getEncounterStats();
  };

  findByPatientId = async (
    patientId: string,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientEncounter>> => {
    const whereConditions = { patient: { id: patientId }, isDeleted: false };
    const { page, limit } = paginationDto;

    return await this.paginationService.paginate(
      PatientEncounter,
      { page, limit },
      {
        where: whereConditions,
        order: {
          createdAt: 'DESC',
        },
        relations: { patient: true },
      }
    );
  };
  async getAllInRoom(
    filterEncounter: FilterPatientEncounterDto,
    userId: string
  ): Promise<PaginatedResponseDto<PatientEncounter>> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      encounterDateFrom,
      encounterDateTo,
      patientName,
      orderNumber,
      roomId,
    } = filterEncounter;
    console.log('filter', filterEncounter);

    const whereConditions: any = {};

    const user = await firstValueFrom(
      this.userService.send('UserService.Users.findOne', { id: userId })
    );

    console.log('user', user);

    if (user.role !== Roles.PHYSICIAN && user.role !== Roles.SYSTEM_ADMIN) {
      throw new NotFoundException(
        `User with ID ${userId} is not authorized to view room assignments`
      );
    }
    if (status) {
      whereConditions.status = status;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    if (patientName) {
      whereConditions.patient = {
        firstName: Raw(
          (alias: string) =>
            `(${alias} || ' ' || last_name) ILIKE :patientName OR 
         (last_name || ' ' || ${alias}) ILIKE :patientName OR 
         ${alias} ILIKE :patientName OR 
         last_name ILIKE :patientName`,
          { patientName: `%${patientName}%` }
        ),
      };
    }

    if (orderNumber !== undefined) {
      whereConditions.orderNumber = orderNumber;
    }
    let fromDate: Date;
    let toDate: Date;

    if (encounterDateFrom) {
      fromDate = new Date(encounterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
    } else {
      fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);
    }

    if (encounterDateTo) {
      toDate = new Date(encounterDateTo);
      toDate.setHours(23, 59, 59, 999);
    } else {
      toDate = new Date();
      toDate.setHours(23, 59, 59, 999);
    }

    whereConditions.encounterDate = Between(fromDate, toDate);

    console.log('roomid', roomId);
    if (roomId) {
      console.log('anhsapper findby room');

      const serviceRooms = await firstValueFrom(
        this.userService.send('UserService.ServiceRooms.FindByRoom', { roomId })
      );
      console.log('serviceRooms', serviceRooms);

      if (serviceRooms && serviceRooms.length > 0) {
        const serviceRoomIds = serviceRooms.map((sr: any) => sr.id);
        whereConditions.serviceRoomId = In(serviceRoomIds);
      } else {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
    }

    // Date range
    // let fromDate = encounterDateFrom ? new Date(encounterDateFrom) : new Date();
    // fromDate.setHours(0, 0, 0, 0);

    // let toDate = encounterDateTo ? new Date(encounterDateTo) : new Date();
    // toDate.setHours(23, 59, 59, 999);

    // whereConditions.encounterDate = Between(fromDate, toDate);

    return this.paginationService.paginate(
      PatientEncounter,
      { page, limit },
      {
        where: whereConditions,
        order: {
          orderNumber: 'ASC',
        },
        relations: {
          patient: true,
        },
      }
    );
  }

  getStatsInDateRange = async (
    dateFrom: string,
    dateTo: string,
    roomId?: string
  ): Promise<any> => {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format. Expected format: YYYY-MM-DD');
    }

    if (startDate > endDate) {
      throw new Error('dateFrom cannot be greater than dateTo');
    }
    if (roomId) {
      const serviceRooms = await firstValueFrom(
        this.userService.send('UserService.ServiceRooms.FindByRoom', { roomId })
      );
      console.log('getStatsInDateRange serviceRooms', serviceRooms);
      if (serviceRooms && serviceRooms.length > 0) {
        const serviceRoomIds = serviceRooms.map((sr: any) => sr.id);
        return await this.encounterRepository.getStatsInDateRange(
          dateFrom,
          dateTo,
          serviceRoomIds
        );
      }
    }

    return await this.encounterRepository.getStatsInDateRange(dateFrom, dateTo);
  };

  async autoMarkCancelledEncounters(): Promise<{
    updatedCount: number;
    encounters: PatientEncounter[];
  }> {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const waitingEncounters = await this.encounterRepository.findAll(
          {
            where: {
              encounterDate: Or(Between(today, endOfDay), LessThan(today)), //in case missed previous date
              status: In([EncounterStatus.WAITING]),
              isDeleted: false,
            },
            relations: ['patient'],
          },
          [],
          transactionalEntityManager
        );

        if (waitingEncounters.length === 0) {
          return { updatedCount: 0, encounters: [] };
        }

        // Update all to CANCELLED
        // const updatePromises = waitingEncounters.map((encounter) =>
        //   this.encounterRepository.update(encounter.id, {
        //     status: EncounterStatus.CANCELLED,
        //     updatedAt: new Date(),
        //   })
        // );

        // await Promise.all(updatePromises);

        //Change to batch update to optimize db
        const encounterIds = waitingEncounters.map((e: PatientEncounter) => {
          return e.id;
        });

        const updatedEncounters = await this.encounterRepository.batchUpdate(
          encounterIds,
          {
            status: EncounterStatus.CANCELLED,
            updatedAt: new Date(),
          },
          transactionalEntityManager
        );

        return {
          updatedCount: waitingEncounters.length,
          encounters: updatedEncounters,
        };
      }
    );
  }

  async getEncounterStatsFromRoomIdsInDate(
    data: RoomEncounterFilters[]
  ): Promise<QueueInfo> {
    // Get all unique room IDs
    const uniqueRoomIds = [...new Set(data.map((d) => d.roomId))];

    if (uniqueRoomIds.length === 0) {
      const logger = new Logger('PatientService');
      logger.debug('No rooms provided, fall back to 0');
      return {};
    }

    // For each unique room, we need to get ALL its service rooms, not just the filtered ones
    const roomToAllServiceRoomIds = new Map<string, string[]>();

    for (const roomId of uniqueRoomIds) {
      // Fetch ALL service rooms for this room
      const allServiceRooms = await firstValueFrom(
        this.userService.send('UserService.ServiceRooms.FindByRoom', { roomId })
      );

      if (allServiceRooms && allServiceRooms.length > 0) {
        const allServiceRoomIds = allServiceRooms.map((sr: any) => sr.id);
        roomToAllServiceRoomIds.set(roomId, allServiceRoomIds);
      } else {
        roomToAllServiceRoomIds.set(roomId, []);
      }
    }

    // Flatten all service room IDs to fetch encounters
    const allServiceRoomIds = Array.from(
      roomToAllServiceRoomIds.values()
    ).flat();

    if (allServiceRoomIds.length === 0) {
      const logger = new Logger('PatientService');
      logger.debug('Rooms have no services, fall back to 0');
      return uniqueRoomIds.reduce((acc, roomId) => {
        acc[roomId] = {
          maxWaiting: 0,
          currentInProgress: 0,
        };
        return acc;
      }, {} as QueueInfo);
    }

    console.log('allServiceRoomIds: ', allServiceRoomIds);

    // Get all encounters for all service rooms
    const encounters =
      await this.encounterRepository.getEncounterStatsByServiceRoomIdsInDate(
        allServiceRoomIds
      );

    const queueInfo: QueueInfo = {};

    // Calculate stats per room using ALL service rooms in that room
    uniqueRoomIds.forEach((roomId) => {
      const serviceRoomIds = roomToAllServiceRoomIds.get(roomId) || [];

      const roomEncounters =
        encounters.filter((encounter) =>
          serviceRoomIds.includes(encounter.serviceRoomId as string)
        ) || [];

      const waitingEncounters =
        roomEncounters.filter(
          (encounter) => encounter.status === EncounterStatus.WAITING
        ) || [];

      const arrivedEncounters =
        roomEncounters.filter(
          (encounter) => encounter.status === EncounterStatus.ARRIVED
        ) || [];

      const finishedEncounters =
        roomEncounters.filter(
          (encounter) => encounter.status === EncounterStatus.FINISHED
        ) || [];

      queueInfo[roomId] = {
        maxWaiting:
          waitingEncounters.length +
          finishedEncounters.length +
          arrivedEncounters.length,
        currentInProgress: finishedEncounters.length + arrivedEncounters.length,
      };
    });

    return queueInfo;
  }

  filterEncounter = async (data: {
    paginationDto?: RepositoryPaginationDto;
    priority?: EncounterPriorityLevel;
    status?: EncounterStatus;
    startDate?: Date | string;
    endDate?: Date | string;
    roomServiceIds?: string[]; //api gateway will be responsible for getting all roomServiceWith provided serviceId
    type?: EncounterType;
  }): Promise<PaginatedResponseDto<PatientEncounter>> => {
    // console.log('Encounter filter at service level', data);
    const searchFields = [
      'patientCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'insuranceNumber',
    ];

    return await this.encounterRepository.filterEncounter({
      ...data,
      searchFields,
    });
  };
}
