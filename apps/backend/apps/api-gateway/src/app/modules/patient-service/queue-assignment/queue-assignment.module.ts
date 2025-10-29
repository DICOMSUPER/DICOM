import { Module } from '@nestjs/common';
import { QueueAssignmentController } from './queue-assignment.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [QueueAssignmentController],
})
export class QueueAssignmentModule {}
