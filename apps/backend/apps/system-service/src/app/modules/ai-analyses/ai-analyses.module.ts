import { Module } from '@nestjs/common';
import { AiAnalysesService } from './ai-analyses.service';
import { AiAnalysesController } from './ai-analyses.controller';

@Module({
  controllers: [AiAnalysesController],
  providers: [AiAnalysesService],
})
export class AiAnalysesModule {}
