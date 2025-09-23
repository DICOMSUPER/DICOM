"use client";

import { ReceptionStatsCards } from "./reception-stats-cards";
import { Clock, Users, CheckCircle, UserPlus } from "lucide-react";

interface AssignmentsStatsCardsProps {
  activeCount: number;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

export function AssignmentsStatsCards({
  activeCount,
  pendingCount,
  completedCount,
  totalCount,
  isLoading = false,
}: AssignmentsStatsCardsProps) {
  const stats = [
    {
      title: "Active",
      value: activeCount,
      description: "Currently assigned",
      icon: Users,
      isLoading,
    },
    {
      title: "Pending",
      value: pendingCount,
      description: "Awaiting assignment",
      icon: Clock,
      isLoading,
    },
    {
      title: "Completed",
      value: completedCount,
      description: "Finished today",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Total Today",
      value: totalCount,
      description: "All assignments",
      icon: UserPlus,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}
