"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Stethoscope, CheckCircle, XCircle, Activity } from "lucide-react";

interface ServiceStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  isLoading?: boolean;
}

export function ServiceStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  isLoading = false,
}: ServiceStatsCardsProps) {
  const stats = [
    {
      title: "Total Services",
      value: totalCount,
      description: "All registered services",
      icon: Stethoscope,
      isLoading,
    },
    {
      title: "Active Services",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Services",
      value: inactiveCount,
      description: "Currently inactive",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Service Activity",
      value: activeCount,
      description: "Active services",
      icon: Activity,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}

