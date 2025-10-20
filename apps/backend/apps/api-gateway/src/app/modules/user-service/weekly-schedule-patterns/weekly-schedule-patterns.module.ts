import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { WeeklySchedulePatternsController } from './weekly-schedule-patterns.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule
  
  ],
  controllers: [WeeklySchedulePatternsController],
  exports: [UserServiceClientModule],
})
export class WeeklySchedulePatternsModule {}
