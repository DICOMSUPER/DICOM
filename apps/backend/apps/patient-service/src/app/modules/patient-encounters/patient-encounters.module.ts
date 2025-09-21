import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import { PatientEncounterService } from './patient-encounters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientEncounter } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEncounter])
  ],
  controllers: [PatientEncounterController],
  providers: [PatientEncounterService],
})
export class PatientEncounterModule {}
