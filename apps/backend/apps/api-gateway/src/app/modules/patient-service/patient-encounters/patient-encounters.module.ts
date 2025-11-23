import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import {
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    PatientServiceClientModule,
    SharedInterceptorModule,
    UserServiceClientModule,
  ],
  controllers: [PatientEncounterController],
})
export class PatientEncounterModule {}
