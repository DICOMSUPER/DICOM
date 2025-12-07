import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import {
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    PatientServiceClientModule,
    SharedInterceptorModule,
    UserServiceClientModule,
    BackendRedisModule,
  ],
  controllers: [PatientEncounterController],
})
export class PatientEncounterModule {}
