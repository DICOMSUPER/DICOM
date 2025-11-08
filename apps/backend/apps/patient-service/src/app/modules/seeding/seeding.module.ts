import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import {
  Patient,
  PatientCondition,
  PatientEncounter,
  DiagnosesReport,
} from '@backend/shared-domain';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      PatientCondition,
      PatientEncounter,

      DiagnosesReport,
    ]),
    UserServiceClientModule,
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}

