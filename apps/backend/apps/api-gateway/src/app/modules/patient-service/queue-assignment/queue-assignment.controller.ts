import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('queue-assignment')
export class QueueAssignmentController {
  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PatientService')
    private readonly patientService: ClientProxy
  ) {}
}
