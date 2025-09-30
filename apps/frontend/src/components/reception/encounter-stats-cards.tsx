"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Stethoscope, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface EncounterStatsCardsProps {
  totalCount: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  isLoading?: boolean;
}

export function EncounterStatsCards({
  totalCount,
  scheduledCount,
  inProgressCount,
  completedCount,
  isLoading = false,
}: EncounterStatsCardsProps) {
  const stats = [
    {
      title: "Total Encounters",
      value: totalCount,
      description: "All encounters",
      icon: Stethoscope,
      isLoading,
    },
    {
      title: "Scheduled",
      value: scheduledCount,
      description: "Awaiting treatment",
      icon: Clock,
      isLoading,
    },
    {
      title: "In Progress",
      value: inProgressCount,
      description: "Currently active",
      icon: AlertCircle,
      isLoading,
    },
    {
      title: "Completed",
      value: completedCount,
      description: "Finished encounters",
      icon: CheckCircle,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}
