import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { SystemServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [SystemServiceClientModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}