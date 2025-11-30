import { PaginationService } from '@backend/database';
import { SocketServiceClientModule } from '@backend/shared-client';
import { Notification } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET || 'your-secret-key',
    //   signOptions: { expiresIn: '24h' },
    // }),
    SocketServiceClientModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PaginationService,
  ],
})
export class NotificationsModule {}
