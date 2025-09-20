import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateSystemLogDto, FilterSystemLogDto } from '@backend/shared-domain';

@Controller('system-logs')
export class SystemLogsController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}
  
  @Post()
  async createLog(@Body() logDto: CreateSystemLogDto) {
    return this.systemService.send('create_log', logDto);
  }

  @Get()
  async findAllLogs(@Query() filter: FilterSystemLogDto) {
    return this.systemService.send('find_all_logs', filter);
  }

}
