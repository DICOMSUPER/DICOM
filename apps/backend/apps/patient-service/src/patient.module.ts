import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from './entities/patient.entity';
import { PatientEncounter } from './entities/patient-encounter.entity';
import { PatientCondition } from './entities/patient-condition.entity';
import { QueueAssignment } from './entities/queue-assignment.entity';
import { PatientController } from './controllers/patient.controller';
import { PatientEncounterController } from './controllers/patient-encounter.controller';
import { PatientConditionController } from './controllers/patient-condition.controller';
import { PatientConditionsNestedController } from './controllers/patient-conditions.nested.controller';
import { QueueAssignmentController } from './controllers/queue-assignment.controller';
import { PatientService } from './services/patient.service';
import { PatientEncounterService } from './services/patient-encounter.service';
import { PatientConditionService } from './services/patient-condition.service';
import { QueueAssignmentService } from './services/queue-assignment.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Patient, PatientEncounter, PatientCondition, QueueAssignment],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Patient, PatientEncounter, PatientCondition, QueueAssignment]),
  ],
  controllers: [PatientController, PatientEncounterController, PatientConditionController, PatientConditionsNestedController, QueueAssignmentController],
  providers: [PatientService, PatientEncounterService, PatientConditionService, QueueAssignmentService],
})
export class PatientModule {}