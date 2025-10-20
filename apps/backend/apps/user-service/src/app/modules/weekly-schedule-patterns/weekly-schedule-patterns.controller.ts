import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WeeklySchedulePatternsService } from './weekly-schedule-patterns.service';
import {
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
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class WeeklySchedulePatternsController {
  private readonly logger = new Logger('WeeklySchedulePatternsController');

  constructor(
    private readonly weeklySchedulePatternsService: WeeklySchedulePatternsService,
  ) {}

  // 🟢 Health check
  @MessagePattern('weekly-schedule-pattern.check-health')
  async checkHealth() {
    return {
      service: 'WeeklySchedulePatternsService',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  // 🟩 Tạo mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.create')
  async create(@Payload() createDto: CreateWeeklySchedulePatternDto) {
    try {
      this.logger.log(`Creating weekly schedule pattern`);
      const pattern = await this.weeklySchedulePatternsService.create(createDto);

      if (!pattern) {
        throw new WeeklySchedulePatternCreationFailedException('Không thể tạo mẫu lịch tuần');
      }

      return {
        pattern,
        message: 'Tạo mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`❌ Create pattern failed: ${(error as Error).message}`);
      if (
        error instanceof WeeklySchedulePatternAlreadyExistsException ||
        error instanceof InvalidWeeklySchedulePatternDataException ||
        error instanceof WeeklySchedulePatternCreationFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Weekly schedule pattern creation failed',
        'WeeklySchedulePatternsController.create',
      );
    }
  }

  // 🟦 Lấy danh sách tất cả mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.get-all')
  async findAll(
    @Payload() query?: { page?: number; limit?: number; userId?: string; dayOfWeek?: number; isActive?: boolean },
  ) {
    try {
      this.logger.log(`Fetching all weekly schedule patterns`);
      return await this.weeklySchedulePatternsService.findAll(query || {});
    } catch (error: unknown) {
      this.logger.error(`❌ Find all patterns failed: ${(error as Error).message}`);
      handleErrorFromMicroservices(error, 'Failed to get weekly schedule patterns', 'WeeklySchedulePatternsController.findAll');
    }
  }

  // 🟨 Lấy thông tin chi tiết một mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.get-by-id')
  async findOne(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Fetching pattern ID: ${data.id}`);
      const pattern = await this.weeklySchedulePatternsService.findOne(data.id);

      if (!pattern) {
        throw new WeeklySchedulePatternNotFoundException(`Không tìm thấy mẫu lịch tuần với ID ${data.id}`);
      }

      return {
        pattern,
        message: 'Lấy thông tin mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`❌ Find pattern by ID failed: ${(error as Error).message}`);
      if (error instanceof WeeklySchedulePatternNotFoundException) throw error;
      handleErrorFromMicroservices(error, 'Failed to get weekly schedule pattern', 'WeeklySchedulePatternsController.findOne');
    }
  }

  // 🟪 Lấy danh sách mẫu lịch tuần theo user
  @MessagePattern('weekly-schedule-pattern.get-by-user')
  async findByUser(@Payload() data: { userId: string }) {
    try {
      this.logger.log(`Fetching patterns for user: ${data.userId}`);
      return await this.weeklySchedulePatternsService.findByUser(data.userId);
    } catch (error: unknown) {
      this.logger.error(`❌ Find patterns by user failed: ${(error as Error).message}`);
      handleErrorFromMicroservices(error, 'Failed to get patterns by user', 'WeeklySchedulePatternsController.findByUser');
    }
  }

  // 🟧 Cập nhật mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.update')
  async update(@Payload() data: { id: string; updateDto: UpdateWeeklySchedulePatternDto }) {
    try {
      this.logger.log(`Updating pattern ID: ${data.id}`);
      const pattern = await this.weeklySchedulePatternsService.update(data.id, data.updateDto);

      if (!pattern) {
        throw new WeeklySchedulePatternNotFoundException(`Không tìm thấy mẫu lịch tuần với ID ${data.id}`);
      }

      return {
        pattern,
        message: 'Cập nhật mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`❌ Update pattern failed: ${(error as Error).message}`);
      if (
        error instanceof WeeklySchedulePatternNotFoundException ||
        error instanceof WeeklySchedulePatternUpdateFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Failed to update weekly schedule pattern', 'WeeklySchedulePatternsController.update');
    }
  }

  // 🟥 Xóa mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.delete')
  async remove(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Deleting pattern ID: ${data.id}`);
      const result = await this.weeklySchedulePatternsService.remove(data.id);

      if (!result) {
        throw new WeeklySchedulePatternNotFoundException('Không tìm thấy mẫu lịch tuần để xóa');
      }

      return { message: 'Xóa mẫu lịch tuần thành công' };
    } catch (error: unknown) {
      this.logger.error(`❌ Delete pattern failed: ${(error as Error).message}`);
      if (
        error instanceof WeeklySchedulePatternNotFoundException ||
        error instanceof WeeklySchedulePatternDeletionFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Failed to delete weekly schedule pattern', 'WeeklySchedulePatternsController.remove');
    }
  }

  // ⛔ Vô hiệu hóa mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.deactivate')
  async deactivate(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Deactivating pattern ID: ${data.id}`);
      const pattern = await this.weeklySchedulePatternsService.deactivate(data.id);

      if (!pattern) {
        throw new WeeklySchedulePatternNotFoundException('Không tìm thấy mẫu lịch tuần để vô hiệu hóa');
      }

      return {
        pattern,
        message: 'Vô hiệu hóa mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`❌ Deactivate pattern failed: ${(error as Error).message}`);
      handleErrorFromMicroservices(error, 'Failed to deactivate weekly schedule pattern', 'WeeklySchedulePatternsController.deactivate');
    }
  }

  // ✅ Kích hoạt mẫu lịch tuần
  @MessagePattern('weekly-schedule-pattern.activate')
  async activate(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Activating pattern ID: ${data.id}`);
      const pattern = await this.weeklySchedulePatternsService.activate(data.id);

      if (!pattern) {
        throw new WeeklySchedulePatternNotFoundException('Không tìm thấy mẫu lịch tuần để kích hoạt');
      }

      return {
        pattern,
        message: 'Kích hoạt mẫu lịch tuần thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`❌ Activate pattern failed: ${(error as Error).message}`);
      handleErrorFromMicroservices(error, 'Failed to activate weekly schedule pattern', 'WeeklySchedulePatternsController.activate');
    }
  }
}
