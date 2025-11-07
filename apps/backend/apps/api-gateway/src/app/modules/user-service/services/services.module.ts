import { Module } from '@nestjs/common';

import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { ServicesController } from './services.controller';

@Module({
  imports: [UserServiceClientModule, SharedInterceptorModule],
  controllers: [ServicesController],
})
export class ServicesModule {}
