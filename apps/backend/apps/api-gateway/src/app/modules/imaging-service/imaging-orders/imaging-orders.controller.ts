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

type FilteredOrder = Partial<ImagingOrder> & {
  patient: Patient;
  orderingPhysician: User;
};

@Controller('imaging-orders')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingOrdersController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Post()
  async createImagingOrder(@Body() createImagingOrderDto: any) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.Create',
        createImagingOrderDto
      )
    );
  }

  @Get()
  async getAllImagingOrders() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindAll', {})
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('reference/:id')
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
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.FindByReferenceId',
        { id, type, paginationDto }
      )
    );
  }

  @Get(':id/room/stats')
  async getImagingOrderRoomStats(@Param('id') id: string) {
    const room = await firstValueFrom(
      this.userService.send('room.get-by-id', { id })
    );
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.GetQueueStats', {
        id,
      })
    );
    return { ...room, queueStats: { ...stats[id] } };
  }

  @Get(':id/room/filter')
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
    const patientIds = orders.map((o: ImagingOrder) => {
      return o.imagingOrderForm?.patientId;
    }).filter(Boolean);

    let patients: Patient[] = [];
    if (patientIds.length > 0) {
      patients = await firstValueFrom(
        this.patientService.send('PatientService.Patient.Filter', {
          patientIds,
          patientFirstName,
          patientLastName,
          patientCode: mrn,
        })
      ) || [];
    }

    const physicianIds = orders.map((o: ImagingOrder) => {
      return o?.imagingOrderForm?.orderingPhysicianId;
    }).filter(Boolean);

    let physicians: User[] = [];
    if (physicianIds.length > 0) {
      physicians = await firstValueFrom(
        this.userService.send('UserService.Users.GetUsersByIds', {
          userIds: physicianIds,
        })
      ) || [];
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

    return {
      ...ordersResponse,
      data: filteredOrders,
      total: hasPatientFilter ? filteredOrders.length : ordersResponse.total,
    };
  }

  //get the room all time order stats
  @Get(':id/room-stats')
  async getRoomImagingOrderStats(@Param('id') id: string) {
    // console.log('GetQueueStats');
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.GetQueueStats', {
        id,
      })
    );
    return stats;
  }

  //get the room's in date order stats
  @Get(':id/room-stats-in-date')
  async getRoomImagingOrderStatsInDate(
    @Param('id') id: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const stats = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.GetQueueStatsInDate',
        {
          id,
          startDate,
          endDate,
        }
      )
    );

    return stats;
  }

  @Get(':id')
  async getImagingOrder(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindOne', { id })
    );
  }

  @Patch(':id')
  async updateImagingOrder(
    @Param('id') id: string,
    @Body() updateImagingOrderDto: UpdateImagingOrderDto
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Update', {
        id,
        updateImagingOrderDto,
      })
    );
  }

  @Delete(':id')
  async deleteImagingOrder(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Delete', { id })
    );
  }

  @Get('patient/:patientId')
  async getImagingOrdersByPatientId(@Param('patientId') patientId: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindByPatientId', {
        patientId,
      })
    );
  }
}
