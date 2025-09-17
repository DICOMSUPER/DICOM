import { Module } from '@nestjs/common';
import { ImagingModalitiesService } from './imaging-modalities.service';
import { ImagingModalitiesController } from './imaging-modalities.controller';

@Module({
  controllers: [ImagingModalitiesController],
  providers: [ImagingModalitiesService],
})
export class ImagingModalitiesModule {}
