import { Module } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-report.service';
import { DiagnosesReportController } from './diagnoses-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosesReport } from '@backend/shared-domain'; 


@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosesReport, 
      // Add other entities here
      
    ]),
  ],
  controllers: [DiagnosesReportController],
  providers: [DiagnosesReportService],
})
export class DiagnosesReportModule {}
