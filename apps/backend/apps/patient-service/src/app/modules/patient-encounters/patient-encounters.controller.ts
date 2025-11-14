import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PatientEncounterService,
  RoomEncounterFilters,
} from './patient-encounters.service';
import {
  CreatePatientEncounterDto,
  FilterPatientEncounterDto,
  UpdatePatientEncounterDto,
} from '@backend/shared-domain';
import { PatientEncounter } from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  PATIENT_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';

const moduleName = 'Encounter';
@Controller('encounters')
export class PatientEncounterController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(
    private readonly patientEncounterService: PatientEncounterService
  ) {}

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() createPatientEncounterDto: CreatePatientEncounterDto
  ): Promise<PatientEncounter> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      console.log('create encounter dto', createPatientEncounterDto);

      return await this.patientEncounterService.create(
        createPatientEncounterDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create patient encounter',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(): Promise<PatientEncounter[]> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.patientEncounterService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all patient encounters',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<PatientEncounter | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.patientEncounterService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find patient encounter with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  // PatientService.Encounter.GetStatsInDateRange
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStatsInDateRange`)
  async getStatsInDateRange(
    @Payload() data: { dateFrom: string; dateTo: string; roomId?: string }
  ) {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStatsInDateRange`
    );
    try {
      const { dateFrom, dateTo, roomId } = data;
      return await this.patientEncounterService.getStatsInDateRange(
        dateFrom,
        dateTo,
        roomId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to get encounter stats in date range`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updatePatientEncounterDto: UpdatePatientEncounterDto;
    }
  ): Promise<PatientEncounter | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updatePatientEncounterDto } = data;
      return await this.patientEncounterService.update(
        id,
        updatePatientEncounterDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update patient encounter with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }
  // PatientService.Encounter.Create
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      const { id } = data;
      return await this.patientEncounterService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete patient encounter with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY_IN_ROOM}`
  )
  findByRoom(
    @Payload() data: { filterQueue: FilterPatientEncounterDto; userId: string }
  ) {
    console.log('dataa', data);

    console.log('data', data);

    return this.patientEncounterService.getAllInRoom(
      data.filterQueue,
      data.userId
    );
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<PatientEncounter>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.patientEncounterService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'chiefComplaint',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many patient encounters',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getEncounterStats(): Promise<any> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`);
    try {
      return await this.patientEncounterService.getEncounterStats();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get patient encounter stats',
        PATIENT_SERVICE
      );
    }
  }

  // get encounters by patient ID
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.FindByPatientId`)
  async findByPatientId(
    @Payload() data: { patientId: string; pagination: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<PatientEncounter>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.FindByPatientId`
    );
    try {
      const { patientId, pagination } = data;

      return await this.patientEncounterService.findByPatientId(
        patientId,
        pagination
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find patient encounters for patient ID: ${data.patientId}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    'PatientService.PatientEncounter.GetEncounterStatsFromRoomIds'
  )
  async getEncounterStatsFromRoomIds(@Payload() data: RoomEncounterFilters[]) {
    this.logger.log(
      'Using pattern: PatientService.PatientEncounter.GetEncounterStatsFromRoomIds'
    );
    try {
      return await this.patientEncounterService.getEncounterStatsFromRoomIdsInDate(
        data
      );
    } catch (error) {
      console.log(error);
      this.logger.error('Error getting encounter stats for roomIds', error);
      throw handleErrorFromMicroservices(
        error,
        'Error getting encounter stats for roomIds',
        'PatientService'
      );
    }
  }
}
