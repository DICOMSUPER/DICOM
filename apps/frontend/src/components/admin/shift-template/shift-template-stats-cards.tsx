"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Clock, CheckCircle, XCircle, Sun, Sunset, Moon } from "lucide-react";

interface ShiftTemplateStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  morningCount: number;
  afternoonCount: number;
  nightCount: number;
  fullDayCount: number;
  isLoading?: boolean;
}

export function ShiftTemplateStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  morningCount,
  afternoonCount,
  nightCount,
  fullDayCount,
  isLoading = false,
}: ShiftTemplateStatsCardsProps) {
  const stats = [
    {
      title: "Total Templates",
      value: totalCount,
      description: "All shift templates",
      icon: Clock,
      isLoading,
    },
    {
      title: "Active Templates",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Templates",
      value: inactiveCount,
      description: "Currently inactive",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Morning Shifts",
      value: morningCount,
      description: "Morning shift templates",
      icon: Sun,
      isLoading,
    },
    {
      title: "Afternoon Shifts",
      value: afternoonCount,
      description: "Afternoon shift templates",
      icon: Sunset,
      isLoading,
    },
    {
      title: "Night Shifts",
      value: nightCount,
      description: "Night shift templates",
      icon: Moon,
      isLoading,
    },
    {
      title: "Full Day Shifts",
      value: fullDayCount,
      description: "Full day shift templates",
      icon: Clock,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}

