import { Module } from '@nestjs/common';
import { PatientVisitsService } from './patient-visits.service';
import { PatientVisitsController } from './patient-visits.controller';

@Module({
  controllers: [PatientVisitsController],
  providers: [PatientVisitsService],
})
export class PatientVisitsModule {}
