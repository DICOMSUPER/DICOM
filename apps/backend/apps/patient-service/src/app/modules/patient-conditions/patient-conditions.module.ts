import { Module } from '@nestjs/common';
import { PatientConditionService } from './patient-conditions.service';
import { PatientConditionController } from './patient-conditions.controller';
import { PatientCondition } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientCondition
    ]),
    PatientModule,
  ],
  controllers: [PatientConditionController],
  providers: [PatientConditionService],
  exports: [PatientConditionService],
})
export class PatientConditionModule {}
