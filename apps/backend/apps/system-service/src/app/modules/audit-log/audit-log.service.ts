import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditLogDto, FilterAuditLogDto, UpdateAuditLogDto } from '@backend/shared-domain';
import { AuditLog } from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { createCacheKey } from '@backend/shared-utils';
import { PaginatedResponseDto, PaginationService } from '@backend/database';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    console.log('📋 Creating audit log:', createAuditLogDto);

    const auditLog = this.auditLogRepository.create({
      ...createAuditLogDto,
      timestamp: createAuditLogDto.timestamp || new Date(),
    });

    const savedAuditLog = await this.auditLogRepository.save(auditLog);
    console.log('✅ Audit log created successfully:', savedAuditLog.id);
    
    return savedAuditLog;
  }

  async findAll(filter: FilterAuditLogDto): Promise<PaginatedResponseDto<AuditLog>> {
    const { page = 1, limit = 10, userId, action, entityId, ipAddress } = filter;

    // Generate cache key
    const keyName = createCacheKey.system(
      'audit_logs',
      undefined,
      'filter_audit_logs',
      { ...filter }
    );

    // Check cache
    const cachedService = await this.redisService.get<PaginatedResponseDto<AuditLog>>(keyName);
    if (cachedService) {
      console.log('📦 Audit logs retrieved from cache');
      return cachedService;
    }

    // Build query options
    const options: any = {
      where: {},
      order: { timestamp: 'DESC' },
    };

    // Apply filters
    if (userId) {
      options.where = {
        ...options.where,
        userId,
      };
    }
    if (action) {
      options.where = {
        ...options.where,
        action,
      };
    }
    if (entityId) {
      options.where = {
        ...options.where,
        entityId,
      };
    }
    if (ipAddress) {
      options.where = {
        ...options.where,
        ipAddress,
      };
    }

    try {
      const result = await this.paginationService.paginate(
        AuditLog,
        { page, limit },
        options
      );

      await this.redisService.set(keyName, result, 3600);
      console.log(`📊 Found ${result.data.length} audit logs`);
      
      return result;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw new BadRequestException('Error querying audit logs: ' + error);
    }
  }

  async findOne(id: string): Promise<AuditLog> {
    console.log(`🔍 Finding audit log: ${id}`);
    
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async update(id: string, updateAuditLogDto: UpdateAuditLogDto): Promise<AuditLog> {
    console.log(`🔄 Updating audit log: ${id}`);
    
    const auditLog = await this.findOne(id);
    
    Object.assign(auditLog, updateAuditLogDto);
    
    const updatedAuditLog = await this.auditLogRepository.save(auditLog);
    console.log('✅ Audit log updated successfully:', updatedAuditLog.id);
    
    return updatedAuditLog;
  }

  async remove(id: string): Promise<void> {
    console.log(`🗑️ Removing audit log: ${id}`);
    
    const auditLog = await this.findOne(id);
    
    await this.auditLogRepository.remove(auditLog);
    console.log('✅ Audit log removed successfully:', id);
  }
}
