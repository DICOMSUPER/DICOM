import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { FilterSystemLogDto } from './dto/filter-system-log.dto';

@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSystemLogDto: CreateSystemLogDto) {
    console.log('📝 Creating system log:', createSystemLogDto);
    return await this.systemLogsService.create(createSystemLogDto);
  }

  @Get()
  findAll(@Query() filter: FilterSystemLogDto) {
    return this.systemLogsService.findAll(filter);
  }
}
