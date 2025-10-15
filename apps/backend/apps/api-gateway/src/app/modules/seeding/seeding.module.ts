import { Module } from '@nestjs/common';
import { SeedingController } from './seeding.controller';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [UserServiceClientModule],
  controllers: [SeedingController],
})
export class SeedingModule {}