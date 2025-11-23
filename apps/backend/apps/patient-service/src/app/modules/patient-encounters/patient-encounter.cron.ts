import { Injectable, Logger } from '@nestjs/common';
import { PatientEncounterService } from './patient-encounters.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PatientEncounterCronService {
  private readonly logger = new Logger(PatientEncounterCronService.name);

  constructor(
    private readonly patientEncounterService: PatientEncounterService
  ) {}

  @Cron('59 * * * *', {
    //hourly update to avoid missed
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoMarkLeaved() {
    this.logger.log('Starting auto-mark leaved encounters job');

    try {
      const result =
        await this.patientEncounterService.autoMarkLeavedEncounters();
      if (result.updatedCount > 0) {
        this.logger.log(
          `Auto-marked ${result.updatedCount} encounters as LEAVED`
        );

        result.encounters.forEach((encounter) => {
          this.logger.warn(
            `Marked LEAVED: Encounter ${encounter.id} - Patient: ${encounter.patient?.firstName} ${encounter.patient?.lastName} - Date: ${encounter.encounterDate}`
          );
        });
      } else {
        this.logger.log('No encounters to mark as leaved');
      }
    } catch (error) {
      this.logger.error('Error during auto-mark leaved job:', error);
    }
  }
}
