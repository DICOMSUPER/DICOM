import {
  Controller,
  Logger,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatientService } from './patients.service';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  Patient,
  PatientStatsDto
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  PATIENT_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';

const moduleName = 'Patient';
@Controller('patients')
export class PatientController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(private readonly patientService: PatientService) {}

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createPatientDto: CreatePatientDto }
  ): Promise<Patient> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createPatientDto } = data;
      return await this.patientService.create(createPatientDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create patient',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`)
  async findAll(): Promise<Patient[]> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.patientService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all patients',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`)
  async findOne(@Payload() data: { id: string }): Promise<Patient | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.patientService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find patient with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updatePatientDto: UpdatePatientDto;
    }
  ): Promise<Patient | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updatePatientDto } = data;
      return await this.patientService.update(id, updatePatientDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update patient with id: ${data.id}`,
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
      return await this.patientService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete patient with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`)
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<Patient>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.patientService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'patientCode',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many patients',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.FindByCode`)
  async findByCode(
    @Payload() data: { patientCode: string }
  ): Promise<Patient | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.FindByCode`
    );
    try {
      const { patientCode } = data;
      return await this.patientService.findPatientByCode(patientCode);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find patient with code: ${data.patientCode}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getPatientStats(): Promise<PatientStatsDto> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`
    );
    try {
      return await this.patientService.getPatientStats();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get patient stats',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Restore`)
  async restore(@Payload() data: { id: string }): Promise<Patient | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.Restore`
    );
    try {
      const { id } = data;
      return await this.patientService.restore(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to restore patient with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }
}
