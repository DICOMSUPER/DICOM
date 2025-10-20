import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WeeklySchedulePattern,
  CreateWeeklySchedulePatternDto,
  UpdateWeeklySchedulePatternDto,
} from '@backend/shared-domain';
import {
  WeeklySchedulePatternNotFoundException,
  WeeklySchedulePatternAlreadyExistsException,
  WeeklySchedulePatternCreationFailedException,
  WeeklySchedulePatternUpdateFailedException,
  WeeklySchedulePatternDeletionFailedException,
  InvalidWeeklySchedulePatternDataException,
  DatabaseException,
} from '@backend/shared-exception';

@Injectable()
export class WeeklySchedulePatternsService {
  private readonly logger = new Logger(WeeklySchedulePatternsService.name);

  constructor(
    @InjectRepository(WeeklySchedulePattern)
    private readonly patternRepository: Repository<WeeklySchedulePattern>,
  ) {}

  async create(createDto: CreateWeeklySchedulePatternDto): Promise<WeeklySchedulePattern> {
    try {
      this.logger.log(`Creating weekly schedule pattern for user: ${createDto.userId}`);

      if (!createDto.userId) {
        throw new InvalidWeeklySchedulePatternDataException('Thiếu thông tin userId');
      }

      const existingPattern = await this.patternRepository.findOne({
        where: {
          userId: createDto.userId,
          dayOfWeek: createDto.dayOfWeek,
          isActive: true,
        },
      });

      if (existingPattern) {
        throw new WeeklySchedulePatternAlreadyExistsException(
          `Người dùng này đã có lịch làm việc cho ngày ${createDto.dayOfWeek}`,
        );
      }

      const pattern = this.patternRepository.create({
        ...createDto,
        isWorkingDay: createDto.isWorkingDay ?? true,
        isActive: createDto.isActive ?? true,
      });

      const saved = await this.patternRepository.save(pattern);
      this.logger.log(`✅ Weekly schedule pattern created: ${saved.id}`);

      return saved;
    } catch (error: unknown) {
      this.logger.error(`❌ Create pattern error: ${(error as Error).message}`);
      if (
        error instanceof WeeklySchedulePatternAlreadyExistsException ||
        error instanceof InvalidWeeklySchedulePatternDataException
      ) {
        throw error;
      }
      throw new WeeklySchedulePatternCreationFailedException('Không thể tạo mẫu lịch tuần');
    }
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    userId?: string;
    dayOfWeek?: number;
    isActive?: boolean;
  }) {
    try {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;
      const skip = (page - 1) * limit;

      const qb = this.patternRepository
        .createQueryBuilder('pattern')
        .leftJoinAndSelect('pattern.user', 'user')
        .leftJoinAndSelect('pattern.shiftTemplate', 'shiftTemplate')
        .orderBy('pattern.effectiveFrom', 'DESC')
        .addOrderBy('pattern.dayOfWeek', 'ASC')
        .skip(skip)
        .take(limit);

      if (filters?.userId) qb.andWhere('pattern.userId = :userId', { userId: filters.userId });
      if (filters?.dayOfWeek !== undefined)
        qb.andWhere('pattern.dayOfWeek = :dayOfWeek', { dayOfWeek: filters.dayOfWeek });
      if (filters?.isActive !== undefined)
        qb.andWhere('pattern.isActive = :isActive', { isActive: filters.isActive });

      const [data, total] = await qb.getManyAndCount();

      return {
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          count: data.length,
        },
        message: 'Lấy danh sách mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Find all patterns error: ${(error as Error).message}`);
      throw new DatabaseException('Lỗi khi lấy danh sách mẫu lịch tuần');
    }
  }

  async findOne(id: string): Promise<WeeklySchedulePattern> {
    try {
      this.logger.log(`Finding weekly schedule pattern with ID: ${id}`);

      const pattern = await this.patternRepository.findOne({
        where: { id },
        relations: ['user', 'shiftTemplate'],
      });

      if (!pattern) {
        throw new WeeklySchedulePatternNotFoundException(`Không tìm thấy mẫu lịch tuần với ID: ${id}`);
      }

      this.logger.log(`✅ Pattern found: ${pattern.id}`);
      return pattern;
    } catch (error: unknown) {
      this.logger.error(`Find one pattern error: ${(error as Error).message}`);
      if (error instanceof WeeklySchedulePatternNotFoundException) throw error;
      throw new WeeklySchedulePatternNotFoundException('Không thể tìm thấy mẫu lịch tuần');
    }
  }

  async update(id: string, updateDto: UpdateWeeklySchedulePatternDto): Promise<WeeklySchedulePattern> {
    try {
      this.logger.log(`Updating weekly schedule pattern ID: ${id}`);

      const pattern = await this.findOne(id);
      Object.assign(pattern, updateDto);

      const updated = await this.patternRepository.save(pattern);
      this.logger.log(`✅ Pattern updated successfully: ${updated.id}`);
      return updated;
    } catch (error: unknown) {
      this.logger.error(`Update pattern error: ${(error as Error).message}`);
      if (error instanceof WeeklySchedulePatternNotFoundException) throw error;
      throw new WeeklySchedulePatternUpdateFailedException('Không thể cập nhật mẫu lịch tuần');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting weekly schedule pattern ID: ${id}`);
      const pattern = await this.findOne(id);
      await this.patternRepository.remove(pattern);

      this.logger.log(`✅ Pattern deleted successfully`);
      return true;
    } catch (error: unknown) {
      this.logger.error(`Remove pattern error: ${(error as Error).message}`);
      if (error instanceof WeeklySchedulePatternNotFoundException) throw error;
      throw new WeeklySchedulePatternDeletionFailedException('Không thể xóa mẫu lịch tuần');
    }
  }

  async findByUser(userId: string): Promise<WeeklySchedulePattern[]> {
    try {
      this.logger.log(`Finding patterns for user ID: ${userId}`);
      const patterns = await this.patternRepository.find({
        where: { userId },
        relations: ['shiftTemplate'],
      });

      this.logger.log(`✅ Found ${patterns.length} patterns for user ID: ${userId}`);
      return patterns;
    }
    catch (error: unknown) {
      this.logger.error(`Find patterns by user error: ${(error as Error).message}`);
      throw new DatabaseException('Lỗi khi lấy mẫu lịch tuần của người dùng');
    }
  }
  
  async deactivate(id: string): Promise<WeeklySchedulePattern> {
    const pattern = await this.findOne(id);
    pattern.isActive = false;
    return this.patternRepository.save(pattern);
  }

  async activate(id: string): Promise<WeeklySchedulePattern> {
    const pattern = await this.findOne(id);
    pattern.isActive = true;
    return this.patternRepository.save(pattern);
  }
}
