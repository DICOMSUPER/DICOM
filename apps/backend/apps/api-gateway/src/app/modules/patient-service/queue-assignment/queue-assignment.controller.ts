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
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';
import { CreateQueueAssignmentDto } from '@backend/shared-domain';
import { FilterQueueAssignmentDto } from '@backend/shared-domain';

import { Role1s } from '@backend/auth-guards';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';

@Controller('queue-assignments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class QueueAssignmentController {
  private readonly logger = new Logger('QueueAssignmentController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PatientService')
    private readonly patientService: ClientProxy
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.QueueAssignment.Create',
          createQueueAssignmentDto
        )
      );
    } catch (error) {
      this.logger.error('Error creating queue assignment:', error);
      throw error;
    }
  }

  @Get('in-room')
  // @Role1s(Roles.PHYSICIAN)
  async findAllInRoom(
    @Query('userId') userId: string,
    // @Req() req: any,
    @Query() filterQueue?: FilterQueueAssignmentDto
  ) {
    try {
      const validatedParams = ValidationUtils.validatePaginationParams(
        filterQueue?.page,
        filterQueue?.limit
      );
      // const userId = req.sub;
      // console.log('user id', userId);
        
      // console.log('user from request:', req.user);

      console.log('validatedParams', validatedParams);
      const payload = {
        ...filterQueue,
        ...validatedParams,
      };

      return await firstValueFrom(
        this.patientService.send(
          'PatientService.QueueAssignment.FindManyInRoom',
          {
            filterQueue: payload,
            userId,
          }
        )
      );
    } catch (error) {
      this.logger.error('Error finding all queue assignments:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() searchDto: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') searchTerm?: string
  ) {
    try {
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );
      if (
        searchTerm !== undefined &&
        (!searchTerm || searchTerm.trim().length === 0)
      ) {
        throw new BadRequestException('Search term cannot be empty');
      }

      const paginationDto = {
        ...validatedParams,
        search: searchTerm,
        ...searchDto,
      };
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error('Error finding all queue assignments:', error);
      throw error;
    }
  }

  @Get('stats')
  async getQueueAssignmentStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error getting queue assignment stats:', error);
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
        this.patientService.send('PatientService.QueueAssignment.FindOne', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error finding queue assignment by ID:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateQueueAssignmentDto: any) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Update', {
          id,
          updateQueueAssignmentDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating queue assignment:', error);
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

      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Delete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error deleting queue assignment:', error);
      throw error;
    }
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Restore', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error restoring queue assignment:', error);
      throw error;
    }
  }
}
