import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { SystemServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [SystemServiceClientModule, SharedInterceptorModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}