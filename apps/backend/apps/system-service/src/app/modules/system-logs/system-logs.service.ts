import { Injectable } from '@nestjs/common';
import { SystemLog } from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { createCacheKey } from '@backend/shared-utils';
import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { FilterSystemLogDto } from '../../../../../../libs/shared-domain/src/lib/dto/systems/filter-system-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSystemLogDto } from '@backend/shared-domain';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService
  ) {}

  async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    console.log('🔧 Creating system log in service:', createSystemLogDto);

    const systemLog = this.systemLogRepository.create({
      ...createSystemLogDto,
      timestamp: new Date(),
    });

    const savedLog = await this.systemLogRepository.save(systemLog);
    console.log('✅ System log created successfully:', savedLog.id);

    return savedLog;
  }
  async findAll(filter: FilterSystemLogDto) {
    const { page, limit, logLevel, category } = filter;

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
      options.where = {
        ...options.where,
        logLevel,
      };
    }
    if (category) {
      options.where = {
        ...options.where,
        category,
      };
    }

    const result = await this.paginationService.paginate(
      SystemLog,
      {
        page,
        limit,
      },
      options
    );

    await this.redisService.set(keyName, result, 60000);

    return result;
  }
}
