import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  CreateAuditLogDto, 
  FilterAuditLogDto, 
  UpdateAuditLogDto 
} from '@backend/shared-domain';

@Controller('audit-logs')
export class AuditLogController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}
  
  @Post()
  async create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.systemService.send('audit_log.create', createAuditLogDto);
  }

  @Get()
  async findAll(@Query() filter: FilterAuditLogDto) {
    return this.systemService.send('audit_log.findAll', filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('audit_log.findOne', { id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateAuditLogDto: UpdateAuditLogDto
  ) {
    return this.systemService.send('audit_log.update', { id, updateAuditLogDto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('audit_log.remove', { id });
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Query() filter: FilterAuditLogDto) {
    return this.systemService.send('audit_log.findAll', { ...filter, userId });
  }
}