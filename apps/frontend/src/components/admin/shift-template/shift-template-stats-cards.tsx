"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Clock, CheckCircle, XCircle, Sun } from "lucide-react";

interface ShiftTemplateStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  morningCount: number;
  isLoading?: boolean;
}

export function ShiftTemplateStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  morningCount,
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
  ];

  return <ReceptionStatsCards stats={stats} />;
}

