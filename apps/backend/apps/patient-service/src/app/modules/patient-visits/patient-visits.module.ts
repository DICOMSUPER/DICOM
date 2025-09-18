import { Module } from '@nestjs/common';
import { PatientVisitsService } from './patient-visits.service';
import { PatientVisitsController } from './patient-visits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientVisit } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientVisit])
  ],
  controllers: [PatientVisitsController],
  providers: [PatientVisitsService],
})
export class PatientVisitsModule {}
