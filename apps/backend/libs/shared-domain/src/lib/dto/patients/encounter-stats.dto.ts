export class EncounterStatsDto {
  totalEncounters!: number;
  encountersByType!: Record<string, number>;
  encountersThisMonth!: number;
  averageEncountersPerPatient!: number;
}
