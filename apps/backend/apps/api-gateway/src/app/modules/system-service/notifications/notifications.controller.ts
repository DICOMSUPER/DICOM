import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  CreateNotificationDto, 
  FilterNotificationDto, 
  UpdateNotificationDto 
} from '@backend/shared-domain';
import { RequestLoggingInterceptor, TransformInterceptor } from '@backend/shared-interceptor';

@Controller('notifications')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class NotificationsController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}
  
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.systemService.send('notification.create', createNotificationDto);
  }

  @Get()
  async findAll(@Query() filter: FilterNotificationDto) {
    return this.systemService.send('notification.findAll', filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('notification.findOne', { id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return this.systemService.send('notification.update', { id, updateNotificationDto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('notification.remove', { id });
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.systemService.send('notification.markAsRead', { id });
  }

  @Put('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.systemService.send('notification.markAllAsRead', { userId });
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Query() filter: FilterNotificationDto) {
    return this.systemService.send('notification.findAll', { ...filter, userId });
  }
}