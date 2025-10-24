import { Module } from '@nestjs/common';
import { DiagnosisReportsController } from './diagnosis-reports.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [DiagnosisReportsController],
})
export class DiagnosisReportsModule {}
