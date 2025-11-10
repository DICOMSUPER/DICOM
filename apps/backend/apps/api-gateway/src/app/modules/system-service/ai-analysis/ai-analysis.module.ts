import { Module } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller';
import { SystemServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [SystemServiceClientModule,SharedInterceptorModule],
  controllers: [AiAnalysisController],
})
export class AiAnalysisModule {}
