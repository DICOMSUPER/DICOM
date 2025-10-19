import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import {
  ImagingModality,
  ImagingOrder,
  DicomStudy,
  DicomSeries,
  DicomInstance,
  ImageAnnotation,
} from '@backend/shared-domain';
import {
  UserServiceClientModule,
  PatientServiceClientModule,
} from '@backend/shared-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImagingModality,
      ImagingOrder,
      DicomStudy,
      DicomSeries,
      DicomInstance,
      ImageAnnotation,
    ]),
    UserServiceClientModule,
    PatientServiceClientModule,
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}

