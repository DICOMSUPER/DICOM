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
  UpdatePatientEncounterDto,
} from '@backend/shared-domain';
import { EncounterStatus, Roles } from '@backend/shared-enums';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { Between, In, Raw } from 'typeorm';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class PatientEncounterService {
  constructor(
    @Inject() private readonly encounterRepository: PatientEncounterRepository,
    private readonly paginationService: PaginationService,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  create = async (
    createPatientEncounterDto: CreatePatientEncounterDto
  ): Promise<PatientEncounter> => {
    return await this.encounterRepository.create({
      ...createPatientEncounterDto,
      status: EncounterStatus.WAITING,
    });
  };

  findAll = async (): Promise<PatientEncounter[]> => {
    return await this.encounterRepository.findAll({ where: {} });
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
    return await this.encounterRepository.paginate(paginationDto);
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
    const whereConditions = { patient: { id: patientId } };
    const { page, limit } = paginationDto;

    return await this.paginationService.paginate(
      PatientEncounter,
      { page, limit },
      {
        where: whereConditions,
        order: {
          createdAt: 'DESC',
        },
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
      this.userService.send('UserService.Users.findOne', { id:userId })
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
      console.log("getStatsInDateRange serviceRooms", serviceRooms);
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

  async autoMarkLeavedEncounters(): Promise<{
    updatedCount: number;
    encounters: PatientEncounter[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const waitingEncounters = await this.encounterRepository.findAll({
      where: {
        encounterDate: Between(today, endOfDay),
        status: In([EncounterStatus.WAITING]),
        isDeleted: false,
      },
      relations: ['patient'],
    });

    if (waitingEncounters.length === 0) {
      return { updatedCount: 0, encounters: [] };
    }

    // Update all to UNARRIVED
    const updatePromises = waitingEncounters.map((encounter) =>
      this.encounterRepository.update(encounter.id, {
        status: EncounterStatus.LEAVED,
        updatedAt: new Date(),
      })
    );

    await Promise.all(updatePromises);

    return {
      updatedCount: waitingEncounters.length,
      encounters: waitingEncounters,
    };
  }
}
