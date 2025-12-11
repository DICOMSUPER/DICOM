import { PaginationService } from '@backend/database';
import { AiAnalysis } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';

import { AiAnalysesController } from './ai-analyses.controller';
import { AiAnalysesService } from './ai-analyses.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAnalysis]),
    CloudinaryModule,
  ],
  controllers: [AiAnalysesController],
  providers: [AiAnalysesService, PaginationService],
})
export class AiAnalysesModule {}
