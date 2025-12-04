import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateNotificationDto,
  FilterNotificationDto,
  UpdateNotificationDto,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import type { IAuthenticatedRequest } from 'libs/shared-interfaces/src';

@Controller('notifications')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class NotificationsController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.systemService.send(
      'notification.create',
      createNotificationDto
    );
  }

  @Get()
  async findAll(@Query() filter: FilterNotificationDto) {
    return this.systemService.send('notification.findAll', filter);
  }

  // without pagination
  @Get('/findMany')
  @Role(
    Roles.PHYSICIAN,
    Roles.RECEPTION_STAFF,
    Roles.RADIOLOGIST,
    Roles.IMAGING_TECHNICIAN,
    Roles.SYSTEM_ADMIN
  )
  async findMany(
    @Query() filter: FilterNotificationDto,
    @Req() req: IAuthenticatedRequest
  ) {
    return this.systemService.send('notification.findMany', {
      filter,
      userId: req.userInfo.userId,
    });
  }
  @Get('/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.systemService.send('notification.getUnreadCount', { userId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('notification.findOne', { id });
  }
  @Patch('/read-all')
  async markAllAsRead(@Req() req: IAuthenticatedRequest) {
    try {
      return this.systemService.send('notification.markAllAsRead', {
        userId: req.userInfo.userId,
      });
    } catch (error) {
      console.log('Error reading all', error);
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return this.systemService.send('notification.update', {
      id,
      updateNotificationDto,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('notification.remove', { id });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.systemService.send('notification.markAsRead', { id });
  }

  // unread count
}
