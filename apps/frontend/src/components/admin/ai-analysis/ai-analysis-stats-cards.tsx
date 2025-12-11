"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Activity, CheckCircle, XCircle, FileText } from "lucide-react";

interface AiAnalysisStatsCardsProps {
  totalCount: number;
  completedCount?: number;
  failedCount?: number;
  pendingCount?: number;
  isLoading?: boolean;
}

export function AiAnalysisStatsCards({
  totalCount,
  completedCount = 0,
  failedCount = 0,
  pendingCount = 0,
  isLoading = false,
}: AiAnalysisStatsCardsProps) {
  const stats = [
    {
      title: "Total Analyses",
      value: totalCount,
      description: "All AI analyses",
      icon: Activity,
      isLoading,
    },
    {
      title: "Completed",
      value: completedCount,
      description: "Successfully completed",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Failed",
      value: failedCount,
      description: "Failed analyses",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Pending",
      value: pendingCount,
      description: "In progress",
      icon: FileText,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}

