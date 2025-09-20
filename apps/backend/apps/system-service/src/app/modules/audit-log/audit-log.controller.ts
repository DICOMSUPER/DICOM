import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto, FilterAuditLogDto, UpdateAuditLogDto } from '@backend/shared-domain';

@Controller()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}
    

  @MessagePattern('audit_log.create')
  async create(@Payload() createAuditLogDto: CreateAuditLogDto) {
    return await this.auditLogService.create(createAuditLogDto);
  }

  @MessagePattern('audit_log.findAll')
  async findAll(@Payload() filter: FilterAuditLogDto) {
    
    return await this.auditLogService.findAll(filter);
  }

  @MessagePattern('audit_log.findOne')
  async findOne(@Payload() payload: { id: string }) {
    
    return await this.auditLogService.findOne(payload.id);
  }

  @MessagePattern('audit_log.update')
  async update(@Payload() payload: { id: string, data: UpdateAuditLogDto }) {
    
    return await this.auditLogService.update(payload.id, payload.data);
  }

  @MessagePattern('audit_log.remove')
  async remove(@Payload() payload: { id: string }) {
    
    return await this.auditLogService.remove(payload.id);
  }
}
