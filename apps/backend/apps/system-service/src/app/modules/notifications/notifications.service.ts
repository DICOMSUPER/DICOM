import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { RedisService } from '@backend/redis';
import {
  CreateNotificationDto,
  FilterNotificationDto,
  Notification,
  UpdateNotificationDto,
} from '@backend/shared-domain';
import { createCacheKey } from '@backend/shared-utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { NotificationGateway } from './notification.gateway';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService,
    @Inject('WEBSOCKET_SERVICE')
    private readonly websocketService: ClientProxy
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    console.log('Creating notification:', createNotificationDto);

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
    });

    const savedNotification = await this.notificationRepository.save(
      notification
    );
    // Emit notification to connected clients
    try {
      // emit trả về Observable. Dùng lastValueFrom để đợi nó gửi xong (hoặc bắt lỗi)
      // Lưu ý: emit là fire-and-forget, nhưng await giúp ta biết nếu kết nối TCP bị lỗi (ECONNREFUSED)
      this.websocketService
        .emit('WebSocketService.Notification.Push', {
          userId: savedNotification.recipientId,
          notification: savedNotification,
        })
        .pipe(timeout(5000)) // (Tuỳ chọn) timeout nếu service bên kia chết
        .subscribe({
          next: () => console.log('Notification event emitted successfully'),
          error: (err) => console.error('Failed to emit notification', err),
        });
    } catch (error) {
      // Không throw error ở đây để tránh rollback DB nếu chỉ lỗi gửi socket
      console.error('Error emitting socket event:', error);
    }
    console.log('Notification created successfully:', savedNotification.id);

    return savedNotification;
  }

  // notification when new encounter
  // async notifyNewAppointment(
  //   physician: User,
  //   encounter: PatientEncounter,
  //   patient: User
  // ): Promise<void> {
  //   const title = 'New Appointment Request';
  //   const message = `You have a new appointment request from ${
  //     patient.first_name
  //   } ${patient.last_name} for ${format(
  //     new Date(encounter.booking_time),
  //     'MMM dd, yyyy HH:mm'
  //   )}`;
  //   await this.createNotification(
  //     physician.id,
  //     NotificationType.NEW_APPOINTMENT,
  //     title,
  //     message,
  //     encounter.id,
  //     {
  //       patientName: `${patient.first_name} ${patient.last_name}`,
  //       patientEmail: patient.email,
  //       bookingTime: appointment.booking_time,
  //       appointmentType: appointment.appointment_type,
  //     }
  //   );
  // }

  async findAll(
    filter: FilterNotificationDto
  ): Promise<PaginatedResponseDto<Notification>> {
    const { page, limit, title, type, priority, isRead } = filter;

    // Generate cache key
    const keyName = createCacheKey.system(
      'notifications',
      undefined,
      'filter_notifications',
      { ...filter }
    );

    // Check cache
    const cachedService = await this.redisService.get<
      PaginatedResponseDto<Notification>
    >(keyName);
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

  async findMany(
    filter: FilterNotificationDto,
    userId: string
  ): Promise<Notification[]> {
    console.log(
      `🔍 Finding notifications for user: ${userId} with filter:`,
      filter
    );
    const { title, type, priority, isRead } = filter;
    const options: any = {
      where: {
        recipientId: userId,
      },
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
    const notifications = await this.notificationRepository.find(options);
    console.log(
      `Found ${notifications.length} notifications for user: ${userId}`
    );
    return notifications;
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

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    console.log(`🔄 Updating notification: ${id}`);

    const notification = await this.findOne(id);

    Object.assign(notification, updateNotificationDto);

    const updatedNotification = await this.notificationRepository.save(
      notification
    );
    console.log(
      '✅ Notification updated successfully:',
      updatedNotification.id
    );

    return updatedNotification;
  }

  async remove(id: string): Promise<void> {
    console.log(` Removing notification: ${id}`);

    const notification = await this.findOne(id);

    await this.notificationRepository.remove(notification);
    console.log('Notification removed successfully:', id);
  }

  async markAsRead(id: string): Promise<Notification> {
    console.log(`Marking notification as read: ${id}`);
    return await this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    console.log(`📖 Marking all notifications as read for user: ${userId}`);

    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    console.log('All notifications marked as read');
  }
  async getUnreadCount(userId: string): Promise<number> {
    console.log(`Counting unread notifications for user: ${userId}`);
    const count = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
    console.log(`User ${userId} has ${count} unread notifications`);
    return count;
  }
}
