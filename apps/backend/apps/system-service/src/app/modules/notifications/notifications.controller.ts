import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { 
  CreateNotificationDto, 
  FilterNotificationDto, 
  UpdateNotificationDto,
  Notification
} from '@backend/shared-domain';
import { PaginatedResponseDto } from '@backend/database';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notification.create')
  async create(@Payload() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern('notification.findAll')
  async findAll(@Payload() filter: FilterNotificationDto): Promise<PaginatedResponseDto<Notification>> {
    return this.notificationsService.findAll(filter);
  }

  @MessagePattern('notification.findOne')
  async findOne(@Payload() data: { id: string }): Promise<Notification> {
    return this.notificationsService.findOne(data.id);
  }

  @MessagePattern('notification.update')
  async update(@Payload() data: { id: string; updateNotificationDto: UpdateNotificationDto }): Promise<Notification> {
    return this.notificationsService.update(data.id, data.updateNotificationDto);
  }

  @MessagePattern('notification.remove')
  async remove(@Payload() data: { id: string }): Promise<void> {
    return this.notificationsService.remove(data.id);
  }

  @MessagePattern('notification.markAsRead')
  async markAsRead(@Payload() data: { id: string }): Promise<Notification> {
    return this.notificationsService.markAsRead(data.id);
  }

  @MessagePattern('notification.markAllAsRead')
  async markAllAsRead(@Payload() data: { userId: string }): Promise<void> {
    return this.notificationsService.markAllAsRead(data.userId);
  }
}
