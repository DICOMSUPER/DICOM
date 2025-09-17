import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeeklySchedulePatternsService } from './weekly-schedule-patterns.service';
import { CreateWeeklySchedulePatternDto } from './dto/create-weekly-schedule-pattern.dto';
import { UpdateWeeklySchedulePatternDto } from './dto/update-weekly-schedule-pattern.dto';

@Controller('weekly-schedule-patterns')
export class WeeklySchedulePatternsController {
  constructor(private readonly weeklySchedulePatternsService: WeeklySchedulePatternsService) {}

  @Post()
  create(@Body() createWeeklySchedulePatternDto: CreateWeeklySchedulePatternDto) {
    return this.weeklySchedulePatternsService.create(createWeeklySchedulePatternDto);
  }

  @Get()
  findAll() {
    return this.weeklySchedulePatternsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklySchedulePatternsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeeklySchedulePatternDto: UpdateWeeklySchedulePatternDto) {
    return this.weeklySchedulePatternsService.update(+id, updateWeeklySchedulePatternDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklySchedulePatternsService.remove(+id);
  }
}
