import { Injectable } from '@nestjs/common';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

import { SystemLog } from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { createCacheKey } from '@backend/shared-utils';
import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { FilterSystemLogDto } from './dto/filter-system-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog) 
    private readonly systemLogRepository: Repository<SystemLog>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService
  ) {}
  async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    // Create entity instance with proper data
    const systemLog = this.systemLogRepository.create({
      ...createSystemLogDto,
      timestamp: new Date(), // Add timestamp
    });

    // Save to database
    return await this.systemLogRepository.save(systemLog);
  }

  async findAll(filter: FilterSystemLogDto) {
    const { page = 1, limit = 10, logLevel, category } = filter;

    const options: any = {
      where: {},
      order: { createdAt: 'DESC' },
    };

    const keyName = createCacheKey.system(
      'system_logs',
      undefined,
      'filter_system_logs',
      { ...filter }
    );
    const cachedService = await this.redisService.get<
      PaginatedResponseDto<SystemLog>
    >(keyName);
    if (cachedService) {
      console.log('cached service');
      return cachedService;
    }
    if (logLevel) {
      options.where.logLevel = logLevel;
    }
    if (category) {
      options.where.category = category;
    }

    const result = await this.paginationService.paginate(
      SystemLog,
      {
        page,
        limit,
      },
      options
    );

    await this.redisService.set(keyName, result, 3600);
    return result;
  }
}
