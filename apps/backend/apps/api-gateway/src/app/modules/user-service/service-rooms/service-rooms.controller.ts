import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  UseInterceptors,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Public, Role } from '@backend/shared-decorators';
import {
  CreateServiceRoomDto,
  UpdateServiceRoomDto,
  FilterServiceRoomDto,
} from '@backend/shared-domain';

@ApiTags('Service Rooms')
@Controller('service-rooms')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ServiceRoomsController {
  private readonly logger = new Logger('ServiceRoomsController');

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userServiceClient: ClientProxy
  ) {}

  @Post()
  // @Role(Roles.SYSTEM_ADMIN)
  @Public()
  @ApiOperation({ summary: 'Create service room assignment' })
  @ApiBody({ type: CreateServiceRoomDto })
  @ApiResponse({
    status: 201,
    description: 'Gán dịch vụ vào phòng thành công',
  })
  async create(@Body() createServiceRoomDto: CreateServiceRoomDto) {
    this.logger.log('🏗️ Creating service room assignment');
    console.log('create service room dto', createServiceRoomDto);
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.ServiceRooms.Create',
        createServiceRoomDto
      )
    );
  }

  @Get('paginated')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @Public()
  @ApiOperation({ summary: 'Get all service room assignments' })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    description: 'Filter by service ID',
  })
  @ApiQuery({
    name: 'serviceName',
    required: false,
    description: 'Filter by service name',
  })
  @ApiQuery({
    name: 'roomId',
    required: false,
    description: 'Filter by room ID',
  })
  @ApiQuery({
    name: 'roomName',
    required: false,
    description: 'Filter by room name',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách gán dịch vụ phòng thành công',
  })
  async findAll(@Query() filter: FilterServiceRoomDto) {
    try {
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.ServiceRooms.FindAll', filter)
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch service room assignments', error);
      throw handleError(error);
    }
  }
  @Get()
  @Public()
  async findAllWithoutPagination(@Query() filter: FilterServiceRoomDto) {
    try {
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.ServiceRooms.FindAllWithoutPagination',
          filter
        )
      );

      return result;
    } catch (error) {
      this.logger.error(
        '❌ Failed to fetch service room assignments without pagination',
        error
      );
      throw handleError(error);
    }
  }

  @Get('service/:serviceId')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get rooms by service ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng theo dịch vụ thành công',
  })
  async findByService(@Param('serviceId') serviceId: string) {
    try {
      this.logger.log(`📋 Fetching rooms for service: ${serviceId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.ServiceRooms.FindByService',
          serviceId
        )
      );

      return {
        data: result,
        count: result.length,
        message: 'Lấy danh sách phòng theo dịch vụ thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch rooms for service: ${serviceId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('room/:roomId')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get services by room ID' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách dịch vụ theo phòng thành công',
  })
  async findByRoom(@Param('roomId') roomId: string) {
    try {
      this.logger.log(`📋 Fetching services for room: ${roomId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.ServiceRooms.FindByRoom',
          {roomId}
        )
      );

      console.log("anh sapper room service", result);
      

      return result
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch services for room: ${roomId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get service room assignment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê gán dịch vụ phòng thành công',
  })
  async getStats() {
    try {
      this.logger.log('📊 Fetching service room assignment stats');
      return await firstValueFrom(
        this.userServiceClient.send('UserService.ServiceRooms.GetStats', {})
      );
    } catch (error) {
      this.logger.error('❌ Failed to fetch service room assignment stats', error);
      throw handleError(error);
    }
  }

  @Get(':id')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get service room assignment by ID' })
  @ApiParam({ name: 'id', description: 'Service room assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin gán dịch vụ phòng thành công',
  })
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching service room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.ServiceRooms.FindOne', id)
      );

      return {
        data: result,
        message: 'Lấy thông tin gán dịch vụ phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch service room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }

  @Put(':id')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update service room assignment' })
  @ApiParam({ name: 'id', description: 'Service room assignment ID' })
  @ApiBody({ type: UpdateServiceRoomDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật gán dịch vụ phòng thành công',
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceRoomDto: UpdateServiceRoomDto
  ) {
    try {
      this.logger.log(`🛠️ Updating service room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.ServiceRooms.Update', {
          id,
          updatedData: updateServiceRoomDto,
        })
      );

      return {
        data: result,
        message: 'Cập nhật gán dịch vụ phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to update service room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }

  @Delete(':id')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete service room assignment' })
  @ApiParam({ name: 'id', description: 'Service room assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Xóa gán dịch vụ phòng thành công',
  })
  async delete(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting service room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.ServiceRooms.Delete', id)
      );

      return {
        message: result.message || 'Xóa gán dịch vụ phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to delete service room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }
}
