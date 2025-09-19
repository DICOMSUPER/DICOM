import { Injectable } from '@nestjs/common';
import { CreateWeeklySchedulePatternDto } from './dto/create-weekly-schedule-pattern.dto';
import { UpdateWeeklySchedulePatternDto } from './dto/update-weekly-schedule-pattern.dto';

@Injectable()
export class WeeklySchedulePatternsService {
  create(createWeeklySchedulePatternDto: CreateWeeklySchedulePatternDto) {
    return 'This action adds a new weeklySchedulePattern';
  }

  findAll() {
    return `This action returns all weeklySchedulePatterns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weeklySchedulePattern`;
  }

  update(id: number, updateWeeklySchedulePatternDto: UpdateWeeklySchedulePatternDto) {
    return `This action updates a #${id} weeklySchedulePattern`;
  }

  remove(id: number) {
    return `This action removes a #${id} weeklySchedulePattern`;
  }
}
