import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  FilterNotificationDto,
  UpdateNotificationDto,
  Notification,
} from '@backend/shared-domain';
import { PaginatedResponseDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notification.create')
  async create(
    @Payload() createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    try {
      return this.notificationsService.create(createNotificationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create notification',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.findAll')
  async findAll(
    @Payload() filter: FilterNotificationDto
  ): Promise<PaginatedResponseDto<Notification>> {
    try {
      return this.notificationsService.findAll(filter);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find notifications',
        'SystemService'
      );
    }
  }

  // find all
  @MessagePattern('notification.findMany')
  async findMany(
    @Payload() data: { filter: FilterNotificationDto; userId: string }
  ): Promise<Notification[]> {
    try {
      return this.notificationsService.findMany(data.filter, data.userId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find notifications',
        'SystemService'
      );
    }
  }
  @MessagePattern('notification.getUnreadCount')
  async getUnreadCount(@Payload() data: { userId: string }): Promise<number> {
    try {
      return this.notificationsService.getUnreadCount(data.userId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get unread notification count',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.findOne')
  async findOne(@Payload() data: { id: string }): Promise<Notification> {
    try {
      return this.notificationsService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find notification',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.update')
  async update(
    @Payload()
    data: {
      id: string;
      updateNotificationDto: UpdateNotificationDto;
    }
  ): Promise<Notification> {
    try {
      return this.notificationsService.update(
        data.id,
        data.updateNotificationDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update notification',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.remove')
  async remove(@Payload() data: { id: string }): Promise<Notification> {
    try {
      return this.notificationsService.remove(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to remove notification',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.markAsRead')
  async markAsRead(@Payload() data: { id: string }): Promise<Notification> {
    try {
      return this.notificationsService.markAsRead(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to mark notification as read',
        'SystemService'
      );
    }
  }

  @MessagePattern('notification.markAllAsRead')
  async markAllAsRead(@Payload() data: { userId: string }): Promise<boolean> {
    return this.notificationsService.markAllAsRead(data.userId);
  }
}
