import { Role } from '@backend/shared-decorators';
import {
  FilterImagingOrderFormDto,
  Patient,
  Room,
} from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { BackendRedisModule } from '@backend/redis';
import { RedisService } from '@backend/redis';

import { firstValueFrom } from 'rxjs';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';

@ApiTags('Imaging Order Forms')
@Controller('imaging-order-form')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingOrderFormController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new imaging order form' })
  @ApiResponse({
    status: 201,
    description: 'The imaging order form has been created.',
  })
  @ApiBody({ description: 'Imaging order form creation payload', type: Object })
  @Role(Roles.PHYSICIAN)
  async createImagingOrderForm(
    @Body() createImagingOrderFormDto: any,
    @Req() req: IAuthenticatedRequest
  ) {
    console.log('create imaging order form', createImagingOrderFormDto);
    const userId = req.userInfo.userId;
    console.log('Sender Id', userId);

    const roomAssignmentInCurrentSession = await firstValueFrom(
      this.userService.send(
        'UserService.EmployeeRoomAssignments.FindByRoomInCurrentSession',
        createImagingOrderFormDto.roomId as string
      )
    );
    if (!roomAssignmentInCurrentSession) {
      throw new Error('No room assignment found for the current session');
    }

    const uniqueEmployeeIds = [
      ...new Set(
        roomAssignmentInCurrentSession.map(
          (assignment: any) => assignment.employeeId
        )
      ),
    ];
    console.log('unique employee', uniqueEmployeeIds);

    const orderForm = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Create', {
        createImagingOrderFormDto,
        userId,
        employeesInRoom: uniqueEmployeeIds,
      })
    );

    const pattern = `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.id}/${orderForm.id}`;
    await this.redisService.set(pattern, orderForm, CACHE_TTL_SECONDS);

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.all}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.stats}`
    );

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.byPatientId}`
    );
    return orderForm;
  }

  @Get()
  @ApiOperation({ summary: 'Get all imaging order forms' })
  @ApiResponse({ status: 200, description: 'List of imaging order forms' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
  })
  @ApiQuery({ name: 'patientName', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  async getAllImagingOrderForms(
    @Query() filter: FilterImagingOrderFormDto,
    @Req() req: IAuthenticatedRequest
  ) {
    const userId = req.userInfo.userId;

    const pattern = `${CacheEntity.imagingOrderForms}.${
      CacheKeyPattern.paginated
    }?page=${filter.page || ''}&limit=${filter.limit || ''}&order=${
      filter.order || ''
    }&patientName=${filter.patientName || ''}&status=${filter.status || ''}`;

    const cachedOrderForms = await this.redisService.get(pattern);
    if (cachedOrderForms) {
      return cachedOrderForms;
    }
    const orderForms = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.FindAll', {
        filter,
        userId,
      })
    );
    await this.redisService.set(pattern, orderForms, CACHE_TTL_SECONDS);
    return orderForms;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get imaging order form by ID' })
  @ApiResponse({ status: 200, description: 'Imaging order form details' })
  @ApiParam({ name: 'id', description: 'Imaging Order Form ID' })
  async getImagingOrderForm(@Param('id') id: string) {
    const pattern = `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.id}/${id}`;

    const cachedOrderForm = await this.redisService.get(pattern);
    if (cachedOrderForm) {
      return cachedOrderForm;
    }

    const orderForm = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.FindOne', {
        id,
      })
    );
    await this.redisService.set(pattern, orderForm, CACHE_TTL_SECONDS);
    return orderForm;
  }

  @Patch(':id')
  @ApiBody({ description: 'Imaging order form update payload', type: Object })
  @ApiOperation({ summary: 'Update an imaging order form' })
  @ApiResponse({
    status: 200,
    description: 'The imaging order form has been updated.',
  })
  async updateImagingOrderForm(
    @Param('id') id: string,
    @Body() updateImagingOrderFormDto: any
  ) {
    const pattern = `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.id}/${id}`;
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Update', {
        id,
        updateDto: updateImagingOrderFormDto,
      })
    );

    await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.byPatientId}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.stats}`
    );
    return result;
  }

  @Delete(':id')
  @ApiBody({ description: 'Imaging order form deletion payload', type: Object })
  @ApiOperation({ summary: 'Delete an imaging order form' })
  @ApiResponse({
    status: 200,
    description: 'The imaging order form has been deleted.',
  })
  async deleteImagingOrderForm(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Delete', { id })
    );

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.all}`
    );
    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.stats}`
    );

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.byPatientId}`
    );

    await this.redisService.delete(
      `${CacheEntity.imagingOrderForms}.${CacheKeyPattern.id}/${id}`
    );

    return result;
  }

  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get imaging order forms by patient ID' })
  @ApiResponse({
    status: 200,
    description: 'List of imaging order forms for the patient',
  })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
  })
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.imagingOrderForms}.${
      CacheKeyPattern.byPatientId
    }/${patientId}?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&sortField=${sortField || ''}&order=${order || ''}`;

    const cachedOrderForms = await this.redisService.get(pattern);
    if (cachedOrderForms) {
      return cachedOrderForms;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      sortField,
      order,
    };

    const orderForm = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrderForm.FindByPatientId',
        {
          patientId,
          paginationDto,
        }
      )
    );
    await this.redisService.set(pattern, orderForm, CACHE_TTL_SECONDS);
    return orderForm;
  }
}
