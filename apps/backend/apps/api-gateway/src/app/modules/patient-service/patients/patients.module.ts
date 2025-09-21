import { Module } from '@nestjs/common';
import { PatientServiceController } from './patients.controller';
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
  controllers: [PatientServiceController],
})
export class PatientServiceModule {}
