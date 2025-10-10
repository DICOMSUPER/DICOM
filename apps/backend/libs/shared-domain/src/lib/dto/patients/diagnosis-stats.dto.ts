export class DiagnosisStatsDto {
  totalDiagnoses!: number;
  diagnosesByType!: Record<string, number>;
  diagnosesByStatus!: Record<string, number>;
  diagnosesBySeverity!: Record<string, number>;
  diagnosesThisMonth!: number;
  followupRequiredCount!: number;
}
