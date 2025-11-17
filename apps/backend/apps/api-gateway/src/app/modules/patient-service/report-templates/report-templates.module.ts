import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { PatientServiceClientModule } from '@backend/shared-client';
import { ReportTemplatesController } from './report-templates.controller';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [ReportTemplatesController],
  exports: [PatientServiceClientModule],
})
export class ReportTemplatesModule { }
