import {
  Controller,
  Logger,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatientEncounterService } from './patient-encounters.service';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
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

const moduleName = 'PatientEncounter';
@Controller('patient-encounters')
export class PatientEncounterController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(private readonly patientEncounterService: PatientEncounterService) {}

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createPatientEncounterDto: CreatePatientEncounterDto }
  ): Promise<PatientEncounter> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createPatientEncounterDto } = data;
      return await this.patientEncounterService.create(createPatientEncounterDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create patient encounter',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`)
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

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`)
  async findOne(@Payload() data: { id: string }): Promise<PatientEncounter | null> {
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
      return await this.patientEncounterService.update(id, updatePatientEncounterDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update patient encounter with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

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

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`)
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
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`
    );
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

}
