import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@backend/shared-guards';
import { RoleGuard } from '@backend/shared-guards';
import { NotificationModule } from './notification/notification.module';
import { ConnectionModule } from './connection/connection.module';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    NotificationModule,
    ConnectionModule,
    UserServiceClientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
