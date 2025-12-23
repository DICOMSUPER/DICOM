import { Injectable, Logger } from '@nestjs/common';
import { PatientEncounterService } from './patient-encounters.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PatientEncounterCronService {
  private readonly logger = new Logger(PatientEncounterCronService.name);

  constructor(
    private readonly patientEncounterService: PatientEncounterService
  ) {}

  // Run at 23:59 every day to cancel today's waiting encounters
  // @Cron('59 23 * * *', {
  //   timeZone: 'Asia/Ho_Chi_Minh',
  // })
  // async handleAutoMarkCancelledEndOfDay() {
  //   this.logger.log('Starting end-of-day auto-mark cancelled encounters job');

  //   try {
  //     const result =
  //       await this.patientEncounterService.autoMarkCancelledEncounters();
  //     if (result.updatedCount > 0) {
  //       this.logger.log(
  //         `End-of-day: Auto-marked ${result.updatedCount} WAITING encounters as CANCELLED`
  //       );

  //       result.encounters.forEach((encounter) => {
  //         this.logger.warn(
  //           `Marked CANCELLED: Encounter ${encounter.id} - Patient: ${encounter.patient?.firstName} ${encounter.patient?.lastName} - Date: ${encounter.encounterDate}`
  //         );
  //       });
  //     } else {
  //       this.logger.log('End-of-day: No waiting encounters to mark as cancelled');
  //     }
  //   } catch (error: any) {
  //     this.logger.error(
  //       'Error during end-of-day auto-mark cancelled job:',
  //       error?.message || error,
  //       error?.stack
  //     );
  //   }
  // }

  // Run hourly to catch missed encounters from previous days
  @Cron('59 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoMarkCancelled() {
    this.logger.log('Starting auto-mark cancelled encounters job');

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
      try {
        const result =
          await this.patientEncounterService.autoMarkCancelledEncounters();
        if (result.updatedCount > 0) {
          this.logger.log(
            `Auto-marked ${result.updatedCount} encounters as CANCELLED`
          );

          result.encounters.forEach((encounter) => {
            this.logger.warn(
              `Marked CANCELLED: Encounter ${encounter.id} - Patient: ${encounter.patient?.firstName} ${encounter.patient?.lastName} - Date: ${encounter.encounterDate}`
            );
          });
        } else {
          this.logger.log('No encounters to mark as cancelled');
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
          `❌ Error during auto-mark cancelled job (attempt ${retryCount}/${maxRetries}):`,
          error?.message || error,
          error?.stack
        );
        break;
      }
    }

    // If we exhausted all retries, log final error but don't crash
    if (retryCount >= maxRetries) {
      this.logger.error(
        `❌ Failed to complete auto-mark cancelled job after ${maxRetries} attempts. Will retry on next cron run.`,
        lastError?.message || lastError
      );
    }
  }
}
