import { Injectable } from '@nestjs/common';
import { CreateWeeklySchedulePatternDto, UpdateWeeklySchedulePatternDto } from '@backend/shared-domain';

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
