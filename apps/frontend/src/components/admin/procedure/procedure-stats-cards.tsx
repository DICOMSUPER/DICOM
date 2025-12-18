"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Building2, CheckCircle, XCircle, Users } from "lucide-react";

interface RequestProcedureStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;

  isLoading?: boolean;
}

export function RequestProcedureStatsCards({
  totalCount,
  activeCount,
  inactiveCount,

  isLoading = false,
}: RequestProcedureStatsCardsProps) {
  const stats = [
    {
      title: "Total Procedures",
      value: totalCount,
      description: "All registered procedures",
      icon: Building2,
      isLoading,
    },
    {
      title: "Active Procedures",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Procedures",
      value: inactiveCount,
      description: "Require attention",
      icon: XCircle,
      isLoading,
    },

  ];

  return <ReceptionStatsCards stats={stats} />;
}
