import { Module } from '@nestjs/common';
import { AiAnalysesService } from './ai-analyses.service';
import { AiAnalysesController } from './ai-analyses.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AiAnalysis, AiModel } from '@backend/shared-domain';
import { PaginationService } from '@backend/database';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AiModelModule } from '../ai-model/ai-model.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAnalysis, AiModel]),
    CloudinaryModule,
    AiModelModule
  ],
  controllers: [AiAnalysesController],
  providers: [AiAnalysesService, PaginationService],
})
export class AiAnalysesModule {}
