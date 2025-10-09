import { Module } from '@nestjs/common';
import { PatientConditionService } from './patient-conditions.service';
import { PatientConditionController } from './patient-conditions.controller';
import { PatientCondition, PatientConditionRepository } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PatientModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientCondition
    ]),
    PatientModule,
  ],
  controllers: [PatientConditionController],
  providers: [
    PatientConditionService,
    {
      provide: PatientConditionRepository,
      useFactory: (entityManager: EntityManager) => 
        new PatientConditionRepository(entityManager),
      inject: [EntityManager],
    },
  ],
  exports: [PatientConditionService, PatientConditionRepository],
})
export class PatientConditionModule {}
