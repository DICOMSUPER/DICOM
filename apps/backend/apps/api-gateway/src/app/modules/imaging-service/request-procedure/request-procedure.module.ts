import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { RequestProcedureController } from './request-procedure.controller';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.IMAGE_SERVICE_NAME || 'ImagingService',
        Number(process.env.IMAGE_SERVICE_TRANSPORT || Transport.TCP),
        process.env.IMAGE_SERVICE_HOST || 'localhost',
        Number(process.env.IMAGE_SERVICE_PORT || 5003)
      ),
    ]),
    SharedInterceptorModule
  ],
  controllers: [RequestProcedureController],
})
export class RequestProcedureModule {}
