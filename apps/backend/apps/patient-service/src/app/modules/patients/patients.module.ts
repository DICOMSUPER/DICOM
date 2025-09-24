import { Module } from '@nestjs/common';
import { PatientService } from './patients.service';
import { PatientController } from './patients.controller';
import { Patient, PatientRepository, PatientEncounter, DiagnosesReport, PatientCondition } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientEncounter, DiagnosesReport, PatientCondition]),
  ],
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
  exports: [PatientService, PatientRepository],
})
export class PatientModule {}
