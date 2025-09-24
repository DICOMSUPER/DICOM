import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescriptions.service';
import { PrescriptionController } from './prescriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription, PatientEncounter, DiagnosesReport } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, PatientEncounter, DiagnosesReport])],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
