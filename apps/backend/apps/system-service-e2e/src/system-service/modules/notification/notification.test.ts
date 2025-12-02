import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateNotificationDto,
  FilterNotificationDto,
  Notification,
} from '@backend/shared-domain';
import {
  NotificationPriority,
  NotificationType,
  RelatedEntityType,
} from 'libs/shared-enums/src';
import { PaginatedResponseDto } from '@backend/database';

export function runNotificationE2ETests(port = 5005, host = 'localhost') {
  describe('NotificationController (e2e)', () => {
    let client: ClientProxy;
    let userClient: ClientProxy;
    let createdId: string;
    const TEST_USER_ID = `34f28329-a994-4992-a91d-d8943963ed39`;
    const TEST_SENDER_ID = `3e84b0cc-5bf7-4d15-ae62-9e54eac9d115`;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
      userClient = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port: 5002 },
      });
    });

    afterAll(async () => {
      await client.close();
      await userClient.close();
    });

    it('should create a notification', async () => {
      const payload: CreateNotificationDto = {
        recipientId: TEST_USER_ID,
        senderId: TEST_SENDER_ID,
        notificationType: NotificationType.ASSIGNMENT,
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: NotificationPriority.LOW,
        relatedEntityId: '00739194-60dc-4a7a-83ee-52f0c06ef698',
        relatedEntityType: RelatedEntityType.ORDER,
        isRead: false,
      };

      const result = await firstValueFrom(
        client.send<Notification>('notification.create', payload)
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Notification');
      createdId = result.id;
    });

    it('should find all notifications (paginated)', async () => {
      const filter: FilterNotificationDto = { page: 1, limit: 10 };
      const result = await firstValueFrom(
        client.send<PaginatedResponseDto<Notification>>(
          'notification.findAll',
          filter
        )
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should find many notifications for user', async () => {
      const filter: FilterNotificationDto = {};
      const result = await firstValueFrom(
        client.send<Notification[]>('notification.findMany', {
          filter,
          userId: TEST_USER_ID,
        })
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.some((n) => n.id === createdId)).toBe(true);
    });

    it('should get unread count', async () => {
      const result = await firstValueFrom(
        client.send<number>('notification.getUnreadCount', {
          userId: TEST_USER_ID,
        })
      );
      expect(typeof result).toBe('number');
    });

    it('should find one notification by id', async () => {
      const result = await firstValueFrom(
        client.send<Notification>('notification.findOne', { id: createdId })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdId);
    });

    it('should update notification', async () => {
      const updatePayload = {
        id: createdId,
        updateNotificationDto: {
          title: 'Updated Notification',
          isRead: true,
        },
      };
      const result = await firstValueFrom(
        client.send<Notification>('notification.update', updatePayload)
      );
      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Notification');
      expect(result.isRead).toBe(true);
    });

    it('should mark notification as read', async () => {
      const result = await firstValueFrom(
        client.send<Notification>('notification.markAsRead', { id: createdId })
      );
      expect(result).toBeDefined();
      expect(result.isRead).toBe(true);
    });

    // it('should mark all as read for user', async () => {
    //   const result = await firstValueFrom(
    //     client.send('notification.markAllAsRead', {
    //       userId: TEST_USER_ID,
    //     })
    //   );
    //   console.log("mark all notification", result);
    //   expect(result).toBeDefined();
    // });

    it('should soft delete notification', async () => {
      
      const result = await firstValueFrom(
        client.send('notification.remove', { id: createdId })
      );
      expect(result).toBeDefined();
      expect(result.isDeleted).toBe(true);
    });
  });
}
