import { Module } from '@nestjs/common';
import { ImagingModalitiesService } from './imaging-modalities.service';
import { ImagingModalitiesController } from './imaging-modalities.controller';
import { ImagingModalityRepository } from './imaging-modalities.repository';
import { ImagingModality } from './entities/imaging-modality.entity';
import { BackendEntitiesModule } from '@backend/entities';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImagingModality])],
  controllers: [ImagingModalitiesController],
  providers: [ImagingModalitiesService, ImagingModalityRepository],
  exports: [BackendEntitiesModule],
})
export class ImagingModalitiesModule {}
