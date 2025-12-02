import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  UserServiceClientModule,
  PatientServiceClientModule,
  ImagingServiceClientModule,
} from '@backend/shared-client';

@Module({
  imports: [
    UserServiceClientModule,
    PatientServiceClientModule,
    ImagingServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

