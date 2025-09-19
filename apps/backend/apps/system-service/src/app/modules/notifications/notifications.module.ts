import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    // Add any necessary imports here
    TypeOrmModule.forFeature([
      // Add your entities here
      Notification
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
