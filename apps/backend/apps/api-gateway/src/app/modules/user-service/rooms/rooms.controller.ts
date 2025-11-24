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
  Search,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { CreateRoomDto, Room } from '@backend/shared-domain';
import { UpdateRoomDto } from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@ApiTags('Room Management')
@Controller('rooms')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RoomsController {
  private readonly logger = new Logger('RoomsController');

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly roomClient: ClientProxy,
    @Inject(process.env.patientClient || 'PATIENT_SERVICE')
    private readonly patientClient: ClientProxy
  ) {}

  // 🩺 Kiểm tra tình trạng service

  @Get('health')
  @ApiOperation({ summary: 'Check Room service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.roomClient.send('room.check-health', {})
      );

      return {
        ...result,
        message: 'Room service đang hoạt động',
      };
    } catch (error) {
      this.logger.error('❌ Room health check failed', error);
      throw handleError(error);
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng thành công' })
  async getAllRooms(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('departmentId') departmentId?: string
  ) {
    try {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;

      this.logger.log(`Fetching rooms - Page: ${pageNum}, Limit: ${limitNum}`);

      const result = await firstValueFrom(
        this.roomClient.send('room.get-all', {
          page: pageNum,
          limit: limitNum,
          search,
          status,
          type,
          departmentId,
        })
      );

      this.logger.log(
        `Retrieved ${result?.data?.length || 0} rooms (Total: ${
          result?.total || 0
        })`
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch rooms', error);
      throw handleError(error);
    }
  }

  @Post()
  @Role(Roles.SYSTEM_ADMIN)
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Req() req: Request) {
    const token = req.cookies?.token;
    this.logger.log(`🏗️ Creating room: ${createRoomDto.roomCode} with token`);

    const result = await firstValueFrom(
      this.roomClient.send('room.create', { ...createRoomDto, token })
    );

    return {
      room: result.room,
      message: result.message || 'Tạo phòng thành công',
    };
  }

  @Role(Roles.SYSTEM_ADMIN, Roles.RECEPTION_STAFF, Roles.PHYSICIAN)
  @Get(':id/department')
  @ApiOperation({ summary: 'Get rooms by departmentID' })
  @ApiParam({ name: 'id', description: 'department ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng theo department thành công',
  })
  async getRoomByDepartmentId(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('applyScheduleFilter') applyScheduleFilter?: boolean,
    @Query('role') role?: Roles
  ) {
    try {
      const rooms = await firstValueFrom(
        this.roomClient.send('UserService.Room.GetRoomByDepartmentId', {
          id,
          applyScheduleFilter,
          search: search || '',
          role: role,
        })
      );

      const roomIds = rooms.map((r: Room) => {
        return r.id;
      });

      const queueStats = await firstValueFrom(
        this.patientClient.send(
          'PatientService.QueueAssignment.GetQueueStatusByRooms',
          { roomIds }
        )
      );

      const combinedRooms = rooms.map((r: Room) => {
        return { ...r, queueStats: queueStats[r.id] || null };
      });

      return combinedRooms;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Role(Roles.RECEPTION_STAFF, Roles.SYSTEM_ADMIN)
  @Get('by-department-and-service')
  @ApiOperation({ summary: 'Get rooms by Department ID' })
  @ApiQuery({ name: 'departmentId', description: 'Department ID' })
  @ApiQuery({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng theo khoa thành công',
  })
  async getRoomByDepartmentAndServiceId(
    @Query('serviceId') serviceId: string,
    @Query('departmentId') departmentId: string,
    @Query('role') role?: Roles
  ) {
    try {
      const rooms = await firstValueFrom(
        this.roomClient.send(
          'UserService.Room.GetRoomsByDepartmentAndServiceId',
          { serviceId, departmentId, role }
        )
      );

      const roomItems = rooms.map((room: Room) => {
        return {
          roomId: room.id,
          serviceRoomIds: room.serviceRooms.map((roomService) => {
            return roomService.id;
          }),
        };
      });

      // console.log('rooomIt:', roomItems);

      const roomStats = await firstValueFrom(
        this.patientClient.send(
          'PatientService.Encounter.GetEncounterStatsFromRoomIds',
          roomItems
        )
      );

      // console.log('roomStats: ', roomStats);
      const combined = rooms.map((room: Room) => {
        return { ...room, roomStats: roomStats[room.id] };
      });

      return combined;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Role(Roles.SYSTEM_ADMIN, Roles.RECEPTION_STAFF, Roles.PHYSICIAN)
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin phòng thành công' })
  async getRoomById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching room by ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.get-by-id', { id })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get room by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Cập nhật phòng thành công' })
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto
  ) {
    try {
      this.logger.log(`🛠️ Updating room ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.update', { id, updateRoomDto })
      );

      return {
        room: result.room,
        message: result.message || 'Cập nhật phòng thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update room ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Xóa phòng thành công' })
  async deleteRoom(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting room ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.delete', { id })
      );

      return {
        message: result.message || 'Xóa phòng thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete room ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Public()
  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get rooms by Department ID' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng theo khoa thành công',
  })
  async getRoomsByDepartmentId(@Param('departmentId') departmentId: string) {
    try {
      this.logger.log(`Fetching rooms for department ID: ${departmentId}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.get-by-department-id', {
          departmentId,
        })
      );

      return {
        data: result.data,
        message: 'Lấy danh sách phòng theo khoa thành công',
      };
    } catch (error) {
      this.logger.error(
        ` Failed to fetch rooms for department ID: ${departmentId}`,
        error
      );
      throw handleError(error);
    }
  }
}
