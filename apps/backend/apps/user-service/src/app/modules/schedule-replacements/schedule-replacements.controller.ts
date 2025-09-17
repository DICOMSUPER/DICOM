import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduleReplacementsService } from './schedule-replacements.service';
import { CreateScheduleReplacementDto } from './dto/create-schedule-replacement.dto';
import { UpdateScheduleReplacementDto } from './dto/update-schedule-replacement.dto';

@Controller('schedule-replacements')
export class ScheduleReplacementsController {
  constructor(private readonly scheduleReplacementsService: ScheduleReplacementsService) {}

  @Post()
  create(@Body() createScheduleReplacementDto: CreateScheduleReplacementDto) {
    return this.scheduleReplacementsService.create(createScheduleReplacementDto);
  }

  @Get()
  findAll() {
    return this.scheduleReplacementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleReplacementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleReplacementDto: UpdateScheduleReplacementDto) {
    return this.scheduleReplacementsService.update(+id, updateScheduleReplacementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleReplacementsService.remove(+id);
  }
}
