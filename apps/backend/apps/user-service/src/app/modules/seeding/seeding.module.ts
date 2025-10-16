import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { ShiftTemplate, Department, Room, User, EmployeeSchedule } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftTemplate,
      Department,
      Room,
      User,
      EmployeeSchedule,
    ]),
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
