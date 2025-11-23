import { Injectable, Logger } from '@nestjs/common';
import { RoomScheduleService } from './room-schedule.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RoomScheduleCronService {
  private readonly logger = new Logger(RoomScheduleCronService.name);

  constructor(
    private readonly roomScheduleService: RoomScheduleService,
  ) {}

  /**
   * Auto-mark completed schedules
   * Runs every 15 minutes to check and mark completed schedules
   * A schedule is marked as COMPLETED when:
   * - work_date is today or in the past
   * - Both actual_start_time and actual_end_time are set
   * - If work_date is today, actual_end_time has passed
   * - Status is SCHEDULED or CONFIRMED
   */
  @Cron('*/15 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoMarkCompleted() {
    this.logger.debug('Running auto-mark completed schedules check');

    try {
      const result = await this.roomScheduleService.autoMarkCompletedSchedules();
      if (result.updatedCount > 0) {
        this.logger.log(
          `✅ Auto-marked ${result.updatedCount} schedules as COMPLETED`
        );

        result.schedules.forEach((schedule) => {
          this.logger.log(
            `✓ Marked COMPLETED: Schedule ${schedule.schedule_id} - Room: ${schedule.room_id} - Date: ${schedule.work_date} - End Time: ${schedule.actual_end_time}`
          );
        });
      }
    } catch (error) {
      this.logger.error('❌ Error during auto-mark completed job:', error);
    }
  }
}

