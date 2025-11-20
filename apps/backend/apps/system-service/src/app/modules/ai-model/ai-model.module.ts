import { Module } from '@nestjs/common';
import { AiModelService } from './ai-model.service';
import { AiModelController } from './ai-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { PaginationService } from '@backend/database';
import { AiModel } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([AiModel])],
  controllers: [AiModelController],
  providers: [AiModelService, PaginationService],
})
export class AiModelModule {}
