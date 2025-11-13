import { Module } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { DiagnosesReportController } from './diagnoses-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  DiagnosesReport,
  DiagnosisReportRepository,
  PatientEncounter,
  Patient,
  PatientEncounterRepository,
} from '@backend/shared-domain';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosesReport, PatientEncounter, Patient]),
    BackendRedisModule
  ],
  controllers: [DiagnosesReportController],
  providers: [
    DiagnosesReportService,
    {
      provide: DiagnosisReportRepository,
      useFactory: (entityManager: EntityManager) =>
        new DiagnosisReportRepository(entityManager),
      inject: [EntityManager],
    },
    PatientEncounterRepository,
  ],
  exports: [DiagnosesReportService, DiagnosisReportRepository],
})
export class DiagnosesReportModule {}
