import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import { PatientEncounterService } from './patient-encounters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PatientEncounter, PatientEncounterRepository, Patient, DiagnosesReport } from '@backend/shared-domain';
import { PaginationService } from '@backend/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEncounter, Patient, DiagnosesReport])
  ],
  controllers: [PatientEncounterController],
  providers: [
    PatientEncounterService,
    {
      provide: PatientEncounterRepository,
      useFactory: (entityManager: EntityManager) => 
        new PatientEncounterRepository(entityManager),
      inject: [EntityManager],
    },
    PaginationService
  ],
  exports: [PatientEncounterService, PatientEncounterRepository],
})
export class PatientEncounterModule {}
