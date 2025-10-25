import { Module } from '@nestjs/common';
import { RequestProcedureController } from './request-procedure.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [RequestProcedureController],
})
export class RequestProcedureModule {}
