import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHoursController } from './working-hours.controller';
import { WorkingHoursService } from './working-hours.service';
import { WorkingHoursRepository } from './working-hours.repository';
import { WorkingHours, BreakTime, SpecialHours } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkingHours, BreakTime, SpecialHours])
  ],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService, WorkingHoursRepository],
  exports: [WorkingHoursService, WorkingHoursRepository]
})
export class WorkingHoursModule {}
