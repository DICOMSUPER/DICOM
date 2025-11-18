import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  BadRequestException,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';
import {
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
} from '@backend/shared-domain';
import type {
  EncounterSearchFilters,
  FilterPatientEncounterDto,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { RepositoryPaginationDto } from '@backend/database';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@Controller('encounters')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class PatientEncounterController {
  private readonly logger = new Logger('PatientEncounterController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy
  ) {}

  @Get('in-room')
  @Role(Roles.PHYSICIAN)
  async findAllInRoom(
    @Req() req: IAuthenticatedRequest,
    @Query() filterQueue?: FilterPatientEncounterDto
  ) {
    try {
      const validatedParams = ValidationUtils.validatePaginationParams(
        filterQueue?.page,
        filterQueue?.limit
      );

      console.log('validatedParams', validatedParams);
      const payload = {
        ...filterQueue,
        ...validatedParams,
      };
      console.log('Payload', payload);

      const userId = req.userInfo.userId;
      console.log('User id', userId);

      const result = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindManyInRoom', {
          filterQueue: payload,
          userId,
        })
      );
      console.log('result', result);

      return result;
    } catch (error) {
      this.logger.error('Error finding all patient encounters in room:', error);
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPatientEncounterDto: CreatePatientEncounterDto,
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      const userId = req.userInfo.userId;
      createPatientEncounterDto.createdBy = userId;
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Create', {
          ...createPatientEncounterDto,
          createdBy: userId,
        })
      );
    } catch (error) {
      this.logger.error('Error creating encounter:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() filters: EncounterSearchFilters,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );

      const paginationDto = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        ...filters,
      };
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error('Error fetching encounters:', error);
      throw error;
    }
  }

  @Get('stats-in-date-range')
  async getStatsInDateRange(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('roomId') roomId?: string
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.Encounter.GetStatsInDateRange',
          {
            dateFrom,
            dateTo,
            roomId,
          }
        )
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
      throw error;
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindOne', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error fetching encounter:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientEncounterDto: UpdatePatientEncounterDto
  ) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Update', {
          id,
          updatePatientEncounterDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating encounter:', error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Delete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error deleting encounter:', error);
      throw error;
    }
  }

  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query() pagination: RepositoryPaginationDto
  ) {
    try {
      if (!ValidationUtils.isValidUUID(patientId)) {
        throw new BadRequestException(`Invalid UUID format: ${patientId}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindByPatientId', {
          patientId,
          pagination,
        })
      );
    } catch (error) {
      this.logger.error('Error fetching encounters by patient ID:', error);
      throw error;
    }
  }
}
