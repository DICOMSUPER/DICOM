import { Module } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller';
import { SystemServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [SystemServiceClientModule],
  controllers: [AiAnalysisController],
})
export class AiAnalysisModule {}
