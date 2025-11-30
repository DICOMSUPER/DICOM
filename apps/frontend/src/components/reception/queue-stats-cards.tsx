"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Clock, Users, CheckCircle } from "lucide-react";

interface QueueStatsCardsProps {
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

export function QueueStatsCards({
  waitingCount,
  inProgressCount,
  completedCount,
  totalCount,
  isLoading = false,
}: QueueStatsCardsProps) {
  const stats = [
    {
      title: "Waiting",
      value: waitingCount,
      description: "Currently in queue",
      icon: Clock,
      isLoading,
    },
    {
      title: "In Progress",
      value: inProgressCount,
      description: "Being treated",
      icon: Users,
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
      description: "All patients",
      icon: Clock,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}
