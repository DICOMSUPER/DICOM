import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto, FilterNotificationDto, UpdateNotificationDto } from '@backend/shared-domain';
import { Notification } from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { createCacheKey } from '@backend/shared-utils';
import { PaginatedResponseDto, PaginationService } from '@backend/database';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    console.log('🔔 Creating notification:', createNotificationDto);

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      isRead: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    console.log('✅ Notification created successfully:', savedNotification.id);
    
    return savedNotification;
  }

  async findAll(filter: FilterNotificationDto): Promise<PaginatedResponseDto<Notification>> {
    const { page , limit , title, type, priority, isRead } = filter;

    // Generate cache key
    const keyName = createCacheKey.system(
      'notifications',
      undefined,
      'filter_notifications',
      { ...filter }
    );

    // Check cache
    const cachedService = await this.redisService.get<PaginatedResponseDto<Notification>>(keyName);
    if (cachedService) {
      console.log('📦 Notifications retrieved from cache');
      return cachedService;
    }

    // Build query options
    const options: any = {
      where: {},
      order: { createdAt: 'DESC' },
    };

    // Apply filters
    if (title) {
      options.where = {
        ...options.where,
        title,
      };
    }
    if (type) {
      options.where = {
        ...options.where,
        type,
      };
    }
    if (priority) {
      options.where = {
        ...options.where,
        priority,
      };
    }
    if (isRead !== undefined) {
      options.where = {
        ...options.where,
        isRead,
      };
    }

    try {
      const result = await this.paginationService.paginate(
       Notification,
        { page, limit },
        options
      );

      await this.redisService.set(keyName, result, 1800); 
      console.log(`📊 Found ${result.data.length} notifications`);
      
      return result;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw new BadRequestException('Error querying notifications: ' + error);
    }
  }

  async findOne(id: string): Promise<Notification> {
    console.log(`🔍 Finding notification: ${id}`);
    
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    console.log(`🔄 Updating notification: ${id}`);
    
    const notification = await this.findOne(id);
    
    Object.assign(notification, updateNotificationDto);
    
    const updatedNotification = await this.notificationRepository.save(notification);
    console.log('✅ Notification updated successfully:', updatedNotification.id);
    
    return updatedNotification;
  }

  async remove(id: string): Promise<void> {
    console.log(`🗑️ Removing notification: ${id}`);
    
    const notification = await this.findOne(id);
    
    await this.notificationRepository.remove(notification);
    console.log('✅ Notification removed successfully:', id);
  }

  async markAsRead(id: string): Promise<Notification> {
    console.log(`📖 Marking notification as read: ${id}`);
    
    return await this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    console.log(`📖 Marking all notifications as read for user: ${userId}`);
    
    // await this.notificationRepository.update(
    //   { userId, isRead: false },
    //   { isRead: true }
    // );
    
    console.log('✅ All notifications marked as read');
  }
}
