import {  Controller } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { FilterSystemLogDto } from '@backend/shared-domain';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';
import { Payload } from '@nestjs/microservices';
import { CreateSystemLogDto } from '@backend/shared-domain';

@Controller()
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @MessagePattern('create_log')
  async create(@Payload() createSystemLogDto: CreateSystemLogDto) {
    console.log('Creating system log:', createSystemLogDto);
    return await this.systemLogsService.create(createSystemLogDto);
  }

  @MessagePattern('find_all_logs')
  findAll(@Payload() filter: FilterSystemLogDto) {
    console.log('🔍 Finding system logs with filter:', filter);
    return this.systemLogsService.findAll(filter);
  }
}
