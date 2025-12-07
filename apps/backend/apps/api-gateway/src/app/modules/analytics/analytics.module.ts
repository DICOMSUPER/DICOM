import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  UserServiceClientModule,
  PatientServiceClientModule,
  ImagingServiceClientModule,
} from '@backend/shared-client';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    UserServiceClientModule,
    PatientServiceClientModule,
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
