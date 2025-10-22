import { Module } from '@nestjs/common';
import { PatientService } from './patients.service';
import { PatientController } from './patients.controller';
import {
  Patient,
  PatientRepository,
  PatientEncounter,
  DiagnosesReport,
  PatientCondition,
  DiagnosisReportRepository,
} from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      PatientEncounter,
      DiagnosesReport,
      PatientCondition,
    ]),
  ],
  controllers: [PatientController],
  providers: [
    PatientService,
    {
      provide: PatientRepository,
      useFactory: (entityManager: EntityManager) =>
        new PatientRepository(entityManager),
      inject: [EntityManager],
    },
    DiagnosisReportRepository,
  ],
  exports: [PatientService, PatientRepository],
})
export class PatientModule {}
