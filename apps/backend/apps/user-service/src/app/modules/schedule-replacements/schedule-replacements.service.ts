import { Injectable } from '@nestjs/common';
import { CreateScheduleReplacementDto } from './dto/create-schedule-replacement.dto';
import { UpdateScheduleReplacementDto } from './dto/update-schedule-replacement.dto';

@Injectable()
export class ScheduleReplacementsService {
  create(createScheduleReplacementDto: CreateScheduleReplacementDto) {
    return 'This action adds a new scheduleReplacement';
  }

  findAll() {
    return `This action returns all scheduleReplacements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheduleReplacement`;
  }

  update(id: number, updateScheduleReplacementDto: UpdateScheduleReplacementDto) {
    return `This action updates a #${id} scheduleReplacement`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheduleReplacement`;
  }
}
