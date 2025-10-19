import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { ShiftTemplatesController } from './shift-templates.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule
  ],
  controllers: [ShiftTemplatesController],
  exports: [UserServiceClientModule],
})
export class ShiftTemplatesModule {}

