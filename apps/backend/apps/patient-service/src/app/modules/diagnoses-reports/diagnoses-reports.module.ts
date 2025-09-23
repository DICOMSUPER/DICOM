import { Module } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { DiagnosesReportController } from './diagnoses-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosesReport, DiagnosisReportRepository, PatientEncounter, Patient } from '@backend/shared-domain'; 


@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosesReport, PatientEncounter, Patient]),
  ],
  controllers: [DiagnosesReportController],
  providers: [DiagnosesReportService, DiagnosisReportRepository],
  exports: [DiagnosesReportService],
})
export class DiagnosesReportModule {}
