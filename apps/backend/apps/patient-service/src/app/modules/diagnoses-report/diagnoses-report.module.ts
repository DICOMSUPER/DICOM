import { Module } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-report.service';
import { DiagnosesReportController } from './diagnoses-report.controller';

@Module({
  controllers: [DiagnosesReportController],
  providers: [DiagnosesReportService],
})
export class DiagnosesReportModule {}
