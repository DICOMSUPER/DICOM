import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeSchedulesService } from './employee-schedules.service';
import { CreateEmployeeScheduleDto } from './dto/create-employee-schedule.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';
import {
  EmployeeScheduleAlreadyExistsException,
  EmployeeScheduleCreationFailedException,
  EmployeeScheduleDeletionFailedException,
  EmployeeScheduleNotFoundException,
  EmployeeScheduleUpdateFailedException,
  InvalidEmployeeScheduleDataException,
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class EmployeeSchedulesController {
  private readonly logger = new Logger('EmployeeSchedulesController');

  constructor(private readonly service: EmployeeSchedulesService) {}

  @MessagePattern('schedule.check-health')
  checkHealth() {
    return { service: 'EmployeeScheduleService', status: 'running', time: new Date() };
  }

  @MessagePattern('schedule.create')
  async create(@Payload() dto: CreateEmployeeScheduleDto) {
    try {
      this.logger.log(`Creating schedule for employee ${dto.employeeId}`);
      const schedule = await this.service.create(dto);
      return { schedule, message: 'Tạo lịch làm việc thành công' };
    } catch (error) {
      this.logger.error(`Create schedule error: ${(error as Error).message}`);
      if (
        error instanceof EmployeeScheduleAlreadyExistsException ||
        error instanceof InvalidEmployeeScheduleDataException ||
        error instanceof EmployeeScheduleCreationFailedException
      )
        throw error;
      handleErrorFromMicroservices(error, 'Failed to create schedule', 'EmployeeSchedulesController.create');
    }
  }

  @MessagePattern('schedule.get-all')
  async findAll() {
    try {
      const schedules = await this.service.findAll();
      return { schedules, count: schedules.length };
    } catch (error) {
      handleErrorFromMicroservices(error, 'Failed to get schedules', 'EmployeeSchedulesController.findAll');
    }
  }

  @MessagePattern('schedule.get-by-id')
  async findOne(@Payload() data: { id: string }) {
    try {
      const schedule = await this.service.findOne(data.id);
      return { schedule, message: 'Lấy lịch làm việc thành công' };
    } catch (error) {
      if (error instanceof EmployeeScheduleNotFoundException) throw error;
      handleErrorFromMicroservices(error, 'Failed to get schedule', 'EmployeeSchedulesController.findOne');
    }
  }

  @MessagePattern('schedule.update')
  async update(@Payload() data: { id: string; updateDto: UpdateEmployeeScheduleDto }) {
    try {
      const schedule = await this.service.update(data.id, data.updateDto);
      return { schedule, message: 'Cập nhật lịch làm việc thành công' };
    } catch (error) {
      if (
        error instanceof EmployeeScheduleNotFoundException ||
        error instanceof EmployeeScheduleUpdateFailedException
      )
        throw error;
      handleErrorFromMicroservices(error, 'Failed to update schedule', 'EmployeeSchedulesController.update');
    }
  }

  @MessagePattern('schedule.delete')
  async remove(@Payload() data: { id: string }) {
    try {
      await this.service.remove(data.id);
      return { message: 'Xóa lịch làm việc thành công' };
    } catch (error) {
      if (
        error instanceof EmployeeScheduleNotFoundException ||
        error instanceof EmployeeScheduleDeletionFailedException
      )
        throw error;
      handleErrorFromMicroservices(error, 'Failed to delete schedule', 'EmployeeSchedulesController.remove');
    }
  }
}
