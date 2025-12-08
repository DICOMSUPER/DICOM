import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
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
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ImagingOrder,
  Patient,
  UpdateImagingOrderDto,
  User,
} from '@backend/shared-domain';
import { ImagingOrderStatus } from '@backend/shared-enums';
import { handleError } from '@backend/shared-utils';
import { firstValueFrom } from 'rxjs';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { RedisService } from '@backend/redis';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';

type FilteredOrder = Partial<ImagingOrder> & {
  patient: Patient;
  orderingPhysician: User;
};

@ApiTags('Imaging Orders')
@Controller('imaging-orders')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingOrdersController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheImagingOrders(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.imagingOrders, id)
      );
    }

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.findAll(CacheEntity.imagingOrders)
    );

    await this.redisService.delete(
      cacheKeyBuilder.paginated(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byReferenceId(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.filterByRoomId(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.roomStats(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.roomStats2(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.roomStatsInDateRange(CacheEntity.imagingOrders)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byPatientId(CacheEntity.imagingOrders)
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new imaging order' })
  @ApiResponse({
    status: 201,
    description: 'The imaging order has been created.',
  })
  @ApiBody({ description: 'Imaging order creation payload', type: Object })
  async createImagingOrder(@Body() createImagingOrderDto: any) {
    const order = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.Create',
        createImagingOrderDto
      )
    );

    await this.uncacheImagingOrders(order.id);
    await this.redisService.set(
      cacheKeyBuilder.id(CacheEntity.imagingOrders, order.id),
      order,
      CACHE_TTL_SECONDS
    );

    return order;
  }

  @Get()
  @ApiOperation({ summary: 'Get all imaging orders' })
  @ApiResponse({ status: 200, description: 'List of all imaging orders' })
  async getAllImagingOrders() {
    const pattern = cacheKeyBuilder.findAll(CacheEntity.imagingOrders);
    const cachedOrders = await this.redisService.get(pattern);
    // if (cachedOrders) {
    //   return cachedOrders;
    // }

    const orders = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindAll', {})
    );

    await this.redisService.set(pattern, orders, CACHE_TTL_SECONDS);
    return orders;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated imaging orders' })
  @ApiResponse({ status: 200, description: 'Paginated imaging orders' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = cacheKeyBuilder.paginated(CacheEntity.imagingOrders, {
      page,
      limit,
      search,
      searchField,
      sortField,
      order,
    });

    const cachedOrders = await this.redisService.get(pattern);
    // if (cachedOrders) {
    //   return cachedOrders;
    // }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const ordersResponse = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindMany', {
        paginationDto,
      })
    );

    const orders = ordersResponse.data || [];

    // Enrich orders with patient and physician data
    const patientIds = orders
      .map((o: ImagingOrder) => {
        return o.imagingOrderForm?.patientId;
      })
      .filter(Boolean);

    let patients: Patient[] = [];
    if (patientIds.length > 0) {
      patients =
        (await firstValueFrom(
          this.patientService.send('PatientService.Patient.Filter', {
            patientIds,
          })
        )) || [];
    }

    const physicianIds = orders
      .map((o: ImagingOrder) => {
        return o?.imagingOrderForm?.orderingPhysicianId;
      })
      .filter(Boolean);

    let physicians: User[] = [];
    if (physicianIds.length > 0) {
      physicians =
        (await firstValueFrom(
          this.userService.send('UserService.Users.GetUsersByIds', {
            userIds: physicianIds,
          })
        )) || [];
    }

    // Combine orders with patient and physician data
    const enrichedOrders = orders.map((order: ImagingOrder) => {
      return {
        ...order,
        patient: patients.find(
          (p: Patient) => p.id === order.imagingOrderForm?.patientId
        ),
        orderPhysician: physicians.find(
          (u: User) => u.id === order.imagingOrderForm?.orderingPhysicianId
        ),
      };
    });

    const enrichedResponse = {
      ...ordersResponse,
      data: enrichedOrders,
    };

    await this.redisService.set(pattern, enrichedResponse, CACHE_TTL_SECONDS);
    return enrichedResponse;
  }

  @Get('reference/:id')
  @ApiOperation({ summary: 'Get imaging orders by reference ID' })
  @ApiResponse({ status: 200, description: 'Imaging orders by reference ID' })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiParam({ name: 'id', required: true, type: String })
  async findImagingOrderByReferenceId(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = cacheKeyBuilder.byReferenceId(
      CacheEntity.imagingOrders,
      id,
      {
        type,
        page,
        limit,
        search,
        searchField,
        sortField,
        order,
      }
    );

    const cachedOrders = await this.redisService.get(pattern);
    // if (cachedOrders) {
    //   return cachedOrders;
    // }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const orders = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.FindByReferenceId',
        { id, type, paginationDto }
      )
    );

    await this.redisService.set(pattern, orders, CACHE_TTL_SECONDS);
    return orders;
  }

  @Get(':id/room/stats')
  async getImagingOrderRoomStats(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.roomStats(CacheEntity.imagingOrders, id);
    const cachedStats = await this.redisService.get(pattern);
    // if (cachedStats) {
    //   return cachedStats;
    // }

    const room = await firstValueFrom(
      this.userService.send('room.get-by-id', { id })
    );
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.GetQueueStats', {
        id,
      })
    );

    await this.redisService.set(
      pattern,
      { ...room, queueStats: { ...stats[id] } },
      CACHE_TTL_SECONDS
    );
    return { ...room, queueStats: { ...stats[id] } };
  }

  @Get(':id/room/filter')
  @ApiOperation({ summary: 'Get imaging orders filtered by room ID' })
  @ApiResponse({
    status: 200,
    description: 'Filtered imaging orders by room ID',
  })
  @ApiQuery({ name: 'modalityId', required: false, type: String })
  @ApiQuery({ name: 'orderStatus', required: false, type: String })
  @ApiQuery({ name: 'procedureId', required: false, type: String })
  @ApiQuery({ name: 'bodyPart', required: false, type: String })
  @ApiQuery({ name: 'mrn', required: false, type: String })
  @ApiQuery({ name: 'patientFirstName', required: false, type: String })
  @ApiQuery({ name: 'patientLastName', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'id', required: true, type: String })
  async getImagingOrderFilterByRoomId(
    @Param('id') id: string,
    @Query('modalityId') modalityId?: string,
    @Query('orderStatus') orderStatus?: ImagingOrderStatus,
    @Query('procedureId') procedureId?: string,
    @Query('bodyPart') bodyPart?: string,
    @Query('mrn') mrn?: string,
    @Query('patientFirstName') patientFirstName?: string,
    @Query('patientLastName') patientLastName?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = cacheKeyBuilder.filterByRoomId(
      CacheEntity.imagingOrders,
      id,
      {
        modalityId,
        orderStatus,
        procedureId,
        bodyPart,
        mrn,
        patientFirstName,
        patientLastName,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        order,
      }
    );

    const cachedOrders = await this.redisService.get(pattern);
    // if (cachedOrders) {
    //   return cachedOrders;
    // }

    let startDateValue = startDate;
    let endDateValue = endDate;

    if (!startDateValue) startDateValue = new Date();
    if (!endDateValue) endDateValue = new Date();

    const ordersResponse = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FilterByRoomId', {
        roomId: id,
        modalityId,
        orderStatus,
        procedureId,
        bodyPart,
        startDate: startDateValue,
        endDate: endDateValue,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy,
        order,
      })
    );

    const orders = ordersResponse.data || [];
    const patientIds = orders
      .map((o: ImagingOrder) => {
        return o.imagingOrderForm?.patientId;
      })
      .filter(Boolean);

    let patients: Patient[] = [];
    if (patientIds.length > 0) {
      patients =
        (await firstValueFrom(
          this.patientService.send('PatientService.Patient.Filter', {
            patientIds,
            patientFirstName,
            patientLastName,
            patientCode: mrn,
          })
        )) || [];
    }

    const physicianIds = orders
      .map((o: ImagingOrder) => {
        return o?.imagingOrderForm?.orderingPhysicianId;
      })
      .filter(Boolean);

    let physicians: User[] = [];
    if (physicianIds.length > 0) {
      physicians =
        (await firstValueFrom(
          this.userService.send('UserService.Users.GetUsersByIds', {
            userIds: physicianIds,
          })
        )) || [];
    }

    const hasPatientFilter = Boolean(
      patientFirstName || patientLastName || mrn
    );

    if (hasPatientFilter && patients.length === 0) {
      return {
        ...ordersResponse,
        data: [],
        total: 0,
      };
    }

    const combined = orders.map((order: ImagingOrder) => {
      return {
        ...order,
        patient: patients.find(
          (p: Patient) => p.id === order.imagingOrderForm?.patientId
        ),
        orderPhysician: physicians.find(
          (u: User) => u.id === order.imagingOrderForm?.orderingPhysicianId
        ),
      };
    });

    const filteredOrders = hasPatientFilter
      ? combined.filter((orderWithPatient: FilteredOrder) =>
          Boolean(orderWithPatient.patient)
        )
      : combined;

    await this.redisService.set(
      pattern,
      {
        ...ordersResponse,
        data: filteredOrders,
        total: hasPatientFilter ? filteredOrders.length : ordersResponse.total,
      },
      CACHE_TTL_SECONDS
    );

    return {
      ...ordersResponse,
      data: filteredOrders,
      total: hasPatientFilter ? filteredOrders.length : ordersResponse.total,
    };
  }

  //get the room all time order stats
  @Get(':id/room-stats')
  @ApiOperation({ summary: 'Get room imaging order statistics' })
  @ApiResponse({ status: 200, description: 'Room imaging order statistics' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getRoomImagingOrderStats(@Param('id') id: string) {
    // console.log('GetQueueStats');
    const pattern = cacheKeyBuilder.roomStats2(CacheEntity.imagingOrders, id);
    const cachedStats = await this.redisService.get(pattern);
    // if (cachedStats) {
    //   return cachedStats;
    // }
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.GetQueueStats', {
        id,
      })
    );
    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);
    return stats;
  }

  //get the room's in date order stats
  @Get(':id/room-stats-in-date')
  @ApiOperation({ summary: 'Get room imaging order statistics in date range' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getRoomImagingOrderStatsInDate(
    @Param('id') id: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const pattern = cacheKeyBuilder.roomStatsInDateRange(
      CacheEntity.imagingOrders,
      {
        id,
        startDate,
        endDate,
      }
    );

    const cachedStats = await this.redisService.get(pattern);
    // if (cachedStats) {
    //   return cachedStats;
    // }
    // Ensure dates are properly parsed - NestJS query params come as strings
    const parsedStartDate = startDate ? new Date(startDate as any) : undefined;
    const parsedEndDate = endDate ? new Date(endDate as any) : undefined;

    const stats = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.GetQueueStatsInDate',
        {
          id,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        }
      )
    );

    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);
    return stats;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get imaging order by ID' })
  @ApiResponse({ status: 200, description: 'Imaging order details by ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getImagingOrder(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.id(CacheEntity.imagingOrders, id);
    const cachedOrder = await this.redisService.get(pattern);
    // if (cachedOrder) {
    //   return cachedOrder;
    // }
    const order = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindOne', { id })
    );
    await this.redisService.set(pattern, order, CACHE_TTL_SECONDS);
    return order;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an imaging order' })
  @ApiResponse({
    status: 200,
    description: 'The imaging order has been updated.',
  })
  @ApiBody({
    description: 'Imaging order update payload',
    type: UpdateImagingOrderDto,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async updateImagingOrder(
    @Param('id') id: string,
    @Body() updateImagingOrderDto: UpdateImagingOrderDto
  ) {
    const pattern = cacheKeyBuilder.id(CacheEntity.imagingOrders, id);

    const updatedOrder = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Update', {
        id,
        updateImagingOrderDto,
      })
    );

    await this.uncacheImagingOrders(id);

    await this.redisService.set(pattern, updatedOrder, CACHE_TTL_SECONDS);

    return updatedOrder;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an imaging order' })
  @ApiResponse({
    status: 200,
    description: 'The imaging order has been deleted.',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async deleteImagingOrder(@Param('id') id: string) {
    const order = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Delete', { id })
    );
    await this.uncacheImagingOrders(id);

    return order;
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get imaging orders by patient ID' })
  @ApiResponse({ status: 200, description: 'Imaging orders by patient ID' })
  @ApiParam({ name: 'patientId', required: true, type: String })
  async getImagingOrdersByPatientId(@Param('patientId') patientId: string) {
    const pattern = cacheKeyBuilder.byPatientId(
      CacheEntity.imagingOrders,
      patientId
    );
    const cachedOrders = await this.redisService.get(pattern);
    // if (cachedOrders) {
    //   return cachedOrders;
    // }
    const orders = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindByPatientId', {
        patientId,
      })
    );
    await this.redisService.set(pattern, orders, CACHE_TTL_SECONDS);
    return orders;
  }
}
