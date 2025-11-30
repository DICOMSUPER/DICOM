import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { ConnectionModule } from '../connection/connection.module';

@Module({
  imports: [ConnectionModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
