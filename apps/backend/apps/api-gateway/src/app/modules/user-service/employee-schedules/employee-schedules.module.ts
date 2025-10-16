import { Module } from '@nestjs/common';
import { EmployeeSchedulesController } from './employee-schedules.controller';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [EmployeeSchedulesController],
  exports: [UserServiceClientModule],
})
export class EmployeeSchedulesModule {}
