import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import { PatientEncounterService } from './patient-encounters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  PatientEncounter,
  PatientEncounterRepository,
  Patient,
  DiagnosesReport,
} from '@backend/shared-domain';
import { PaginationService } from '@backend/database';
import { SystemServiceClientModule, UserServiceClientModule } from '@backend/shared-client';
import { PatientEncounterCronService } from './patient-encounter.cron';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEncounter, Patient, DiagnosesReport]),
    UserServiceClientModule,
    ScheduleModule.forRoot(),
     SystemServiceClientModule,
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
    PaginationService,
    PatientEncounterCronService,
  ],
  exports: [PatientEncounterService, PatientEncounterRepository],
})
export class PatientEncounterModule {}
