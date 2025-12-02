import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConnectionGateway } from '../connection/connection.gateway';

@Controller()
export class NotificationController {
  constructor(private readonly notificationGateway: ConnectionGateway) {}

  @EventPattern('WebSocketService.Notification.Push')
  async handleNotificationPush(
    @Payload() data: { userId: string; notification: any }
  ) {
    console.log('user id socket', data.userId);
    console.log('notification data socket', data.notification);

    this.notificationGateway.sendNotificationToUser(
      data.userId,
      data.notification
    );
  }
}
