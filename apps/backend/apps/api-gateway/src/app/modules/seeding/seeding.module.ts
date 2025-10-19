import { Module } from '@nestjs/common';
import { SeedingController } from './seeding.controller';
import { 
  UserServiceClientModule, 
  ImagingServiceClientModule,
  PatientServiceClientModule 
} from '@backend/shared-client';

@Module({
  imports: [
    UserServiceClientModule, 
    ImagingServiceClientModule,
    PatientServiceClientModule
  ],
  controllers: [SeedingController],
})
export class SeedingModule {}