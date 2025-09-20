import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescriptions.service';
import { PrescriptionController } from './prescriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from '@backend/shared-domain';

@Module({
    imports: [TypeOrmModule.forFeature([Prescription])],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
