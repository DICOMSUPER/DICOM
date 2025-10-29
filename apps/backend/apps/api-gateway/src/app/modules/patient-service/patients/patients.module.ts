import { Module } from '@nestjs/common';
import { PatientServiceController } from './patients.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [PatientServiceController],
})
export class PatientServiceModule {}
