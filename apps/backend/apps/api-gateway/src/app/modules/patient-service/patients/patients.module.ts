import { Module } from '@nestjs/common';
import { PatientServiceController } from './patients.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.PATIENT_SERVICE_NAME || 'PatientService',
        Number(process.env.PATIENT_SERVICE_TRANSPORT || Transport.TCP),
        process.env.PATIENT_SERVICE_HOST || 'localhost',
        Number(process.env.PATIENT_SERVICE_PORT || 5004)
      ),
    ]),
   SharedInterceptorModule
  ],
  controllers: [PatientServiceController],
})
export class PatientServiceModule {}
