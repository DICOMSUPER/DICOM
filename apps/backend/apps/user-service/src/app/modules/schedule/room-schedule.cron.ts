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
   * Auto-mark schedules as IN_PROGRESS when their actual start time is reached
   * Runs every minute (local time)
   */
  @Cron('*/1 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoMarkInProgress() {
    const result = await this.roomScheduleService.autoMarkInProgressSchedules();
    if (result.updatedCount > 0) {
      this.logger.log(
        `✅ Auto-marked ${result.updatedCount} schedules as IN_PROGRESS`
      );
    }
  }

  /**
   * Auto-mark completed schedules
   * Runs every 15 minutes to check and mark completed schedules
   * A schedule is marked as COMPLETED when:
   * - work_date is today or in the past
   * - Both actual_start_time and actual_end_time are set
   * - If work_date is today, actual_end_time has passed
   * - Status is SCHEDULED or IN_PROGRESS
   */
  @Cron('*/15 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoMarkCompleted() {
    this.logger.debug('Running auto-mark completed schedules check');

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
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
        return; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        retryCount++;

        // Check if it's a connection timeout or database connection error
        const isConnectionError = 
          error?.message?.includes('connection timeout') ||
          error?.message?.includes('Connection terminated') ||
          error?.message?.includes('ECONNREFUSED') ||
          error?.code === 'ECONNREFUSED' ||
          error?.code === 'ETIMEDOUT';

        if (isConnectionError && retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff, max 10s
          this.logger.warn(
            `⚠️ Database connection error (attempt ${retryCount}/${maxRetries}). Retrying in ${delay}ms...`,
            error?.message || error
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If not a connection error or max retries reached, log and exit
        this.logger.error(
          `❌ Error during auto-mark completed job (attempt ${retryCount}/${maxRetries}):`,
          error?.message || error,
          error?.stack
        );
        break;
      }
    }

    // If we exhausted all retries, log final error but don't crash
    if (retryCount >= maxRetries) {
      this.logger.error(
        `❌ Failed to complete auto-mark job after ${maxRetries} attempts. Will retry on next cron run.`,
        lastError?.message || lastError
      );
    }
  }
}

