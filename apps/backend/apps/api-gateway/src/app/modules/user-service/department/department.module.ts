import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { DepartmentsController } from './departments.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule
  
  ],
  controllers: [DepartmentsController],
  exports: [UserServiceClientModule],
})
export class DepartmentModule {}
