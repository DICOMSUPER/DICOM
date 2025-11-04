import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatientService } from './patients.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  Patient,
  PatientCondition,
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
import { VitalSignsSimplified } from '@backend/shared-interfaces';

const moduleName = 'Patient';

export interface GetPatientIdsResponse {
  success: boolean;
  data: string[];
  count: number;
}

export interface FilterPatientRequest {
  patientIds: string[] | [];
  patientFirstName?: string;
  patientLastName?: string;
  patientCode?: string;
}

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

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
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

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
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

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
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

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.GET_PATIENT_OVERVIEW}`
  )
  async getPatientOverview(@Payload() data: { patientCode: string }): Promise<{
    recentVitalSigns: VitalSignsSimplified;
    recentConditions: PatientCondition[];
  } | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.GET_PATIENT_OVERVIEW}`
    );
    try {
      const { patientCode } = data;
      return await this.patientService.getOverview(patientCode);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find patient with code: ${data.patientCode}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getPatientStats() {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`);
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
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.Restore`);
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

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetIds`)
  async getPatientIds(
    @Payload() data: { take?: number; skip?: number }
  ): Promise<GetPatientIdsResponse | null> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetIds`);
    try {
      const { take = 10, skip = 0 } = data;
      const patients = await this.patientService.findAll();

      const selectedPatients = patients
        .filter((p) => p.isActive)
        .slice(skip, skip + take);

      const patientIds = selectedPatients.map((p) => p.id);

      this.logger.log(`Returning ${patientIds.length} patient IDs`);

      return {
        success: true,
        data: patientIds,
        count: patientIds.length,
      };
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get patient IDs',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Filter`)
  async filterPatient(
    @Payload()
    data: FilterPatientRequest
  ) {
    try {
      return await this.patientService.filter(
        data.patientIds,
        data.patientFirstName,
        data.patientLastName,
        data.patientCode
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to filter patient',
        PATIENT_SERVICE
      );
    }
  }
}
