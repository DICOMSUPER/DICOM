import { Module } from '@nestjs/common';
import { PatientConditionController } from './patient-conditions.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PATIENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PATIENT_SERVICE_HOST || 'localhost',
          port: Number(process.env.PATIENT_SERVICE_PORT || 5004),
        },
      },
    ]),
  ],
  controllers: [PatientConditionController],
})
export class PatientConditionModule {}
