import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  UserServiceClientModule,
  PatientServiceClientModule,
} from '@backend/shared-client';

@Module({
  imports: [
    UserServiceClientModule,
    PatientServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

