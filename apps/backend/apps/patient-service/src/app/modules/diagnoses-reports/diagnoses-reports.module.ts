import { Module } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { DiagnosesReportController } from './diagnoses-reports.controller';
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
