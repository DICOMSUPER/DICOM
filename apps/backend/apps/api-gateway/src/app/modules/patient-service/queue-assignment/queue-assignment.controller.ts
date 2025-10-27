import {
  CreateQueueAssignmentDto,
  FilterQueueAssignmentDto,
  UpdateQueueAssignmentDto,
} from '@backend/shared-domain';
import { ValidationUtils } from '@backend/shared-utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public, Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';

@Controller('queue-assignments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class QueueAssignmentController {
  private readonly logger = new Logger('QueueAssignmentController');
  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy
  ) {}

  @Get('health')
  async checkHealth() {
    return 'queue-assignment is running';
  }

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
  @Role(Roles.PHYSICIAN)
  async findAllInRoom(
    @Req() req: any,
    @Query() filterQueue?: FilterQueueAssignmentDto,
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
      const userId = req['userInfo'].userId;

      const result = await firstValueFrom(
        this.patientService.send(
          'PatientService.QueueAssignment.FindManyInRoom',
          {
            filterQueue: payload,
            userId,
          }
        )
      );

      return result
    } catch (error) {
      this.logger.error('Error finding all queue assignments:', error);
      throw error;
    }
  }

  @Get()
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    try {
      const paginationDto = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        searchField,
        sortField,
        order,
      };

      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error('Error find many queue assigment: ', error);
      throw error;
    }
  }

  
  @Get('stats')
  @Public()
  async getStats(
    @Query("date") date?: string,
    @Query("roomId") roomId?: string
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.GetStats', { date, roomId })
      );
    } catch (error) {
      this.logger.error('Error get stats queue assignment: ', error);
      throw error;
    }
  }



  @Get(':id')
  async FindOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.FindOne', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error finding one queue assignment: ', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateQueueAssignmentDto: UpdateQueueAssignmentDto
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Update', {
          id,
          updateQueueAssignmentDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating queue assignment: ', error);
      throw error;
    }
  }

  @Patch(':id/complete')
  async completeQueue(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Complete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error completing queue assignment: ', error);
      throw error;
    }
  }

  @Patch(':id/expire')
  async expireQueue(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Expire', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error expiring queue assignment: ', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteQueue(@Param('id') id: string) {
    try {
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

  @Patch('next')
  async callNext(@Body() roomId: string, calledBy: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.CallNext', {
          roomId,
          calledBy,
        })
      );
    } catch (error) {
      this.logger.error('Error calling next queue assignment:', error);
      throw error;
    }
  }

  @Get(':id/estimate')
  async getEstimateTime(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.QueueAssignment.GetEstimatedWaitTime',
          { id }
        )
      );
    } catch (error) {
      this.logger.error('Error geting estimating time:', error);
      throw error;
    }
  }

  @Patch(':id/skip')
  async skipQueue(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.QueueAssignment.Skip', { id })
      );
    } catch (error) {
      this.logger.error('Error skipping queue assignment:', error);
      throw error;
    }
  }

  //cron job?
  @Patch('expired')
  async handledExpiredAssignment() {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.QueueAssignment.AutoExpire',
          {}
        )
      );
    } catch (error) {
      this.logger.error('Error geting estimating time:', error);
      throw error;
    }
  }
}
