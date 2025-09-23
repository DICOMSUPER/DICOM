import { Module } from '@nestjs/common';
import { PatientEncounterController } from './encounters.controller';

@Module({
  controllers: [PatientEncounterController],
})
export class PatientEncounterModule {}
