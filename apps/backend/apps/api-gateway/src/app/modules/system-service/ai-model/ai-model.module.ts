import { Module } from '@nestjs/common';
import { SystemServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { AiModelController } from './ai-model.controller';

@Module({
  imports: [SystemServiceClientModule,SharedInterceptorModule],
  controllers: [AiModelController],
})
export class AiModelModule {}