import { Module } from '@nestjs/common';

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
