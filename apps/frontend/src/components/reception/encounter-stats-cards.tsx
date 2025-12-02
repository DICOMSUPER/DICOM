"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Stethoscope, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface EncounterStatsCardsProps {
  totalCountThisMonth: number;
  todayEncounter: number;
  todayStatEncounter: number;
  averageEncountersPerPatient: number;
  isLoading: boolean;
}

export function EncounterStatsCards({
  totalCountThisMonth,
  todayEncounter,
  todayStatEncounter,
  averageEncountersPerPatient,
  isLoading,
}: EncounterStatsCardsProps) {
  const stats = [
    {
      title: "Monthly Encounters",
      value: totalCountThisMonth,
      description: "New encounters in this month",
      icon: Stethoscope,
      isLoading,
    },
    {
      title: "Daily Encounters",
      value: todayEncounter,
      description: "All encounters created in today",
      icon: Clock,
      isLoading,
    },
    {
      title: "Today's Stat",
      value: todayStatEncounter,
      description: "Today encounter that priority are stats",
      icon: AlertCircle,
      isLoading,
    },
    {
      title: "Patients's Encounter",
      value: averageEncountersPerPatient.toFixed(2),
      description: "Average encounter per patient",
      icon: CheckCircle,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}
