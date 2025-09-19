import { Module } from '@nestjs/common';
import { PatientConditionService } from './patient-conditions.service';
import { PatientConditionController } from './patient-conditions.controller';
import { PatientCondition } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientCondition
    ])
  ],
  controllers: [PatientConditionController],
  providers: [PatientConditionService],
})
export class PatientConditionModule {}
