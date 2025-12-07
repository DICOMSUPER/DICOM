import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConnectionGateway } from '../connection/connection.gateway';

@Controller()
export class NotificationController {
  private readonly logger = new Logger('NotificationController');

  constructor(private readonly notificationGateway: ConnectionGateway) {}

  @EventPattern('WebSocketService.Notification.Push')
  async handleNotificationPush(
    @Payload() data: { userId: string; notification: any }
  ) {
    this.logger.log(`Received notification push for user ${data.userId}`);
    this.logger.debug('Notification data', { notification: data.notification });

    this.notificationGateway.sendNotificationToUser(
      data.userId,
      data.notification
    );
  }
}
