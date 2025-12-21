import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Logger,
  Query,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';
import { Public } from '@backend/shared-decorators';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { RepositoryPaginationDto } from '@backend/database';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
} from '../../../../../src/constant/cache';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';
import { RedisService } from '@backend/redis';
// import { CreatePatientConditionDto } from 'libs/shared-domain/src';
@Controller('patient-conditions')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class PatientConditionController {
  private readonly logger = new Logger('PatientConditionController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncachePatientConditions(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.patientConditions, id)
      );
    }

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.findAll(CacheEntity.patientConditions)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byPatientId(CacheEntity.patientConditions)
    );
  }

  @Post()
  async create(@Body() createPatientConditionDto: any) {
    try {
      console.log("🔵 API Gateway received body:", JSON.stringify(createPatientConditionDto, null, 2));
      console.log("🔵 Body type:", typeof createPatientConditionDto);
      console.log("🔵 Body keys:", Object.keys(createPatientConditionDto || {}));
      
      if (!createPatientConditionDto || Object.keys(createPatientConditionDto).length === 0) {
        throw new BadRequestException('Request body is empty or invalid');
      }
      
      console.log("🔵 Sending to microservice:", { createPatientConditionDto });
      
      const result = await firstValueFrom(
        this.patientService.send(
          'PatientService.PatientCondition.Create',
          { createPatientConditionDto }
        )
      );

      await this.uncachePatientConditions();

      const pattern = cacheKeyBuilder.id(
        CacheEntity.patientConditions,
        result.id
      );

      await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);

      return result;
    } catch (error) {
      this.logger.error('Error creating patient condition:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() searchDto: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );

      const pattern = cacheKeyBuilder.findAll(CacheEntity.patientConditions, {
        ...validatedParams,
        ...searchDto,
      });

      const cachedData = await this.redisService.get(pattern);
      // if (cachedData) {
      //   return cachedData;
      // }

      const paginationDto = {
        ...validatedParams,
        ...searchDto,
      };
      const result = await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindMany', {
          paginationDto,
        })
      );

      await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);
      return result;
    } catch (error) {
      this.logger.error('Error finding all patient conditions:', error);
      throw error;
    }
  }

  @Public()
  @Get('patient/:id')
  async findByPatientId(
    @Param('id') id: string,
    @Query() pagination: RepositoryPaginationDto
  ) {
    try {
      const paginationDto = {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? 10,
      };

      const pattern = cacheKeyBuilder.byPatientId(
        CacheEntity.patientConditions,
        id,
        paginationDto
      );

      const cachedData = await this.redisService.get(pattern);
      // if (cachedData) {
      //   return cachedData;
      // }

      const result = await firstValueFrom(
        this.patientService.send(
          'PatientService.PatientCondition.FindByPatientId',
          { patientId: id, paginationDto }
        )
      );

      await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);
      return result;
    } catch (error) {
      this.logger.error(
        'Error finding patient conditions by patient ID:',
        error
      );
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

      const pattern = cacheKeyBuilder.id(CacheEntity.patientConditions, id);

      const cachedData = await this.redisService.get(pattern);
      // if (cachedData) {
      //   return cachedData;
      // }

      const result = await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindOne', {
          id,
        })
      );

      await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);
      return result;
    } catch (error) {
      this.logger.error('Error finding patient condition by ID:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientConditionDto: any
  ) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      const result = await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Update', {
          id,
          updatePatientConditionDto,
        })
      );

      await this.uncachePatientConditions(id);

      const pattern = cacheKeyBuilder.id(CacheEntity.patientConditions, id);

      await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);

      return result;
    } catch (error) {
      this.logger.error('Error updating patient condition:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      const result = await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Delete', {
          id,
        })
      );

      await this.uncachePatientConditions(id);

      return result;
    } catch (error) {
      this.logger.error('Error deleting patient condition:', error);
      throw error;
    }
  }
}
