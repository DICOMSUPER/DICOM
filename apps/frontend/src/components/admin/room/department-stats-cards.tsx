"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Building2, CheckCircle, XCircle, Users } from "lucide-react";

interface DepartmentStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalRooms: number;
  isLoading?: boolean;
}

export function DepartmentStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  totalRooms,
  isLoading = false,
}: DepartmentStatsCardsProps) {
  const stats = [
    {
      title: "Total Departments",
      value: totalCount,
      description: "All registered departments",
      icon: Building2,
      isLoading,
    },
    {
      title: "Active Departments",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Departments",
      value: inactiveCount,
      description: "Require attention",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Total Rooms",
      value: totalRooms,
      description: "Across all departments",
      icon: Users,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}
