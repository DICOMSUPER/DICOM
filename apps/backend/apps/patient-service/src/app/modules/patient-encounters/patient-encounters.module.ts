import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import { PatientEncounterRestController } from './patient-encounters-rest.controller';
import { PatientEncounterService } from './patient-encounters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientEncounter, PatientEncounterRepository, Patient, DiagnosesReport } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEncounter, Patient, DiagnosesReport])
  ],
  controllers: [PatientEncounterController, PatientEncounterRestController],
  providers: [
    PatientEncounterService,
    PatientEncounterRepository
  ],
  exports: [PatientEncounterService, PatientEncounterRepository],
})
export class PatientEncounterModule {}
