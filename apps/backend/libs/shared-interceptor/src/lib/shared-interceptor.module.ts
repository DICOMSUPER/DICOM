import { Module } from '@nestjs/common';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { TransformInterceptor } from './tranform.interceptor';
import { LoggingService } from './service/logging.service';

@Module({
  providers: [
    LoggingService,
  ],
  exports: [
    LoggingService,
  ],
})
export class SharedInterceptorModule {}
