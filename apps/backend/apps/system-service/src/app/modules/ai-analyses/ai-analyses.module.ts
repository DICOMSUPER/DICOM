import { Module } from '@nestjs/common';
import { AiAnalysesService } from './ai-analyses.service';
import { AiAnalysesController } from './ai-analyses.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AiAnalysis } from '@backend/shared-domain';
import { PaginationService } from '@backend/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAnalysis])
  ],
  controllers: [AiAnalysesController],
  providers: [AiAnalysesService, PaginationService],
})
export class AiAnalysesModule {}
